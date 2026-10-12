"use server";

import { ApiError, GoogleGenAI } from "@google/genai";
import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface JokeState {
  joke?: string;
  error?: string;
}

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash";
// Waits before each retry of the primary model; length = max retries.
const RETRY_DELAYS_MS = [500, 1000];
// Without a timeout an overloaded model can leave the request hanging.
const REQUEST_TIMEOUT_MS = 15000;

function errorStatus(e: unknown) {
  return e instanceof ApiError ? e.status : undefined;
}

function describeError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return `status=${errorStatus(e) ?? "none"} ${message.slice(0, 300)}`;
}

// 429 RESOURCE_EXHAUSTED / 503 UNAVAILABLE: worth retrying the same model.
function isRetryable(e: unknown) {
  const status = errorStatus(e);
  return status === 429 || status === 503;
}

// Timeouts are temporary too, but retrying the same slow model just makes
// the user wait longer, so they go straight to the fallback model.
function isTimeout(e: unknown) {
  return (
    errorStatus(e) === 504 ||
    (e instanceof Error &&
      (e.name === "AbortError" || e.name === "TimeoutError"))
  );
}

async function requestJoke(ai: GoogleGenAI, model: string, topic: string) {
  const response = await ai.models.generateContent({
    model,
    contents: topic,
    config: {
      systemInstruction:
        "The user's message is a topic. Write one short, funny joke about that topic. Reply with only the joke.",
    },
  });
  return response.text?.trim() ?? "";
}

async function generateJokeText(topic: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: REQUEST_TIMEOUT_MS },
  });

  for (let attempt = 0; ; attempt++) {
    try {
      return await requestJoke(ai, PRIMARY_MODEL, topic);
    } catch (e) {
      console.error(
        `Gemini ${PRIMARY_MODEL} attempt ${attempt + 1} failed: ${describeError(e)}`
      );
      // Permanent errors (bad API key, malformed request) fail immediately.
      if (!isRetryable(e) && !isTimeout(e)) throw e;
      if (isTimeout(e) || attempt >= RETRY_DELAYS_MS.length) break;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt])
      );
    }
  }

  console.warn(`Gemini falling back to ${FALLBACK_MODEL}`);
  try {
    return await requestJoke(ai, FALLBACK_MODEL, topic);
  } catch (e) {
    console.error(
      `Gemini fallback ${FALLBACK_MODEL} failed: ${describeError(e)}`
    );
    throw e;
  }
}

export async function generateJoke(
  _prevState: JokeState,
  formData: FormData
): Promise<JokeState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to generate a joke." };

  const topic = String(formData.get("topic") ?? "").trim();
  if (!topic) return { error: "Please enter a topic." };
  if (topic.length > 200) return { error: "Topic is too long." };

  let joke: string;
  try {
    joke = await generateJokeText(topic);
  } catch {
    return { error: "Could not generate a joke. Please try again." };
  }

  if (!joke) return { error: "Gemini returned an empty response." };

  const { error } = await supabase
    .from("generations")
    .insert({ user_id: user.id, prompt: topic, content: joke });

  if (error) {
    return { joke, error: `Joke was not saved: ${error.message}` };
  }

  refresh();
  return { joke };
}
