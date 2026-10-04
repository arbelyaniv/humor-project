"use server";

import { GoogleGenAI } from "@google/genai";
import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface JokeState {
  joke?: string;
  error?: string;
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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: topic,
      config: {
        systemInstruction:
          "The user's message is a topic. Write one short, funny joke about that topic. Reply with only the joke.",
      },
    });
    joke = response.text?.trim() ?? "";
  } catch (e) {
    console.error("Gemini request failed:", e);
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
