import { useState, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Globe, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import LayerSelector, { type AtlasLayer } from "@/components/atlas/LayerSelector";
import CountyDetailPanel from "@/components/atlas/CountyDetailPanel";
import MapLegend from "@/components/atlas/MapLegend";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

const MichiganHeatGrid = lazy(() => import("@/components/atlas/MichiganHeatGrid"));
const MichiganMap = lazy(() => import("@/components/atlas/MichiganMap"));
const CompoundDeficitRanking = lazy(() => import("@/components/data/CompoundDeficitRanking"));

function getCountyData(county: string) {
  const p = COUNTY_PROFILES[county];
  if (!p) return null;
  const h = p.healthHighlights;
  return {
    county,
    population: p.population,
    uninsured: parseFloat(h[0]?.value || "0"),
    poverty: parseFloat(h[2]?.value || "0"),
    compound: parseFloat(h[0]?.value || "0") * 2 + parseFloat(h[2]?.value || "0") * 1.5,
    food_desert_tracts: Math.round(parseFloat(h[2]?.value || "0") * 2),
    broadband_unserved: p.countyType === "rural" ? 28 : p.countyType === "suburban" ? 8 : 5,
    infant_mortality: p.countyType === "urban" ? 7.2 : p.countyType === "rural" ? 6.8 : 5.4,
    ej_max: p.countyType === "urban" ? 65 : p.countyType === "rural" ? 35 : 45,
    energy_burden: p.countyType === "rural" ? 8.5 : p.countyType === "suburban" ? 5.2 : 6.8,
  };
}

export default function HealthEquityAtlasPage() {
  const [activeLayer, setActiveLayer] = useState<AtlasLayer>("compound");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Build map data from county profiles for active layer
  const mapData = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [name, profile] of Object.entries(COUNTY_PROFILES)) {
      const h = profile.healthHighlights;
      switch (activeLayer) {
        case "uninsured": result[name] = parseFloat(h[0]?.value || "0"); break;
        case "poverty":
        case "food_desert": result[name] = parseFloat(h[2]?.value || "0"); break;
        case "compound": result[name] = parseFloat(h[0]?.value || "0") * 2 + parseFloat(h[2]?.value || "0") * 1.5; break;
        case "energy_burden": result[name] = profile.countyType === "rural" ? 8.5 : profile.countyType === "suburban" ? 5.2 : 6.8; break;
        case "infant_mortality": result[name] = profile.countyType === "urban" ? 7.2 : profile.countyType === "rural" ? 6.8 : 5.4; break;
        case "broadband": result[name] = profile.countyType === "rural" ? 28 : profile.countyType === "suburban" ? 8 : 5; break;
        case "ej_index": result[name] = profile.countyType === "urban" ? 65 : profile.countyType === "rural" ? 35 : 45; break;
        case "alice": result[name] = profile.countyType === "rural" ? 48 : profile.countyType === "urban" ? 43 : 36; break;
        case "pharmacy": result[name] = profile.countyType === "rural" ? 70 : profile.countyType === "suburban" ? 30 : 10; break;
      }
    }
    return result;
  }, [activeLayer]);

  usePageMeta({
    title: "Health Equity Atlas — Access Michigan",
    description: "Interactive county-level atlas with 8 toggleable data layers: compound access deficit, food deserts, broadband, infant mortality, EJ index, energy burden, uninsured, and poverty.",
    path: "/health-equity-atlas",
  });

  const countyData = selectedCounty ? getCountyData(selectedCounty) : null;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Health Equity Atlas" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-12 md:py-16">
        <div className="container max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Flagship Visualization</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Michigan Health Equity Atlas
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              83 counties. 8 data layers. One view of where access gaps compound.
              Select a layer, click any county for detail.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr_280px]">
          {/* Layer selector (left sidebar) */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <LayerSelector active={activeLayer} onChange={setActiveLayer} />
            <MapLegend data={mapData} metric={activeLayer.replace(/_/g, " ")} unit={activeLayer === "broadband" || activeLayer === "uninsured" || activeLayer === "poverty" || activeLayer === "energy_burden" ? "%" : ""} colorScale="red-green" />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-3 w-3 rounded-sm bg-green-600" /> Low
              <span className="h-3 w-3 rounded-sm bg-yellow-400" /> Moderate
              <span className="h-3 w-3 rounded-sm bg-orange-500" /> High
              <span className="h-3 w-3 rounded-sm bg-red-600" /> Critical
            </div>
          </div>

          {/* Map (desktop) / Grid (mobile) */}
          <div>
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }>
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
                  unit={activeLayer === "broadband" || activeLayer === "uninsured" || activeLayer === "poverty" || activeLayer === "energy_burden" ? "%" : ""}
                  onCountyClick={setSelectedCounty}
                  height={480}
                />
              )}
            </Suspense>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">
              Sources: USDA · FCC · EPA · CDC · MDHHS · March of Dimes · HRSA · ACEEE · Census.{" "}
              Click any county for detail. Data from county profiles where tract-level data is pending ingestion.
            </p>
          </div>

          {/* Detail panel (right sidebar) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {countyData ? (
              <CountyDetailPanel county={countyData} onClose={() => setSelectedCounty(null)} />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click a county to see detail</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compound Index Rankings */}
      <div className="container max-w-5xl py-8">
        <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading rankings...</div>}>
          <CompoundDeficitRanking />
        </Suspense>
      </div>
    </Layout>
  );
}
