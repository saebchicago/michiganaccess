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
    url: "https://developer.nlr.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=ELEC&state=MI&limit=200",
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
    url: "https://services1.arcgis.com/FNjlrOFR0aGJ71Tg/arcgis/rest/services/Michigan_PFAS_Sites_and_Areas_of_Interest_PUBLIC_view/FeatureServer/1/query?where=1%3D1&outFields=Name,County,City,Type,SiteOrAoi,ResidentialWellsSampled,WebpageSite&f=geojson&outSR=4326&resultRecordCount=1000",
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
const CACHE_MAX_ENTRIES = 200;

// Map preserves insertion order, so the first key is the oldest entry.
function cacheSet(key: string, value: { data: unknown; ts: number }) {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

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
      "developer.nlr.gov",
      "api.nlr.gov",
    ];
    const isTrustedHost = (hostname: string) =>
      trustedDomains.some((d) => hostname === d || hostname.endsWith("." + d));
    if (!isTrustedHost(parsed.hostname)) {
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

    // Fetch upstream. Redirects are followed by hand so each hop is checked:
    // an allowlisted host may redirect within the trusted list (ArcGIS does
    // this between its own hosts) but must not bounce us anywhere else.
    const MAX_REDIRECTS = 3;
    let currentUrl = targetUrl;
    let response = await fetch(currentUrl, { headers: { Accept: "application/json" }, redirect: "manual" });
    for (let hop = 0; response.status >= 300 && response.status < 400; hop++) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      let next: URL | null = null;
      try {
        next = location ? new URL(location, currentUrl) : null;
      } catch {
        next = null;
      }
      if (hop >= MAX_REDIRECTS || !next || next.protocol !== "https:" || !isTrustedHost(next.hostname)) {
        console.error(`Upstream redirect refused for ${layer || customUrl}: ${response.status}`);
        return new Response(
          JSON.stringify({ error: "Upstream redirect refused", layer: layer ?? null, fetched_at: new Date().toISOString() }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      currentUrl = next.toString();
      response = await fetch(currentUrl, { headers: { Accept: "application/json" }, redirect: "manual" });
    }

    if (!response.ok) {
      console.error(`Upstream error for ${layer || customUrl}: ${response.status}`);
      // Surface the failure. Returning HTTP 200 with an empty FeatureCollection
      // made the UI render "no data" for what is actually an outage.
      return new Response(
        JSON.stringify({ error: `Upstream returned ${response.status}`, layer: layer ?? null, fetched_at: new Date().toISOString() }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data = await response.json();

    // Transform non-GeoJSON responses
    if (transform === "esriJson") {
      data = esriJsonToGeoJSON(data);
    } else if (transform === "nrelAfdc") {
      data = nrelAfdcToGeoJSON(data);
    }

    cacheSet(cacheKey, { data, ts: Date.now() });

    return new Response(
      JSON.stringify({ data, cached: false, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("ArcGIS proxy error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch data";
    return new Response(
      JSON.stringify({ error: msg, fetched_at: new Date().toISOString() }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
