import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";
import ProfileForm from "@/app/components/ProfileForm";
import JokeGenerator from "@/app/components/JokeGenerator";
import VoteButtons from "@/app/components/VoteButtons";
import SiteHeader from "@/app/components/SiteHeader";

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
    <>
      <SiteHeader>
        {user ? (
          <>
            <span className="hidden max-w-40 truncate text-sm text-muted sm:inline">
              {needsProfile
                ? user.email
                : `${profile!.first_name} ${profile!.last_name}`}
            </span>
            <Link href="/profile" className="btn btn-ghost">
              Profile
            </Link>
            <SignOutButton />
          </>
        ) : (
          <SignInButton />
        )}
      </SiteHeader>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 sm:px-6">
        <section className="pt-10 pb-8 sm:pt-14">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            AI jokes, judged by humans.
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Pick a topic, get a joke, then vote on whether it actually lands.
          </p>
        </section>

        {needsProfile && <ProfileForm />}

        {user ? (
          <JokeGenerator />
        ) : (
          <section className="card mb-10 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold">Want to write and rate jokes?</h2>
              <p className="mt-1 text-sm text-muted">
                Sign in to generate your own and vote. Reading is free.
              </p>
            </div>
            <SignInButton />
          </section>
        )}

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Latest jokes
          </h2>
          {generationsError ? (
            <p className="alert-error">{generationsError.message}</p>
          ) : generations && generations.length === 0 ? (
            <div className="card border-dashed p-8 text-center shadow-none">
              <p className="text-2xl" aria-hidden>
                🦗
              </p>
              <p className="mt-2 font-medium">No jokes yet.</p>
              <p className="mt-1 text-sm text-muted">
                {user
                  ? "Enter a topic above to write the first one."
                  : "Sign in to write the first one."}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {generations?.map((gen) => {
                const counts = voteCounts.get(gen.id) ?? { up: 0, down: 0 };
                return (
                  <li key={gen.id} className="card p-5 sm:p-6">
                    <p className="text-lg leading-relaxed break-words whitespace-pre-wrap">
                      {gen.content}
                    </p>
                    <p className="mt-3 text-sm break-words text-muted">
                      <span className="font-medium text-foreground">
                        Topic:
                      </span>{" "}
                      {gen.prompt}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <div className="flex items-center gap-2">
                        <span className="pill">
                          <span aria-hidden>👍</span>
                          {counts.up}
                          <span className="sr-only">upvotes</span>
                        </span>
                        <span className="pill">
                          <span aria-hidden>👎</span>
                          {counts.down}
                          <span className="sr-only">downvotes</span>
                        </span>
                      </div>
                      {user ? (
                        <VoteButtons generationId={gen.id} />
                      ) : (
                        <span className="text-sm text-muted">
                          Sign in to vote
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Messages
          </h2>
          {error ? (
            <p className="alert-error">{error.message}</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {messages?.map((msg) => (
                <li key={msg.id}>{msg.text}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
