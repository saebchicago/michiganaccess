import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ACS 5-year vintage this function requests. Mirrors src/config/acsVintage.ts
// in the app (edge functions deploy separately, so it cannot be imported).
// Keep both in step. ACS5_YEAR is the API path year, the period is 5 years ending then.
const ACS5_YEAR = 2024;
const ACS5_PERIOD = "2020-2024";

// Census encodes "no usable number" as negative sentinels in numeric columns.
// Small duplicate of src/lib/censusValue.ts (kept in sync by hand).
const CENSUS_SENTINEL_REASONS: Record<string, string> = {
  "-666666666": "Suppressed by Census: the estimate could not be computed or published under ACS rules",
  "-999999999": "Census withheld this value because the geographic sample was too small",
  "-888888888": "Not applicable or unavailable for this geography",
  "-222222222": "Margin of error not computed: too few sample observations",
  "-333333333": "Margin of error not computed: median falls in an open-ended interval",
};

/** Replace sentinel cells with null and record why, keyed "row:column". -555555555 in a margin column means controlled, MOE 0. */
function nullCensusSentinels(data: unknown): { rows: unknown; notes: Record<string, string> } {
  const notes: Record<string, string> = {};
  if (!Array.isArray(data) || data.length < 2) return { rows: data, notes };
  const header = data[0] as string[];
  const rows = [header];
  for (let i = 1; i < data.length; i++) {
    const row = (data[i] as (string | null)[]).map((cell, j) => {
      if (cell === null || cell === undefined || cell === "") {
        if (/^B\d/.test(header[j] ?? "")) notes[`${i - 1}:${header[j]}`] = "Missing from Census response";
        return null;
      }
      const key = String(cell);
      if (key === "-555555555" && /M$/.test(header[j] ?? "")) return "0";
      const reason = CENSUS_SENTINEL_REASONS[key];
      if (reason) {
        notes[`${i - 1}:${header[j]}`] = reason;
        return null;
      }
      return cell;
    });
    rows.push(row as unknown as string[]);
  }
  return { rows, notes };
}

// Michigan FIPS and county filters for HFH service area
const MI_STATE_FIPS = "26";
const HFH_COUNTY_FIPS = ["163", "125", "099", "075"]; // Wayne, Oakland, Macomb, Jackson
const COUNTY_IN = HFH_COUNTY_FIPS.map((f) => `'${f}'`).join(",");

type SourceDef = { url: string; label: string };

// Endpoints verified live 2026-09-10. The previous EPA `geodata.epa.gov`,
// FEMA `hazards.fema.gov/nri/arcgis` and `gis.michigan.gov` MapServer paths
// are all retired (404 / DNS failure), which is why every proxy call 502'd.
const SOURCES: Record<string, SourceDef> = {
  nri: {
    url:
      `https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query` +
      `?where=STATEFIPS%3D%27${MI_STATE_FIPS}%27+AND+COUNTYFIPS+IN+(${encodeURIComponent(COUNTY_IN)})` +
      `&outFields=TRACTFIPS,COUNTY,RISK_SCORE,RISK_RATNG,SOVI_SCORE,RESL_SCORE` +
      `&returnGeometry=false&returnCentroid=true&outSR=4326&f=json&resultRecordCount=2000`,
    label: "FEMA National Risk Index (census tracts)",
  },
  pfas: {
    url:
      `https://services1.arcgis.com/FNjlrOFR0aGJ71Tg/arcgis/rest/services/Michigan_PFAS_Sites_and_Areas_of_Interest_PUBLIC_view/FeatureServer/1/query` +
      `?where=1%3D1&outFields=OBJECTID,Name,County,City,Type,SiteOrAoi` +
      `&returnGeometry=true&outSR=4326&f=json&resultRecordCount=2000`,
    label: "EGLE PFAS Sites and Areas of Interest",
  },
  cso: {
    url:
      `https://services1.arcgis.com/FNjlrOFR0aGJ71Tg/arcgis/rest/services/Surface_Waters_Impacted_By_Combined_Sewer_Overflows/FeatureServer/3/query` +
      `?where=1%3D1&outFields=OBJECTID,ReceivingWaters,OriginatingFacility` +
      `&returnGeometry=true&outSR=4326&f=json&resultRecordCount=2000`,
    label: "EGLE Surface Waters Impacted by Combined Sewer Overflows",
  },
};

