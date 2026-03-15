const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Endpoint catalog – all publicly accessible
const ENDPOINTS: Record<string, { url: string; transform?: string }> = {
  "county-boundaries": {
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer/0/query?where=STATE_NAME%3D%27Michigan%27&outFields=NAME,POPULATION,SQMI&f=geojson&outSR=4326&returnGeometry=true",
  },
  "mdot-workzones": {
    url: "https://mdotgis.state.mi.us/arcgis/rest/services/Widget/NextGenPrFinderPub/FeatureServer/275/query?where=1%3D1&outFields=*&f=geojson&outSR=4326&resultRecordCount=200",
  },
  "egle-air": {
    url: "https://utility.arcgis.com/usrsvcs/servers/7667046c1a724cebaf153ec1336f74f4/rest/services/EGLE/AirMonitoring/MapServer/0/query?where=1%3D1&outFields=SiteName,MonitorType,AqsId,StationAddress&f=json&outSR=4326",
    transform: "esriJson",
  },
  "ev-stations": {
    url: "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=ELEC&state=MI&limit=200",
    transform: "nrelAfdc",
  },
  "ddot-routes": {
    url: "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DDOT_Bus_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&outSR=4326",
  },
  "cata-routes": {
    // Lansing CATA doesn't have a public ArcGIS FeatureServer; placeholder returns empty
    url: "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DDOT_Bus_Routes/FeatureServer/0/query?where=1%3D0&outFields=*&f=geojson&outSR=4326",
  },
  "pfas-sites": {
    url: "https://services1.arcgis.com/VdSAmGfE7jMMbR2h/arcgis/rest/services/PFAS_Sites_Public/FeatureServer/0/query?where=1%3D1&outFields=Site_Name,County,Site_Type,Investigation_Status,City&f=geojson&outSR=4326&resultRecordCount=500",
  },
};

// Convert ESRI JSON (MapServer) to GeoJSON
function esriJsonToGeoJSON(data: any) {
  const features = (data.features || []).map((f: any) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [f.geometry?.x ?? 0, f.geometry?.y ?? 0],
    },
    properties: f.attributes || {},
  }));
  return { type: "FeatureCollection", features };
}

// Convert NREL AFDC JSON to GeoJSON
function nrelAfdcToGeoJSON(data: any) {
  const stations = data.fuel_stations || [];
  const features = stations.map((s: any) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [s.longitude, s.latitude],
    },
    properties: {
      Station_Name: s.station_name,
      Street_Address: s.street_address,
      City: s.city,
      ZIP: s.zip,
      EV_Level2_EVSE_Num: s.ev_level2_evse_num,
      EV_DC_Fast_Count: s.ev_dc_fast_num,
      EV_Network: s.ev_network,
      EV_Connector_Types: s.ev_connector_types?.join(", ") || "",
      Access: s.access_code,
      Status: s.status_code,
    },
  }));
  return { type: "FeatureCollection", features };
}

// In-memory cache with 1-hour TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const layer = url.searchParams.get("layer");
    const customUrl = url.searchParams.get("url");

    if (!layer && !customUrl) {
      return new Response(
        JSON.stringify({ error: "Missing 'layer' or 'url' parameter", available_layers: Object.keys(ENDPOINTS) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endpoint = layer ? ENDPOINTS[layer] : null;
    const targetUrl = customUrl || endpoint?.url;
    const transform = endpoint?.transform;

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: `Unknown layer: ${layer}`, available_layers: Object.keys(ENDPOINTS) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate domain
    const parsed = new URL(targetUrl);
    const trustedDomains = [
      "services.arcgis.com",
      "services1.arcgis.com",
      "services2.arcgis.com",
      "utility.arcgis.com",
      "mdotgis.state.mi.us",
      "mdotjboss.state.mi.us",
      "gisagoegle.state.mi.us",
      "gis-michigan.opendata.arcgis.com",
      "gis.michigan.opendata.arcgis.com",
      "data.detroitmi.gov",
      "gis.ridecata.com",
      "developer.nrel.gov",
    ];
    if (!trustedDomains.some((d) => parsed.hostname === d || parsed.hostname.endsWith("." + d))) {
      return new Response(
        JSON.stringify({ error: "URL domain not in trusted list" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache
    const cacheKey = targetUrl;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(
        JSON.stringify({ data: cached.data, cached: true, cached_at: new Date(cached.ts).toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch upstream
    const response = await fetch(targetUrl, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      console.error(`Upstream error for ${layer || customUrl}: ${response.status}`);
      const empty = { type: "FeatureCollection", features: [] };
      return new Response(
        JSON.stringify({ data: empty, cached: false, error: `Upstream returned ${response.status}`, fetched_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data = await response.json();

    // Transform non-GeoJSON responses
    if (transform === "esriJson") {
      data = esriJsonToGeoJSON(data);
    } else if (transform === "nrelAfdc") {
      data = nrelAfdcToGeoJSON(data);
    }

    cache.set(cacheKey, { data, ts: Date.now() });

    return new Response(
      JSON.stringify({ data, cached: false, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ArcGIS proxy error:", error);
    const empty = { type: "FeatureCollection", features: [] };
    return new Response(
      JSON.stringify({ data: empty, cached: false, error: error.message || "Failed to fetch data", fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
