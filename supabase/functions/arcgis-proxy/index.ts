import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ArcGIS REST endpoint catalog — all publicly accessible, no API key required
const ENDPOINTS: Record<string, string> = {
  // Michigan county boundaries (Census Bureau via ArcGIS Online)
  "county-boundaries":
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer/0/query?where=STATE_NAME%3D%27Michigan%27&outFields=NAME,POPULATION,SQMI&f=geojson&outSR=4326&returnGeometry=true",

  // MDOT work zones / road closures
  "mdot-workzones":
    "https://gis.michigan.opendata.arcgis.com/datasets/mdot-work-zones/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326&resultRecordCount=200",

  // EGLE air quality monitoring sites
  "egle-air":
    "https://gis.michigan.opendata.arcgis.com/datasets/egle-air-quality-monitoring/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326",

// EV charging stations (public data)
  "ev-stations":
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Alternative_Fueling_Stations/FeatureServer/0/query?where=State%3D%27MI%27+AND+Fuel_Type%3D%27ELEC%27&outFields=Station_Name,Street_Address,City,ZIP,EV_Level2_EVSE_Num,EV_DC_Fast_Count,EV_Network,Latitude,Longitude&f=geojson&outSR=4326&resultRecordCount=500",

  // DDOT bus routes (Detroit Department of Transportation — City of Detroit Open Data)
  "ddot-routes":
    "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DDOT_Bus_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326",

  // CATA bus routes (Capital Area Transportation Authority - Lansing)
  "cata-routes":
    "https://services1.arcgis.com/wQMxFeIlJVMTiZgV/ArcGIS/rest/services/CATA_Bus_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326",
};

// In-memory cache with 1-hour TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const layer = url.searchParams.get("layer");
    const customUrl = url.searchParams.get("url"); // allow arbitrary ArcGIS endpoint

    if (!layer && !customUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing 'layer' or 'url' parameter",
          available_layers: Object.keys(ENDPOINTS),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUrl = customUrl || ENDPOINTS[layer!];
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: `Unknown layer: ${layer}`, available_layers: Object.keys(ENDPOINTS) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL is from trusted ArcGIS domains
    const parsed = new URL(targetUrl);
    const trustedDomains = [
      "services.arcgis.com",
      "gis.michigan.opendata.arcgis.com",
      "gisago.mcgi.state.mi.us",
      "gis-michigan.opendata.arcgis.com",
      "services1.arcgis.com",
      "services2.arcgis.com",
      "data.detroitmi.gov",
      "gis.ridecata.com",
    ];
    if (!trustedDomains.some((d) => parsed.hostname.endsWith(d))) {
      return new Response(
        JSON.stringify({ error: "URL domain not in trusted ArcGIS list" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache
    const cacheKey = targetUrl;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify({ data: cached.data, cached: true, cached_at: new Date(cached.ts).toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch from ArcGIS
    const response = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`ArcGIS returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    cache.set(cacheKey, { data, ts: Date.now() });

    return new Response(
      JSON.stringify({ data, cached: false, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ArcGIS proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch ArcGIS data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
