import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
// CDC Open Data SODA API endpoints (free, no key required but app token recommended)
const CDC_ENDPOINTS: Record<string, string> = {
  // CDC PLACES: Local Data for Better Health (county-level)
  "places-county": "https://data.cdc.gov/resource/swc5-untb.json",
  // CDC Chronic Disease Indicators
  "chronic-indicators": "https://data.cdc.gov/resource/g4ie-h725.json",
  // CDC COVID Community Levels (historical)
  "covid-levels": "https://data.cdc.gov/resource/3nnm-4jni.json",
  // CDC Environmental Health
  "env-health": "https://data.cdc.gov/resource/cwsq-ngmh.json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const dataset = url.searchParams.get("dataset") || "places-county";
    const measure = url.searchParams.get("measure") || "";
    const limitRaw = Number(url.searchParams.get("limit") || "50");
    const limit = Math.min(Number.isFinite(limitRaw) ? Math.max(1, Math.floor(limitRaw)) : 50, 200);

    const endpoint = CDC_ENDPOINTS[dataset];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ 
          error: `Unknown dataset: ${dataset}. Available: ${Object.keys(CDC_ENDPOINTS).join(", ")}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize measure: allow only alphanumeric, spaces, hyphens, underscores
    const safeMeasure = measure.replace(/[^a-zA-Z0-9_\s\-]/g, "").slice(0, 100);

    // Build SODA query — state is hardcoded to Michigan only
    const baseWhere = "stateabbr='MI'";
    const params = new URLSearchParams({
      "$limit": String(limit),
      "$where": baseWhere,
    });

    if (safeMeasure) {
      params.set("$where", `${baseWhere} AND measure='${safeMeasure}'`);
    }

    const apiUrl = `${endpoint}?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CDC API error [${response.status}]:`, text.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "CDC API temporarily unavailable", 
          status: response.status,
          fallback: true,
          message: "Data loading… Please try again shortly."
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        results: data || [],
        count: Array.isArray(data) ? data.length : 0,
        source: "CDC Open Data (SODA API)",
        cached_at: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("CDC proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch CDC data", 
        details: String(error),
        fallback: true,
        message: "Data loading… Please try again shortly."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
