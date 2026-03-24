import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// These are the Supabase anon (publishable) credentials — intentionally public.
// The anon key has "role":"anon" in its JWT payload and is protected by Supabase
// Row Level Security on the server. Never use the service-role key here.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local (local
// dev) or Netlify environment variables (production).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    "";

/** True when Supabase credentials are configured and the client is usable. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
    console.warn(
        "[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — " +
        "Supabase features will be unavailable. Set them in .env.local or Netlify env vars."
    );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

// Create a real client when configured; otherwise create a placeholder that
// points at a dummy URL. Callers should check `supabaseConfigured` before
// making requests, but even if they don't the client will simply return
// network errors instead of crashing the entire application at import time.
export const supabase: SupabaseClient<Database> = supabaseConfigured
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createClient<Database>("https://placeholder.supabase.co", "placeholder");
