import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CMS Open Data API endpoints (free, no key required)
const CMS_ENDPOINTS: Record<string, string> = {
  hospitals: "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0",
  "hospital-ratings": "https://data.cms.gov/provider-data/api/1/datastore/query/xcdc-v8bm/0",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const dataset = url.searchParams.get("dataset") || "hospitals";
    const state = url.searchParams.get("state") || "MI";
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);
    const offset = Number(url.searchParams.get("offset") || "0");

    const endpoint = CMS_ENDPOINTS[dataset];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Unknown dataset: ${dataset}. Available: ${Object.keys(CMS_ENDPOINTS).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = {
      conditions: [
        { property: "state", value: state, operator: "=" }
      ],
      limit,
      offset,
      sort: { property: "hospital_name", order: "asc" },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CMS API error [${response.status}]:`, text);
      return new Response(
        JSON.stringify({ error: "CMS API temporarily unavailable", status: response.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        results: data.results || [],
        count: data.count || 0,
        source: "CMS Open Data",
        cached_at: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error("CMS proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch CMS data", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
