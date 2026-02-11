type SupabaseEnv = { url: string; anonKey: string };

function readEnvVar(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export function getServerSupabaseEnv(): SupabaseEnv {
  const url = readEnvVar('SUPABASE_URL') ?? readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey =
    readEnvVar('SUPABASE_ANON_KEY') ??
    readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    throw new Error(
      'Missing server Supabase env vars. Set SUPABASE_URL/SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }

  return { url, anonKey };
}
