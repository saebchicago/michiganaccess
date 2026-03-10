import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// These are the Supabase anon (publishable) credentials — intentionally public.
// The anon key has "role":"anon" in its JWT payload and is protected by Supabase
// Row Level Security on the server. Never use the service-role key here.
// Hardcoded fallbacks removed: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// in your .env.local (local dev) or Netlify environment variables (production).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
          "Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
        );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
