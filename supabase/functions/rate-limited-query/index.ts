import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter (per isolate lifetime)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

// Clean up old entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

const ALLOWED_TABLES = ["facilities", "providers", "community_resources", "financial_programs", "quality_metrics"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Periodic cleanup every request (cheap for small maps)
  cleanup();

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      }
    );
  }

  try {
    const url = new URL(req.url);
    const table = url.searchParams.get("table");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const filterColumn = url.searchParams.get("filter_column");
    const filterValue = url.searchParams.get("filter_value");

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing table parameter", allowed: ALLOWED_TABLES }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cap results to prevent bulk extraction
    const limit = Math.min(parseInt(limitParam || "50", 10), 100);
    const offset = parseInt(offsetParam || "0", 10);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from(table).select("*").range(offset, offset + limit - 1);

    if (filterColumn && filterValue) {
      // Only allow filtering on safe columns
      const safeColumns = ["facility_type", "resource_type", "program_type", "specialty", "county", "city"];
      if (safeColumns.includes(filterColumn)) {
        query = query.eq(filterColumn, filterValue);
      }
    }

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entry = rateLimitMap.get(clientIp);
    const remaining = entry ? Math.max(0, MAX_REQUESTS - entry.count) : MAX_REQUESTS;

    return new Response(JSON.stringify({ data, meta: { limit, offset, count: data?.length || 0 } }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(MAX_REQUESTS),
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
