"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface VoteState {
  message?: string;
}

export async function voteOnGeneration(
  _prevState: VoteState,
  formData: FormData
): Promise<VoteState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { message: "You must be signed in to vote." };

  const generationId = String(formData.get("generation_id") ?? "");
  const vote = Number(formData.get("vote"));
  if (!generationId || (vote !== 1 && vote !== -1)) {
    return { message: "Invalid vote." };
  }

  const { error } = await supabase
    .from("votes")
    .insert({ user_id: user.id, generation_id: generationId, vote });

  if (error) {
    // 23505 = unique violation on (user_id, generation_id)
    if (error.code === "23505") {
      return { message: "You already voted on this joke." };
    }
    return { message: `Could not save vote: ${error.message}` };
  }

  refresh();
  return {};
}