// EPA retired the public EJScreen services; no replacement endpoint exists.
// Report that explicitly instead of failing as a generic upstream error.
const RETIRED: Record<string, string> = {
  ejscreen:
    "EPA retired the public EJScreen map services; no live replacement endpoint is available.",
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { body: string; ts: number }>();

async function fetchUpstream(url: string): Promise<unknown> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "AccessMI-CHNA/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!resp.ok) throw new Error(`Upstream HTTP ${resp.status}`);
      const json = await resp.json();
      // ArcGIS reports failures inside an HTTP 200 body.
      if (json && typeof json === "object" && "error" in json) {
        const e = (json as { error: { message?: string; code?: number } }).error;
        throw new Error(`Upstream ArcGIS error ${e?.code ?? ""} ${e?.message ?? ""}`.trim());
      }
      return json;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };
  const url = new URL(req.url);
  const source = url.searchParams.get("source");

  // Census ACS handled separately (needs API key)
  if (source === "census-acs") {
    const censusKey = Deno.env.get("CENSUS_API_KEY");
    if (!censusKey) {
      return new Response(JSON.stringify({ error: "CENSUS_API_KEY not set" }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    const counties = HFH_COUNTY_FIPS.join(",");
    const censusUrl =
      `https://api.census.gov/data/${ACS5_YEAR}/acs/acs5` +
      `?get=NAME,B08201_001E,B08201_002E,B25044_001E,B25044_003E,B08303_001E,B08303_013E` +
      `&for=tract:*&in=state:${MI_STATE_FIPS}+county:${counties}&key=${censusKey}`;

    try {
      const resp = await fetch(censusUrl, { signal: AbortSignal.timeout(20000) });
      const text = await resp.text();
      if (!resp.ok) throw new Error(`Census API ${resp.status}`);
      if (/invalid key/i.test(text)) {
        return new Response(
          JSON.stringify({
            error: "CENSUS_API_KEY is invalid or expired",
            hint: "Request a new key at https://api.census.gov/data/key_signup.html",
          }),
          { status: 502, headers: JSON_HEADERS },
        );
      }
      const { rows, notes } = nullCensusSentinels(JSON.parse(text));
      return new Response(
        JSON.stringify({
          data: rows,
          // Census error codes are returned as null with a reason, never as numbers.
          notes,
          acs_period: ACS5_PERIOD,
          fetched_at: new Date().toISOString(),
        }),
        { headers: JSON_HEADERS },
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: JSON_HEADERS,
      });
    }
  }

  if (source && source in RETIRED) {
    return new Response(
      JSON.stringify({ error: RETIRED[source], unavailable: true, source }),
      { status: 503, headers: JSON_HEADERS },
    );
  }

  if (!source || !(source in SOURCES)) {
    return new Response(
      JSON.stringify({
        error: "source must be one of: nri, pfas, cso, census-acs",
      }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const { url: targetUrl, label } = SOURCES[source];

  const cached = cache.get(source);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return new Response(cached.body, {
      headers: { ...JSON_HEADERS, "X-Cache": "hit" },
    });
  }

  try {
    const data = await fetchUpstream(targetUrl);
    const body = JSON.stringify({
      data,
      source: label,
      fetched_at: new Date().toISOString(),
    });
    cache.set(source, { body, ts: Date.now() });
    return new Response(body, { headers: JSON_HEADERS });
  } catch (err) {
    // Serve stale cache rather than breaking the map on a transient outage.
    if (cached) {
      return new Response(cached.body, {
        headers: { ...JSON_HEADERS, "X-Cache": "stale" },
      });
    }
    return new Response(JSON.stringify({ error: String(err), source }), {
      status: 502,
      headers: JSON_HEADERS,
    });
  }
});
