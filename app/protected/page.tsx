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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Protected</h1>
      <p>Signed in as {user.email}</p>
      <SignOutButton />
    </div>
  );
}
