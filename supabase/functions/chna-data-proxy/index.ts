import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Michigan FIPS and county filters for HFH service area
const MI_STATE_FIPS = "26";
const HFH_COUNTY_FIPS = ["163", "125", "099", "075"]; // Wayne, Oakland, Macomb, Jackson

// ArcGIS query params shared across EGLE/FEMA services
const ARCGIS_JSON = "&f=json&resultRecordCount=2000&outFields=*";

const SOURCES: Record<string, { url: string; label: string }> = {
  ejscreen: {
    url: `https://geodata.epa.gov/arcgis/rest/services/OA/EJScreen/MapServer/7/query?where=ST_ABBREV%3D%27MI%27+AND+CNTY_FIPS+IN+('${HFH_COUNTY_FIPS.map((f) => MI_STATE_FIPS + f).join("','")}')${ARCGIS_JSON}&geometryType=esriGeometryPolygon&returnGeometry=true`,
    label: "EJScreen 2.32 (EPA)",
  },
  nri: {
    url: `https://hazards.fema.gov/nri/arcgis/rest/services/NRI/NRI_Tracts/MapServer/0/query?where=STATEFIPS%3D%27${MI_STATE_FIPS}%27+AND+COUNTYFIPS+IN+('${HFH_COUNTY_FIPS.map((f) => MI_STATE_FIPS + f).join("','")}')${ARCGIS_JSON}`,
    label: "FEMA National Risk Index",
  },
  pfas: {
    url: `https://gis.michigan.gov/arcgis/rest/services/Environment/EGLE_PFAS/MapServer/0/query?where=1%3D1${ARCGIS_JSON}&returnGeometry=true`,
    label: "EGLE PFAS Sites",
  },
  cso: {
    url: `https://gis.michigan.gov/arcgis/rest/services/Environment/EGLE_WaterInfrastructure/MapServer/0/query?where=OUTFALL_TYPE%3D%27CSO%27${ARCGIS_JSON}&returnGeometry=true`,
    label: "EGLE CSO Outfalls",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const url = new URL(req.url);
  const source = url.searchParams.get("source");

  // Census ACS handled separately (needs API key)
  if (source === "census-acs") {
    const censusKey = Deno.env.get("CENSUS_API_KEY");
    if (!censusKey) {
      return new Response(JSON.stringify({ error: "CENSUS_API_KEY not set" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const counties = HFH_COUNTY_FIPS.join(",");
    const censusUrl =
      `https://api.census.gov/data/2022/acs/acs5` +
      `?get=NAME,B08201_001E,B08201_002E,B25044_001E,B25044_003E,B08303_001E,B08303_013E` +
      `&for=tract:*&in=state:${MI_STATE_FIPS}+county:${counties}&key=${censusKey}`;

    try {
      const resp = await fetch(censusUrl);
      if (!resp.ok) throw new Error(`Census API ${resp.status}`);
      const data = await resp.json();
      return new Response(
        JSON.stringify({ data, fetched_at: new Date().toISOString() }),
        {
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
  }

  if (!source || !(source in SOURCES)) {
    return new Response(
      JSON.stringify({
        error: "source must be one of: ejscreen, nri, pfas, cso, census-acs",
      }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  const { url: targetUrl, label } = SOURCES[source];

  try {
    const resp = await fetch(targetUrl, {
      headers: { "User-Agent": "AccessMI-CHNA/1.0" },
    });
    if (!resp.ok) throw new Error(`Upstream ${resp.status} from ${source}`);
    const data = await resp.json();
    return new Response(
      JSON.stringify({
        data,
        source: label,
        fetched_at: new Date().toISOString(),
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
