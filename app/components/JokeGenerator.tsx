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
    <div className="max-w-sm mb-8">
      <h2 className="text-lg font-semibold mb-3">Joke Generator</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="topic"
          placeholder="Enter a topic"
          maxLength={200}
          required
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Generating..." : "Generate Joke"}
        </button>
      </form>
      <div aria-live="polite">
        {state.joke && (
          <p className="mt-4 rounded border p-3 whitespace-pre-wrap">
            {state.joke}
          </p>
        )}
        {state.error && <p className="mt-2 text-red-600">{state.error}</p>}
      </div>
    </div>
  );
}
