import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";
import ProfileForm from "@/app/components/ProfileForm";
import JokeGenerator from "@/app/components/JokeGenerator";
import VoteButtons from "@/app/components/VoteButtons";

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

  const { data: generations, error: generationsError } = await supabase
    .from("generations")
    .select("id, prompt, content")
    .order("created_at", { ascending: false });

  const { data: votes } = await supabase
    .from("votes")
    .select("generation_id, vote");

  const voteCounts = new Map<string, { up: number; down: number }>();
  for (const v of votes ?? []) {
    const counts = voteCounts.get(v.generation_id) ?? { up: 0, down: 0 };
    if (v.vote === 1) counts.up++;
    else if (v.vote === -1) counts.down++;
    voteCounts.set(v.generation_id, counts);
  }

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

      {user && <JokeGenerator />}

      <h1 className="text-2xl font-bold mb-4">Jokes</h1>
      {generationsError ? (
        <p className="text-red-600 mb-8">{generationsError.message}</p>
      ) : (
        <ul className="space-y-4 mb-8 max-w-xl">
          {generations?.map((gen) => {
            const counts = voteCounts.get(gen.id) ?? { up: 0, down: 0 };
            return (
              <li key={gen.id} className="rounded border p-3">
                <p className="whitespace-pre-wrap">{gen.content}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Topic: {gen.prompt}
                </p>
                <p className="mt-1 text-sm">
                  👍 {counts.up} · 👎 {counts.down}
                </p>
                {user && <VoteButtons generationId={gen.id} />}
              </li>
            );
          })}
        </ul>
      )}

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
