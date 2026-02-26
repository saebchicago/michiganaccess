import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory cache (per isolate, ~60 min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tables = url.searchParams.get("tables")?.split(",") || [];
    const geoType = url.searchParams.get("geoType") || "county";
    const geoFips = url.searchParams.get("geoFips") || "";
    const year = url.searchParams.get("year") || "2023";
    const dataset = url.searchParams.get("dataset") || "acs/acs5";

    if (tables.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'tables' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build variable list from table IDs
    // For profile tables (DP05, etc.) we fetch common variables
    // For detailed tables (B19013, etc.) we fetch _001E through a reasonable range
    const results: Record<string, unknown> = {};

    for (const table of tables) {
      const cacheKey = `${dataset}:${year}:${table}:${geoType}:${geoFips}`;
      const cached = cacheGet(cacheKey);
      if (cached) {
        results[table] = cached;
        continue;
      }

      // Build geography string
      let geoStr = "";
      const stateFips = "26"; // Michigan

      switch (geoType) {
        case "state":
          geoStr = `for=state:${stateFips}`;
          break;
        case "county":
          if (geoFips) {
            // geoFips should be 3-digit county code (e.g., "163" for Wayne)
            geoStr = `for=county:${geoFips}&in=state:${stateFips}`;
          } else {
            geoStr = `for=county:*&in=state:${stateFips}`;
          }
          break;
        case "place":
          geoStr = `for=place:${geoFips}&in=state:${stateFips}`;
          break;
        case "tract":
          // geoFips format: "countyFips:tractFips" or just countyFips for all tracts
          if (geoFips.includes(":")) {
            const [countyF, tractF] = geoFips.split(":");
            geoStr = `for=tract:${tractF}&in=state:${stateFips}+county:${countyF}`;
          } else {
            geoStr = `for=tract:*&in=state:${stateFips}+county:${geoFips}`;
          }
          break;
        case "zcta":
          geoStr = `for=zip%20code%20tabulation%20area:${geoFips}&in=state:${stateFips}`;
          break;
        default:
          geoStr = `for=county:*&in=state:${stateFips}`;
      }

      // Fetch variable list for table from Census API
      // Strategy: request NAME + key variables for the table
      const isProfile = table.startsWith("DP") || table.startsWith("S");
      const varPrefix = table;

      // Fetch up to 50 variables per table (covers most tables)
      // We'll request the variables group endpoint first
      let variables: string[] = [];

      if (isProfile) {
        // Profile tables use different variable naming
        variables = Array.from({ length: 30 }, (_, i) => {
          const num = String(i + 1).padStart(4, "0");
          return `${varPrefix}_${num}E`;
        });
      } else {
        // Detailed tables: B-tables
        variables = Array.from({ length: 50 }, (_, i) => {
          const num = String(i + 1).padStart(3, "0");
          return `${varPrefix}_${num}E`;
        });
        // Also request margin of error variables
        const moeVars = variables.map((v) => v.replace(/E$/, "M"));
        variables = [...variables, ...moeVars];
      }

      // Census API limits to ~50 variables per request, split if needed
      const chunks: string[][] = [];
      for (let i = 0; i < variables.length; i += 48) {
        chunks.push(variables.slice(i, i + 48));
      }

      let allData: Record<string, string | number | null> = {};
      let geoName = "";

      for (const chunk of chunks) {
        const varStr = ["NAME", ...chunk].join(",");
        const apiUrl = `https://api.census.gov/data/${year}/${dataset}?get=${varStr}&${geoStr}`;

        const resp = await fetch(apiUrl);
        if (!resp.ok) {
          // Some variables may not exist — try with fewer
          if (resp.status === 400) {
            // Try just the first 10 variables (most tables have at least these)
            const fallbackVars = chunk.slice(0, 10);
            const fallbackUrl = `https://api.census.gov/data/${year}/${dataset}?get=NAME,${fallbackVars.join(",")}&${geoStr}`;
            const fallbackResp = await fetch(fallbackUrl);
            if (fallbackResp.ok) {
              const fbData = await fallbackResp.json();
              if (fbData.length > 1) {
                const headers = fbData[0] as string[];
                const row = fbData[1] as (string | null)[];
                geoName = row[0] || "";
                for (let j = 1; j < headers.length; j++) {
                  const val = row[j];
                  allData[headers[j]] = val !== null ? (isNaN(Number(val)) ? val : Number(val)) : null;
                }
              }
            } else {
              await fallbackResp.text(); // consume body
            }
            continue;
          }
          await resp.text(); // consume body
          continue;
        }

        const data = await resp.json();
        if (data.length > 1) {
          const headers = data[0] as string[];
          // If multiple rows (all counties), return all; otherwise single row
          if (data.length === 2) {
            const row = data[1] as (string | null)[];
            geoName = row[0] || geoName;
            for (let j = 1; j < headers.length; j++) {
              const val = row[j];
              allData[headers[j]] = val !== null ? (isNaN(Number(val)) ? val : Number(val)) : null;
            }
          } else {
            // Multiple geographies — return array
            const rows = data.slice(1).map((row: (string | null)[]) => {
              const obj: Record<string, string | number | null> = {};
              for (let j = 0; j < headers.length; j++) {
                const val = row[j];
                obj[headers[j]] = val !== null ? (isNaN(Number(val)) ? val : Number(val)) : null;
              }
              return obj;
            });
            allData = { _multi: rows } as any;
          }
        }
      }

      const tableResult = { name: geoName, variables: allData };
      cache.set(cacheKey, { data: tableResult, ts: Date.now() });
      results[table] = tableResult;
    }

    return new Response(
      JSON.stringify({
        year: Number(year),
        dataset,
        geoType,
        geoFips,
        tables: results,
        source: "U.S. Census Bureau ACS",
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Census ACS proxy error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
