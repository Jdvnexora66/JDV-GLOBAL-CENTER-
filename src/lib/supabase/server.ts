import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseConfig() {
  // Netlify currently provides the Vite-prefixed variables for this project,
  // while Next.js conventionally uses NEXT_PUBLIC_*.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY variables) in Netlify.',
    );
  }

  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'none',
              secure: true,
            })
          );
        } catch {
          // Server Component read-only context — expected
        }
      },
    },
  });
}
