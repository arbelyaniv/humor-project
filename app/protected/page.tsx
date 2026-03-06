export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/app/components/Navbar';
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar email={user.email} showUploadLink />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caption Feed</h1>
            {!error && poolSize > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {captions.length} captions · {poolSize} in pool
              </p>
            )}
          </div>
          <Link
            href="/protected/upload"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </Link>
        </div>

        {/* Content */}
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
            <p className="text-red-700 font-medium">Could not load captions.</p>
            <p className="text-red-500 text-sm mt-1">Please refresh the page to try again.</p>
          </div>
        ) : captions.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-lg">No captions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {captions.map((caption) => (
              <div
                key={caption.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {caption.imageUrl ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={caption.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Caption body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <p className="text-gray-800 text-sm leading-relaxed flex-1">
                    {caption.content ?? (
                      <span className="text-gray-400 italic">No caption text</span>
                    )}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                    <span className="text-xs text-gray-400 shrink-0">
                      {caption.likeCount} {caption.likeCount === 1 ? 'like' : 'likes'}
                    </span>
                    <VoteButtons captionId={caption.id} disabled={!isLoggedIn} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
