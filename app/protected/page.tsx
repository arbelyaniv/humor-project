export const dynamic = 'force-dynamic';

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
    .select(`
      id,
      content,
      like_count,
      image_id,
      images!captions_image_id_fkey!inner (
        id,
        url
      )
    `)
    .or(
      'and(is_public.eq.true,url.not.is.null),and(is_common_use.eq.true,url.not.is.null)',
      { referencedTable: 'images' }
    )
    .limit(500);

  const poolSize = data?.length ?? 0;

  // Fisher-Yates shuffle
  const pool = data ? [...data] : [];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const captions = pool.slice(0, 50).map((row) => {
    const imgRaw = row.images as unknown as { id: string; url: string } | { id: string; url: string }[] | null;
    const img = Array.isArray(imgRaw) ? imgRaw[0] ?? null : imgRaw;
    return {
      id: row.id as string,
      content: row.content as string | null,
      likeCount: row.like_count as number,
      imageUrl: img?.url ?? null,
    };
  });

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
            <p className="text-sm text-gray-500">
              Random sample of {captions.length} from pool of {poolSize}
            </p>
            {captions.map((caption) => (
              <div
                key={caption.id}
                className="border rounded p-4 flex items-start gap-4"
              >
                {caption.imageUrl ? (
                  <img
                    src={caption.imageUrl}
                    alt=""
                    className="w-32 h-32 object-cover rounded shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded shrink-0 flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
                <div className="flex-1 flex items-start justify-between gap-4">
                  <div>
                    <p>{caption.content ?? 'No text'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Likes: {caption.likeCount}
                    </p>
                  </div>
                  <VoteButtons captionId={caption.id} disabled={!isLoggedIn} />
                </div>
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
