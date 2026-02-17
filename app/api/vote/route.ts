import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { captionId, voteValue } = body as {
    captionId: string;
    voteValue: number;
  };

  if (!captionId || (voteValue !== 1 && voteValue !== -1)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Verify profile exists (profiles.id matches auth.users.id per FK constraint)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Check for existing vote
  const { data: existingVote } = await supabase
    .from('caption_votes')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('caption_id', captionId)
    .single();

  if (existingVote) {
    // Update existing vote
    const { error: updateError } = await supabase
      .from('caption_votes')
      .update({
        vote_value: voteValue,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq('id', existingVote.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update vote' },
        { status: 500 }
      );
    }
  } else {
    // Insert new vote
    const { error: insertError } = await supabase
      .from('caption_votes')
      .insert({
        vote_value: voteValue,
        profile_id: profile.id,
        caption_id: captionId,
        created_datetime_utc: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert vote' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
