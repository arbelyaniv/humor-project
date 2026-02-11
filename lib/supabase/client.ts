import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  if (typeof window === 'undefined') {
    throw new Error('createSupabaseBrowserClient must be called in the browser');
  }
  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser client missing url/anonKey (pass NEXT_PUBLIC vars from a client component).'
    );
  }
  return createBrowserClient(url, anonKey);
}
