"use client";

import { useActionState } from "react";
import { voteOnGeneration, type VoteState } from "@/app/actions/vote";

const initialState: VoteState = {};

export default function VoteButtons({
  generationId,
}: {
  generationId: string;
}) {
  const [state, formAction, pending] = useActionState(
    voteOnGeneration,
    initialState
  );

  return (
    <form action={formAction} className="mt-2 flex items-center gap-2">
      <input type="hidden" name="generation_id" value={generationId} />
      <button
        type="submit"
        name="vote"
        value="1"
        disabled={pending}
        className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
      >
        👍 Upvote
      </button>
      <button
        type="submit"
        name="vote"
        value="-1"
        disabled={pending}
        className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
      >
        👎 Downvote
      </button>
      {state.message && (
        <span aria-live="polite" className="text-sm text-red-600">
          {state.message}
        </span>
      )}
    </form>
  );
}
