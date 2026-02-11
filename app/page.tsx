import Link from 'next/link';

import SignOutButton from '@/app/components/SignOutButton';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Home</h1>
      {!user ? (
        <div className="space-y-2">
          <p>You are signed out.</p>
          <Link href="/login">Sign in with Google</Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p>Signed in as {user.email}</p>
          <Link href="/protected">Go to protected</Link>
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
