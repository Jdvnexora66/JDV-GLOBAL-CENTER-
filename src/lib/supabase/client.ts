import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient<any>> | null = null;

function getSupabaseConfig() {
  // Support both the Next.js and existing Netlify variable names.
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

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = getSupabaseConfig();
  browserClient = createBrowserClient(url, key, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return [];
        return document.cookie
          .split(';')
          .filter(Boolean)
          .map((cookie) => {
            const index = cookie.indexOf('=');
            return {
              name: cookie.slice(0, index).trim(),
              value: index >= 0 ? decodeURIComponent(cookie.slice(index + 1).trim()) : '',
            };
          });
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return;
        cookiesToSet.forEach(({ name, value, options }) => {
          const parts = [
            `${name}=${encodeURIComponent(value)}`,
            `Path=${options?.path ?? '/'}`,
            options?.maxAge != null ? `Max-Age=${options.maxAge}` : '',
            options?.domain ? `Domain=${options.domain}` : '',
            options?.sameSite ? `SameSite=${options.sameSite}` : 'SameSite=Lax',
            options?.secure ? 'Secure' : '',
          ].filter(Boolean);
          document.cookie = parts.join('; ');
        });
      },
    },
  });

  return browserClient;
}
