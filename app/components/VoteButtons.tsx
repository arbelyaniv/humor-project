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
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="generation_id" value={generationId} />
      <button
        type="submit"
        name="vote"
        value="1"
        disabled={pending}
        className="btn btn-secondary px-3.5 py-1.5"
      >
        👍 Upvote
      </button>
      <button
        type="submit"
        name="vote"
        value="-1"
        disabled={pending}
        className="btn btn-secondary px-3.5 py-1.5"
      >
        👎 Downvote
      </button>
      {state.message && (
        <span aria-live="polite" className="text-sm text-danger">
          {state.message}
        </span>
      )}
    </form>
  );
}
