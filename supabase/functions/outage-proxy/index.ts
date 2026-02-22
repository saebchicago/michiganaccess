import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// DTE Energy outage endpoint (public JSON)
const DTE_URL = "https://kubra.io/stormcenter/api/v1/stormcenters/39e6d9f3-fdea-4539-848f-b8631945da6f/views/74de8a50-3f45-4f5a-99c0-e57cf1ad6a50/currentState?preview=false";

// Consumers Energy outage endpoint (public JSON)
const CE_URL = "https://kubra.io/stormcenter/api/v1/stormcenters/4fbb3ad3-e01d-4d71-9575-d453769c1171/views/8ed2dfc8-2e3c-48e5-82c6-3ef9e12b43be/currentState?preview=false";

interface OutageZone {
  county: string;
  lat: number;
  lng: number;
  utility: "DTE" | "Consumers";
  customersAffected: number;
  customersServed: number;
  cause: string;
  estimatedRestore: string;
  severity: "none" | "low" | "moderate" | "high" | "critical";
}

function classifySeverity(affected: number, served: number): OutageZone["severity"] {
  if (affected === 0) return "none";
  const pct = (affected / served) * 100;
  if (pct >= 2) return "critical";
  if (pct >= 1) return "high";
  if (pct >= 0.3) return "moderate";
  return "low";
}

// Michigan county centroids for fallback mapping
const COUNTY_COORDS: Record<string, [number, number]> = {
  "Wayne": [42.33, -83.05], "Oakland": [42.58, -83.29], "Macomb": [42.67, -82.91],
  "Kent": [42.96, -85.67], "Genesee": [43.01, -83.69], "Washtenaw": [42.28, -83.74],
  "Ingham": [42.73, -84.56], "Ottawa": [42.98, -86.02], "Kalamazoo": [42.29, -85.59],
  "Saginaw": [43.42, -83.95], "Monroe": [41.92, -83.40], "Jackson": [42.25, -84.40],
  "Livingston": [42.60, -83.91], "St. Clair": [42.88, -82.52], "Berrien": [41.95, -86.42],
  "Calhoun": [42.32, -85.00], "Bay": [43.59, -83.89], "Muskegon": [43.23, -86.25],
  "Grand Traverse": [44.76, -85.62], "Marquette": [46.55, -87.40],
  "Lapeer": [43.05, -83.33], "Alpena": [45.06, -83.43],
};

// Customer base estimates per county per utility
const CUSTOMER_BASE: Record<string, { DTE?: number; Consumers?: number }> = {
  "Wayne": { DTE: 750000 }, "Oakland": { DTE: 520000 }, "Macomb": { DTE: 340000 },
  "Washtenaw": { DTE: 145000 }, "Livingston": { DTE: 80000 }, "Monroe": { DTE: 62000 },
  "St. Clair": { DTE: 68000 }, "Lapeer": { DTE: 38000 },
  "Kent": { Consumers: 280000 }, "Ottawa": { Consumers: 120000 }, "Kalamazoo": { Consumers: 110000 },
  "Ingham": { Consumers: 125000 }, "Genesee": { Consumers: 180000 }, "Saginaw": { Consumers: 85000 },
  "Bay": { Consumers: 48000 }, "Jackson": { Consumers: 65000 }, "Calhoun": { Consumers: 58000 },
  "Berrien": { Consumers: 70000 }, "Muskegon": { Consumers: 75000 },
  "Grand Traverse": { Consumers: 45000 }, "Marquette": { Consumers: 32000 },
  "Alpena": { Consumers: 14000 },
};

async function fetchOutageData(url: string, utility: "DTE" | "Consumers"): Promise<OutageZone[]> {
  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "AccessMichigan/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`${utility} API returned ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Kubra StormCenter returns nested data; extract areas/clusters
    const zones: OutageZone[] = [];

    // Try to parse Kubra format - it varies by deployment
    if (data?.data?.interval_generation_data) {
      // Kubra v2 format
      const genData = data.data.interval_generation_data;
      if (typeof genData === "string") {
        // Sometimes it's a URL to fetch further
        return [];
      }
    }

    // If we can't parse live data, return empty (fallback to demo data on client)
    return zones;
  } catch (err) {
    console.error(`Error fetching ${utility} outage data:`, err);
    return [];
  }
}

// Generate realistic demo data based on time of day and season
function generateDemoData(): OutageZone[] {
  const hour = new Date().getHours();
  const isStormHour = hour >= 14 && hour <= 20; // afternoon storms more common
  const baseMultiplier = isStormHour ? 2.5 : 1;

  const zones: OutageZone[] = [];

  for (const [county, coords] of Object.entries(COUNTY_COORDS)) {
    const base = CUSTOMER_BASE[county];
    if (!base) continue;

    for (const [util, served] of Object.entries(base)) {
      if (!served) continue;
      const utility = util as "DTE" | "Consumers";

      // Random outage simulation — seeded by county name for consistency within the hour
      const seed = county.charCodeAt(0) + county.charCodeAt(county.length - 1) + hour;
      const hasOutage = (seed % 7) < (isStormHour ? 4 : 2);
      const affected = hasOutage ? Math.round((seed % 50) * 10 * baseMultiplier) : 0;

      const causes = ["Storm damage", "Equipment failure", "Tree contact", "Wind damage", "Planned maintenance", "Lightning strike", "Vehicle accident"];
      const cause = hasOutage ? causes[seed % causes.length] : "";
      const restoreHours = hasOutage ? `${1 + (seed % 6)}–${3 + (seed % 8)} hrs` : "";

      zones.push({
        county,
        lat: coords[0] + (Math.sin(seed) * 0.02),
        lng: coords[1] + (Math.cos(seed) * 0.02),
        utility,
        customersAffected: affected,
        customersServed: served,
        cause,
        estimatedRestore: restoreHours,
        severity: classifySeverity(affected, served),
      });
    }
  }

  return zones;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Attempt live fetch from both utilities
    const [dteZones, ceZones] = await Promise.all([
      fetchOutageData(DTE_URL, "DTE"),
      fetchOutageData(CE_URL, "Consumers"),
    ]);

    const liveData = [...dteZones, ...ceZones];
    const useLive = liveData.length > 0;

    const zones = useLive ? liveData : generateDemoData();
    const activeOutages = zones.filter((z) => z.severity !== "none");
    const totalAffected = activeOutages.reduce((sum, z) => sum + z.customersAffected, 0);

    return new Response(
      JSON.stringify({
        zones,
        meta: {
          source: useLive ? "live" : "demo",
          timestamp: new Date().toISOString(),
          totalAffected,
          activeOutageCount: activeOutages.length,
          refreshInterval: 900, // 15 minutes
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=900" },
      }
    );
  } catch (err) {
    console.error("Outage proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch outage data", zones: generateDemoData() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
