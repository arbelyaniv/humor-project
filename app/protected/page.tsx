import { redirect } from 'next/navigation';

import SignOutButton from '@/app/components/SignOutButton';
import VoteButtons from '@/app/components/VoteButtons';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isLoggedIn = !!user;

  const { data, error } = await supabase
    .from('captions')
    .select('id, content, like_count')
    .limit(50);

  const captions =
    data?.map((row) => ({
      id: row.id as string,
      content: row.content as string | null,
      likeCount: row.like_count as number,
    })) ?? [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Protected</h1>
      <p>Signed in as {user.email}</p>
      <SignOutButton />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Captions</h2>
        {error ? (
          <p>Could not load captions. Please try again.</p>
        ) : captions.length > 0 ? (
          <div className="space-y-3">
            <p>{captions.length} captions</p>
            {captions.map((caption) => (
              <div
                key={caption.id}
                className="border rounded p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p>{caption.content ?? 'No text'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Likes: {caption.likeCount}
                  </p>
                </div>
                <VoteButtons captionId={caption.id} disabled={!isLoggedIn} />
              </div>
            ))}
          </div>
        ) : (
          <p>No captions found.</p>
        )}
      </div>
    </div>
  );
}
