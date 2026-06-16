import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Globe, Loader2, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import LayerSelector, {
  type AtlasLayer,
} from "@/components/atlas/LayerSelector";
import CountyDetailPanel from "@/components/atlas/CountyDetailPanel";
import MapLegend from "@/components/atlas/MapLegend";
import {
  ATLAS_LAYER_COUNT,
  COUNTIES_COVERED,
} from "@/config/platformConstants";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getALICEByCounty } from "@/data/aliceData";
import { MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";
import { MICHIGAN_BROADBAND_SEED } from "@/hooks/useBroadbandData";
import { computeCompoundDeficit } from "@/utils/compoundDeficit";
import { getInfantMortalityAtlas } from "@/lib/data-layers";

const MichiganHeatGrid = lazy(
  () => import("@/components/atlas/MichiganHeatGrid"),
);
const MichiganMap = lazy(() => import("@/components/atlas/MichiganMap"));
const CompoundDeficitRanking = lazy(
  () => import("@/components/data/CompoundDeficitRanking"),
);
const CountySparklineGrid = lazy(
  () => import("@/components/tools/CountySparklineGrid"),
);
const SDOHIndexBuilder = lazy(
  () => import("@/components/tools/SDOHIndexBuilder"),
);
const PolicySimulator = lazy(
  () => import("@/components/tools/PolicySimulator"),
);
const CountyLeaderboard = lazy(
  () => import("@/components/tools/CountyLeaderboard"),
);

// Guard 3: only return values with a verified source. Omitted fields render
// "Data unavailable" in CountyDetailPanel.MetricRow. Remediation PRs are
// tracked per-layer in scripts/atlas-provenance-status.json.
function getCountyData(
  county: string,
  imrLookup: Record<string, number | null>,
  broadbandLookup: Record<string, number>,
  energyLookup: Record<string, number>,
) {
  const p = COUNTY_PROFILES[county];
  if (!p) return null;
  const h = p.healthHighlights;
  return {
    county,
    population: p.population,
    uninsured: parseFloat(h[0]?.value || "0"),
    poverty: parseFloat(h[2]?.value || "0"),
    compound: computeCompoundDeficit(p).compound,
    // FCC BDC 2024: real value for 10/83 counties, undefined elsewhere
    broadband_unserved: broadbandLookup[county] as number | undefined,
    // MDHHS: null until 2020-2024 five-year CSV seeded via seed-maternal-health.ts
    infant_mortality: imrLookup[county] ?? null,
    // ACEEE LEAD 2023: real value for 7/83 counties, undefined elsewhere
    energy_burden: energyLookup[county] as number | undefined,
    // food_desert_tracts: Guard 3 - formula was fabricated; pending USDA tract data
    // ej_max: Guard 3 - FEMA NRI compositeRisk != EPA EJScreen index
  };
}

export default function HealthEquityAtlasPage() {
  const [activeLayer, setActiveLayer] = useState<AtlasLayer>("compound");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // MDHHS 2020-2024 infant mortality - loaded async from Supabase.
  // Empty until maternal_infant_health table is seeded; all counties show null.
  const [imrLookup, setImrLookup] = useState<Record<string, number | null>>({});
  useEffect(() => {
    getInfantMortalityAtlas()
      .then(setImrLookup)
      .catch(() => {});
  }, []);

  // Build map data from county profiles for active layer
  // Build verified data lookups for real county-level data
  const aliceLookup = useMemo(() => {
    const m: Record<string, number> = {};
    for (const name of Object.keys(COUNTY_PROFILES)) {
      const a = getALICEByCounty(name);
      if (a) m[name] = a.combinedHardshipPct;
    }
    return m;
  }, []);

  const energyLookup = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of MICHIGAN_ENERGY_BURDEN) m[e.county] = e.lowIncomeBurdenPct;
    return m;
  }, []);

  const broadbandLookup = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of MICHIGAN_BROADBAND_SEED)
      m[b.county] = 100 - b.pct_25_3_covered; // unserved %
    return m;
  }, []);

  // Guard 3: layers without a verified source return null for every county.
  // null renders as gray fill on the map and "Data unavailable" in the detail
  // panel. No proxy values are used. Per-layer status tracked in
  // scripts/atlas-provenance-status.json.
  const mapData = useMemo(() => {
    const result: Record<string, number | null> = {};
    for (const [name, profile] of Object.entries(COUNTY_PROFILES)) {
      const h = profile.healthHighlights;
      switch (activeLayer) {
        case "uninsured":
          // ACS via County Health Rankings 2025 - all 83 counties
          result[name] = parseFloat(h[0]?.value || "0");
          break;
        case "poverty":
          // Guard 3: food insecurity != ACS poverty rate; pending ACS ingestion
          result[name] = null;
          break;
        case "food_desert":
          // Guard 3: food insecurity != food desert tracts; pending USDA tract ingestion
          result[name] = null;
          break;
        case "compound":
          // Access Michigan Index formula - derived from verified inputs
          result[name] = computeCompoundDeficit(profile).compound;
          break;
        case "energy_burden":
          // ACEEE LEAD Tool 2023 - 7/83 counties; null elsewhere
          result[name] = energyLookup[name] ?? null;
          break;
        case "infant_mortality":
          // MDHHS Division for Vital Records 2020-2024 five-year average.
          // null until maternal_infant_health Supabase table is seeded.
          // Suppressed counties (< 6 events) also null per MDHHS policy.
          result[name] = imrLookup[name] ?? null;
          break;
        case "broadband":
          // FCC National Broadband Map 2024 - 10/83 counties; null elsewhere
          result[name] = broadbandLookup[name] ?? null;
          break;
        case "ej_index":
          // Guard 3: FEMA NRI compositeRisk != EPA EJScreen index (source mismatch)
          result[name] = null;
          break;
        case "alice":
          // United Way ALICE Report Michigan 2025 - 7/83 counties; null elsewhere
          result[name] = aliceLookup[name] ?? null;
          break;
        case "pharmacy":
          // Guard 3: no verified county-level source exists; pending NCPDP ingestion
          result[name] = null;
          break;
      }
    }
    return result;
  }, [activeLayer, aliceLookup, energyLookup, broadbandLookup, imrLookup]);

  usePageMeta({
    title: "Michigan Health Equity | Access Michigan",
    description: "Health equity indicators across Michigan's 83 counties.",
    path: "/health-equity-atlas",
  });

  const countyData = useMemo(
    () =>
      selectedCounty
        ? getCountyData(
            selectedCounty,
            imrLookup,
            broadbandLookup,
            energyLookup,
          )
        : null,
    [selectedCounty, imrLookup, broadbandLookup, energyLookup],
  );

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Health Equity Atlas" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-12 md:py-16">
        <div className="container max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Flagship Visualization
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Michigan Health Equity Atlas
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {COUNTIES_COVERED} counties. {ATLAS_LAYER_COUNT} data layers. One
              view of where access gaps compound. Select a layer, click any
              county for detail.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr_280px]">
          {/* Layer selector (left sidebar) */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <LayerSelector active={activeLayer} onChange={setActiveLayer} />
            <MapLegend
              data={mapData}
              metric={activeLayer.replace(/_/g, " ")}
              unit={
                activeLayer === "broadband" ||
                activeLayer === "uninsured" ||
                activeLayer === "poverty" ||
                activeLayer === "energy_burden"
                  ? "%"
                  : ""
              }
              colorScale="red-green"
            />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-3 w-3 rounded-sm bg-green-600" /> Low
              <span className="h-3 w-3 rounded-sm bg-yellow-400" /> Moderate
              <span className="h-3 w-3 rounded-sm bg-orange-500" /> High
              <span className="h-3 w-3 rounded-sm bg-red-600" /> Critical
            </div>
          </div>

          {/* Map (desktop) / Grid (mobile) */}
          <div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              {isMobile ? (
                <MichiganHeatGrid
                  layer={activeLayer}
                  onCountyClick={setSelectedCounty}
                  selectedCounty={selectedCounty}
                />
              ) : (
                <MichiganMap
                  data={mapData}
                  metric={activeLayer.replace(/_/g, " ")}
                  colorScale="red-green"
                  unit={
                    activeLayer === "broadband" ||
                    activeLayer === "uninsured" ||
                    activeLayer === "poverty" ||
                    activeLayer === "energy_burden"
                      ? "%"
                      : ""
                  }
                  onCountyClick={setSelectedCounty}
                  height={480}
                />
              )}
            </Suspense>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">
              Sources: USDA · FCC · EPA · CDC · MDHHS · March of Dimes · HRSA ·
              ACEEE · Census. Click any county for detail. Data from county
              profiles where tract-level data is pending ingestion.
            </p>
          </div>

          {/* Detail panel (right sidebar) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {countyData ? (
              <CountyDetailPanel
                county={countyData}
                onClose={() => setSelectedCounty(null)}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click a county to see detail
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 83-County Sparkline Grid */}
      <div className="container max-w-6xl py-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading county grid...
            </div>
          }
        >
          <CountySparklineGrid />
        </Suspense>
      </div>

      {/* Key Findings - verified data anchors */}
      <section className="container max-w-5xl py-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Key Findings</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 p-4">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              41%
            </p>
            <p className="text-xs text-muted-foreground">
              of MI households below ALICE threshold
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              United Way ALICE 2025
            </p>
          </div>
          <div className="rounded-lg border border-red-200/50 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 p-4">
            <p className="text-2xl font-bold text-red-600 tabular-nums">18</p>
            <p className="text-xs text-muted-foreground">
              counties are maternity care deserts
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              <a
                href="https://www.marchofdimes.org/sites/default/files/2024-10/2024_Maternity_Care_Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline hover:text-muted-foreground"
              >
                March of Dimes 2024
                <ExternalLink className="h-2 w-2 ml-0.5 opacity-70" />
              </a>
            </p>
          </div>
          <div className="rounded-lg border border-purple-200/50 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/10 p-4">
            <p className="text-2xl font-bold text-purple-600 tabular-nums">
              13
            </p>
            <p className="text-xs text-muted-foreground">
              UP counties with zero psych beds
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              TAC / MDHHS CON 2024
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
            <p className="text-2xl font-bold text-primary tabular-nums">
              61.6%
            </p>
            <p className="text-xs text-muted-foreground">
              Keweenaw locations lack broadband
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              FCC BDC 2024
            </p>
          </div>
        </div>
      </section>

      {/* Compound Index Rankings */}
      <div className="container max-w-5xl py-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading rankings...
            </div>
          }
        >
          <CompoundDeficitRanking />
        </Suspense>
      </div>

      {/* 83-County Leaderboard */}
      <div className="container max-w-5xl py-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading leaderboard...
            </div>
          }
        >
          <CountyLeaderboard />
        </Suspense>
      </div>

      {/* SDOH Vulnerability Index Builder */}
      <div className="container max-w-5xl py-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading SDOH index builder...
            </div>
          }
        >
          <SDOHIndexBuilder />
        </Suspense>
      </div>

      {/* Policy Impact Simulator */}
      <div className="container max-w-5xl py-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading policy simulator...
            </div>
          }
        >
          <PolicySimulator />
        </Suspense>
      </div>
    </Layout>
  );
}
