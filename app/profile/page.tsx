import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/app/components/ProfileForm";
import AvatarUpload from "@/app/components/AvatarUpload";
import SignOutButton from "@/app/components/SignOutButton";

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
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <SignOutButton />
      </div>

      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <AvatarUpload avatarUrl={profile?.avatar_url} />

      <ProfileForm
        firstName={profile?.first_name}
        lastName={profile?.last_name}
      />
    </div>
  );
}
