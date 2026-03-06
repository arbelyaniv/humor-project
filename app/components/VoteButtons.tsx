'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VoteButtons({
  captionId,
  disabled,
}: {
  captionId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteValue: 1 | -1) => {
    setLoading(true);
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captionId, voteValue }),
    });

    if (res.ok) {
      setVoted(voteValue);
      router.refresh();
    }
    setLoading(false);
  };

  const isDisabled = disabled || loading;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => handleVote(1)}
        title="Funny"
        className={[
          'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          voted === 1
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill={voted === 1 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        Funny
      </button>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => handleVote(-1)}
        title="Not funny"
        className={[
          'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          voted === -1
            ? 'bg-red-100 border-red-400 text-red-700'
            : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill={voted === -1 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
        Not funny
      </button>
    </div>
  );
}
