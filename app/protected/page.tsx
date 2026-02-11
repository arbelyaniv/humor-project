import { redirect } from 'next/navigation';

import SignOutButton from '@/app/components/SignOutButton';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase.from('images').select('*').limit(50);

  const images =
    data?.map((row) => ({
      id: (row as Record<string, unknown>).id,
      url: (row as Record<string, unknown>).url,
    })) ?? [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Protected</h1>
      <p>Signed in as {user.email}</p>
      <SignOutButton />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Images</h2>
        {error ? (
          <p>Could not load images. Please try again.</p>
        ) : images.length > 0 ? (
          <div className="space-y-2">
            <p>{images.length} rows</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={String(image.id ?? index)} className="border p-2">
                  {typeof image.url === 'string' && image.url.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt="" className="w-full h-auto" />
                  ) : (
                    <p>Missing image URL</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
}
