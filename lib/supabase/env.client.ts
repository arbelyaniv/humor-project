'use client';

type SupabaseEnv = { url: string; anonKey: string };

function readEnvVar(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export function getPublicSupabaseEnv(): SupabaseEnv {
  const url = readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    const debug = {
      hasNextPublicUrl: Boolean(url),
      hasNextPublicAnonKey: Boolean(anonKey),
      urlLen: url?.length ?? 0,
      anonKeyLen: anonKey?.length ?? 0,
    };
    throw new Error(
      `Missing public Supabase env vars. ${JSON.stringify(debug)}`
    );
  }

  return { url, anonKey };
}
