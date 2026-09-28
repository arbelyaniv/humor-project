"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();

  await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", user.id);

  refresh();
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file);

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  refresh();
}
