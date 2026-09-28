"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
    >
      Sign out
    </button>
  );
}
