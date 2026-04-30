import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/env";

const url = getSupabaseUrl();
const key = getSupabaseServiceRoleKey();

export const isSupabaseEnabled = Boolean(url && key);

let _client: SupabaseClient | null = null;

/**
 * Lazy server-side Supabase client (service role — bypasses RLS).
 * Throws only when actually called without env vars set, so dev/test
 * code paths that fall back to local JSON don't crash at import time.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }
  if (!_client) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
