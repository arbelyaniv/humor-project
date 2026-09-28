"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInButton() {
  async function handleSignIn() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
}
