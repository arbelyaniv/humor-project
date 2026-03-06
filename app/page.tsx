import Link from 'next/link';

import Navbar from '@/app/components/Navbar';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={user?.email} />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Almost Crackd
            </h1>
            <p className="mt-3 text-gray-500 text-lg">
              AI-generated captions for your images
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-gray-600">Sign in to vote and generate captions.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Sign in with Google
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Welcome back,{' '}
                <span className="font-medium text-gray-800">{user.email}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/protected"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Browse captions
                </Link>
                <Link
                  href="/protected/upload"
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors"
                >
                  Upload image
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
