'use client';

import { useRouter } from 'next/navigation';

export default function VoteButtons({
  captionId,
  disabled,
}: {
  captionId: string;
  disabled: boolean;
}) {
  const router = useRouter();

  const handleVote = async (voteValue: number) => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captionId, voteValue }),
    });

    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleVote(1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Upvote
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleVote(-1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Downvote
      </button>
    </div>
  );
}
