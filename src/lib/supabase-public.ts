import { createClient } from "@supabase/supabase-js";

// Server-only publishable client for public reads inside server functions/routes.
export function getSupabasePublicServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
