import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/app/components/ProfileForm";
import AvatarUpload from "@/app/components/AvatarUpload";
import SignOutButton from "@/app/components/SignOutButton";
import SiteHeader from "@/app/components/SiteHeader";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <SiteHeader>
        <Link href="/" className="btn btn-ghost">
          Home
        </Link>
        <SignOutButton />
      </SiteHeader>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 sm:px-6">
        <section className="pt-10 pb-8 sm:pt-14">
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm break-words text-muted">
            Signed in as {user.email}
          </p>
        </section>

        <AvatarUpload avatarUrl={profile?.avatar_url} />

        <ProfileForm
          firstName={profile?.first_name}
          lastName={profile?.last_name}
        />
      </main>
    </>
  );
}
