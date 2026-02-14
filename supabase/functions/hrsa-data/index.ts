import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const state = url.searchParams.get("state") || "MI";
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    const geoUrl = `https://data.hrsa.gov/data/geojson?datasetId=hc_sds&state=${state}`;

    const response = await fetch(geoUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("HRSA error:", response.status);
      return new Response(
        JSON.stringify({ error: "HRSA API unavailable", results: [], count: 0, fallback: true }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const results = data.features
      ? data.features.slice(0, limit).map((f: any) => ({
          name: f.properties?.Name || f.properties?.name || "Unknown",
          address: f.properties?.Address || f.properties?.address || "",
          city: f.properties?.City || f.properties?.city || "",
          state: f.properties?.State || state,
          zip: f.properties?.Zip || f.properties?.zip || "",
          phone: f.properties?.Phone || f.properties?.phone || "",
          lat: f.geometry?.coordinates?.[1],
          lng: f.geometry?.coordinates?.[0],
          type: "fqhc",
        }))
      : [];

    return new Response(
      JSON.stringify({ results, count: results.length, source: "HRSA Data Warehouse", cached_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" } }
    );
  } catch (error) {
    console.error("HRSA proxy error:", error);
    return new Response(
      JSON.stringify({ error: String(error), results: [], count: 0, fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
