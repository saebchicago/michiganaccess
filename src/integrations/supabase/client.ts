import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuYWhodGRiY2dlcGV6cnh3bmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjkxNjgsImV4cCI6MjA4NjQwNTE2OH0.PUg0QGZtdSYOM3VlO0-OOo9BwqJ4hgiMS2BpM2ZOCks";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
