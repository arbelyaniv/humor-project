import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";
import ProfileForm from "@/app/components/ProfileForm";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { first_name: string | null; last_name: string | null } | null =
    null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const needsProfile =
    user && (!profile?.first_name?.trim() || !profile?.last_name?.trim());

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, text");

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        {user ? (
          <>
            <span className="text-gray-700">
              {needsProfile
                ? user.email
                : `${profile!.first_name} ${profile!.last_name}`}
            </span>
            <Link href="/profile" className="text-blue-600 hover:underline">
              Profile
            </Link>
            <SignOutButton />
          </>
        ) : (
          <SignInButton />
        )}
      </div>

      {needsProfile && <ProfileForm />}

      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {error ? (
        <p className="text-red-600">{error.message}</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {messages?.map((msg) => (
            <li key={msg.id}>{msg.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
