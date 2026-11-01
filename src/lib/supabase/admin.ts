import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Privileged Supabase client. Never import this module from client components. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Supabase server credentials are not configured. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) as a server-only environment variable.');
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'X-Client-Info': 'jdv-pay-receipt-verification-server' } },
  });
}
