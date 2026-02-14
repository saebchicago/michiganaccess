import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
// HRSA Health Center API (free, no key required)
const HRSA_BASE = "https://data.hrsa.gov/api";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const dataset = url.searchParams.get("dataset") || "health-centers";
    const state = url.searchParams.get("state") || "MI";
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    let apiUrl: string;

    if (dataset === "health-centers") {
      // HRSA Health Center Service Delivery Sites
      apiUrl = `https://data.hrsa.gov/data/download?data=hc_sds&format=json`;
    } else if (dataset === "hpsa") {
      // Health Professional Shortage Areas
      apiUrl = `https://data.hrsa.gov/api/shortage-areas?state=${state}&type=primary-care&limit=${limit}`;
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown dataset: ${dataset}. Available: health-centers, hpsa` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Since the HRSA bulk download API may not support direct JSON queries,
    // we use the publicly available GeoJSON endpoint for health centers
    const geoUrl = `https://data.hrsa.gov/data/geojson?datasetId=hc_sds&state=${state}`;
    
    const response = await fetch(geoUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`HRSA API error [${response.status}]:`, text.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "HRSA API temporarily unavailable", 
          status: response.status,
          fallback: true,
          message: "Data loading… Please try again shortly."
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract features if GeoJSON
    const results = data.features
      ? data.features.slice(0, limit).map((f: any) => ({
          name: f.properties?.Name || f.properties?.name,
          address: f.properties?.Address || f.properties?.address,
          city: f.properties?.City || f.properties?.city,
          state: f.properties?.State || state,
          zip: f.properties?.Zip || f.properties?.zip,
          phone: f.properties?.Phone || f.properties?.phone,
          lat: f.geometry?.coordinates?.[1],
          lng: f.geometry?.coordinates?.[0],
          type: "fqhc",
        }))
      : Array.isArray(data) ? data.slice(0, limit) : [];

    return new Response(
      JSON.stringify({
        results,
        count: results.length,
        source: "HRSA Data Warehouse",
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
    console.error("HRSA proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch HRSA data", 
        details: String(error),
        fallback: true,
        message: "Data loading… Please try again shortly."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
