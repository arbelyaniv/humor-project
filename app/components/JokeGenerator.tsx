"use client";

import { useActionState } from "react";
import { generateJoke, type JokeState } from "@/app/actions/joke";

const initialState: JokeState = {};

export default function JokeGenerator() {
  const [state, formAction, pending] = useActionState(
    generateJoke,
    initialState
  );

  return (
    <section className="card mb-10 p-5 sm:p-6">
      <h2 className="font-semibold">Write a new joke</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Give the AI a topic and it will do its best.
      </p>
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="topic" className="sr-only">
          Topic
        </label>
        <input
          id="topic"
          name="topic"
          placeholder="Enter a topic, e.g. airports"
          maxLength={200}
          required
          className="input sm:flex-1"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary px-5 py-2.5"
        >
          {pending && (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {pending ? "Generating..." : "Generate Joke"}
        </button>
      </form>
      <div aria-live="polite">
        {state.joke && (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent-soft p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">
              Fresh joke
            </p>
            <p className="mt-2 text-lg leading-relaxed break-words whitespace-pre-wrap">
              {state.joke}
            </p>
          </div>
        )}
        {state.error && <p className="alert-error mt-3">{state.error}</p>}
      </div>
    </section>
  );
}
