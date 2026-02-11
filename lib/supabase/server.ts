import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

import { getServerSupabaseEnv } from '@/lib/supabase/env.server';

export async function createSupabaseServerClient() {
  const { url, anonKey } = getServerSupabaseEnv();
  const hdrs = await headers();
  const cookieStore = await cookies();
  const rawCookie = hdrs.get('cookie') ?? '';
  const parsedCookies = rawCookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      const name = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
      const rawValue = equalsIndex === -1 ? '' : part.slice(equalsIndex + 1);
      let value = rawValue;
      try {
        value = decodeURIComponent(rawValue);
      } catch {
        // Keep raw value if decoding fails.
      }
      return { name, value };
    });

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parsedCookies;
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // Ignore if called from a Server Component where cookies are read-only.
        }
      },
    },
  });
}
