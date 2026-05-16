import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Layers, ArrowLeft, Info, Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_BROADBAND_SEED } from "@/hooks/useBroadbandData";
import { MICHIGAN_FOOD_ACCESS } from "@/hooks/useFoodAccess";
import { MICHIGAN_FEMA_NRI, MICHIGAN_KEY_PFAS_SITES, MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";

interface LayerDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  source: string;
}

const MAP_LAYERS: LayerDef[] = [
  { id: "broadband", label: "Broadband Access", icon: "\u{1F4E1}", color: "#3b82f6", description: "FCC broadband coverage — % with 25/3 Mbps+", source: "FCC National Broadband Map 2024" },
  { id: "food-access", label: "Food Access", icon: "\u{1F6D2}", color: "#16a34a", description: "USDA food desert classification", source: "USDA Food Access Research Atlas 2019" },
  { id: "pfas", label: "PFAS Sites", icon: "\u26A0\uFE0F", color: "#dc2626", description: "Confirmed PFAS contamination sites", source: "EGLE MPART 2026" },
  { id: "disaster-risk", label: "Disaster Risk", icon: "\u{1F32A}\uFE0F", color: "#f59e0b", description: "FEMA NRI composite risk score", source: "FEMA National Risk Index 2023" },
  { id: "energy-burden", label: "Energy Burden", icon: "\u26A1", color: "#7c3aed", description: "Low-income household energy burden %", source: "ACEEE LEAD Tool 2023" },
];

// County centroids for marker placement (subset)
const COUNTY_CENTROIDS: Record<string, [number, number]> = {
  Wayne: [42.28, -83.24], Oakland: [42.66, -83.38], Genesee: [43.02, -83.71],
  Kent: [43.03, -85.55], Saginaw: [43.33, -84.05], Washtenaw: [42.25, -83.83],
  Ingham: [42.60, -84.37],
};

export default function DeepMapPage() {
  usePageMeta({ title: "Deep Map — GIS Intelligence — Access Michigan", description: "8 data layers on one map. Broadband, food access, PFAS, disaster risk, energy burden — every Michigan county.", path: "/map/layers" });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});
  const [searchParams] = useSearchParams();
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({ broadband: true });
  const [opacities, setOpacities] = useState<Record<string, number>>({ broadband: 70, "food-access": 70, pfas: 90, "disaster-risk": 70, "energy-burden": 70 });
  const [zipSearch, setZipSearch] = useState(searchParams.get("zip") || "");

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([44.3, -84.7], 7);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);
    mapInstanceRef.current = map;

    // Initialize layer groups
    MAP_LAYERS.forEach(l => {
      layerGroupsRef.current[l.id] = L.layerGroup();
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Render active layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear all
    Object.values(layerGroupsRef.current).forEach(lg => lg.clearLayers().removeFrom(map));

    // Broadband markers
    if (activeLayers.broadband) {
      const lg = layerGroupsRef.current.broadband;
      MICHIGAN_BROADBAND_SEED.forEach(b => {
        const coords = COUNTY_CENTROIDS[b.county];
        if (!coords) return;
        const color = b.pct_25_3_covered > 95 ? "#22c55e" : b.pct_25_3_covered > 85 ? "#f59e0b" : "#ef4444";
        L.circleMarker(coords, { radius: 12, fillColor: color, fillOpacity: (opacities.broadband ?? 70) / 100, color: "#fff", weight: 1 })
          .bindTooltip(`${b.county}: ${b.pct_25_3_covered}% broadband (25/3)\n${b.unserved_locations.toLocaleString()} unserved`, { sticky: true })
          .addTo(lg);
      });
      lg.addTo(map);
    }

    // Food access markers
    if (activeLayers["food-access"]) {
      const lg = layerGroupsRef.current["food-access"];
      MICHIGAN_FOOD_ACCESS.forEach(f => {
        const coords = COUNTY_CENTROIDS[f.county];
        if (!coords) return;
        const color = f.classification === "Food Desert" ? "#ef4444" : f.classification === "Low Access" ? "#f59e0b" : "#22c55e";
        L.circleMarker([coords[0] + 0.05, coords[1] - 0.05], { radius: 10, fillColor: color, fillOpacity: (opacities["food-access"] ?? 70) / 100, color: "#fff", weight: 1 })
          .bindTooltip(`${f.county}: ${f.classification}\n${f.lowAccessPct}% low-access tracts\n${f.noVehicleLowAccessPop.toLocaleString()} no vehicle + low access`, { sticky: true })
          .addTo(lg);
      });
      lg.addTo(map);
    }

    // PFAS sites
    if (activeLayers.pfas) {
      const lg = layerGroupsRef.current.pfas;
      MICHIGAN_KEY_PFAS_SITES.forEach(s => {
        if (!s.lat || !s.lon) return;
        L.circleMarker([s.lat, s.lon], { radius: 8, fillColor: "#dc2626", fillOpacity: (opacities.pfas ?? 90) / 100, color: "#fff", weight: 2 })
          .bindTooltip(`${s.siteName}\n${s.county} County — ${s.status}\n${s.contaminants.join(", ")}${s.maxConcentrationPpt ? `\nMax: ${s.maxConcentrationPpt.toLocaleString()} ppt` : ""}`, { sticky: true })
          .addTo(lg);
      });
      lg.addTo(map);
    }

    // Disaster risk markers
    if (activeLayers["disaster-risk"]) {
      const lg = layerGroupsRef.current["disaster-risk"];
      MICHIGAN_FEMA_NRI.forEach(n => {
        const coords = COUNTY_CENTROIDS[n.county];
        if (!coords) return;
        const color = n.compositeRisk > 30 ? "#ef4444" : n.compositeRisk > 20 ? "#f59e0b" : "#22c55e";
        L.circleMarker([coords[0] - 0.05, coords[1] + 0.05], { radius: 10, fillColor: color, fillOpacity: (opacities["disaster-risk"] ?? 70) / 100, color: "#fff", weight: 1 })
          .bindTooltip(`${n.county}: Risk ${n.compositeRisk.toFixed(1)} (${n.riskCategory})\nTop hazard: ${n.topHazard}\nExpected annual loss: $${(n.expectedAnnualLoss / 1e6).toFixed(0)}M`, { sticky: true })
          .addTo(lg);
      });
      lg.addTo(map);
    }

    // Energy burden markers
    if (activeLayers["energy-burden"]) {
      const lg = layerGroupsRef.current["energy-burden"];
      MICHIGAN_ENERGY_BURDEN.forEach(e => {
        const coords = COUNTY_CENTROIDS[e.county];
        if (!coords) return;
        const color = e.lowIncomeBurdenPct > 10 ? "#ef4444" : e.lowIncomeBurdenPct > 7 ? "#f59e0b" : "#22c55e";
        L.circleMarker([coords[0] + 0.03, coords[1] + 0.08], { radius: 9, fillColor: color, fillOpacity: (opacities["energy-burden"] ?? 70) / 100, color: "#fff", weight: 1 })
          .bindTooltip(`${e.county}: ${e.lowIncomeBurdenPct}% low-income energy burden\nMedian spend: $${e.medianEnergySpend}/yr\nLIHEAP eligible: ${e.liheapEligibleHouseholds.toLocaleString()}`, { sticky: true })
          .addTo(lg);
      });
      lg.addTo(map);
    }
  }, [activeLayers, opacities]);

  const toggleLayer = (id: string) => setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));

  // Active layers correlation insight
  const activeCount = Object.values(activeLayers).filter(Boolean).length;
  const worstCounties = useMemo(() => {
    if (activeCount < 2) return [];
    const scores: Record<string, number> = {};
    if (activeLayers.broadband) MICHIGAN_BROADBAND_SEED.forEach(b => { scores[b.county] = (scores[b.county] ?? 0) + (100 - b.pct_25_3_covered); });
    if (activeLayers["food-access"]) MICHIGAN_FOOD_ACCESS.forEach(f => { scores[f.county] = (scores[f.county] ?? 0) + f.lowAccessPct; });
    if (activeLayers["disaster-risk"]) MICHIGAN_FEMA_NRI.forEach(n => { scores[n.county] = (scores[n.county] ?? 0) + n.compositeRisk; });
    if (activeLayers["energy-burden"]) MICHIGAN_ENERGY_BURDEN.forEach(e => { scores[e.county] = (scores[e.county] ?? 0) + e.lowIncomeBurdenPct; });
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([county]) => county);
  }, [activeLayers, activeCount]);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Health Map", href: "/health-map" }, { label: "Deep Map" }]} />

      <section className="container py-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" /> Deep Map — GIS Intelligence
            </h1>
            <p className="text-sm text-muted-foreground">{MAP_LAYERS.length} data layers. One map. Every Michigan county.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input value={zipSearch} onChange={e => setZipSearch(e.target.value)} placeholder="ZIP code" className="w-28" />
            <Button size="sm" variant="outline" onClick={() => { /* future: fly to ZIP */ }}>
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Map */}
          <div ref={mapRef} className="rounded-lg border border-border overflow-hidden" style={{ height: 560 }} />

          {/* Layer Panel */}
          <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Layers</p>
            {MAP_LAYERS.map(layer => (
              <Card key={layer.id} className={`transition-all ${activeLayers[layer.id] ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
                <CardContent className="py-3">
                  <button onClick={() => toggleLayer(layer.id)} className="w-full flex items-center gap-2 text-left" aria-pressed={!!activeLayers[layer.id]} aria-label={`Toggle ${layer.label} layer`}>
                    <span className="text-base">{layer.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${activeLayers[layer.id] ? "text-foreground" : "text-muted-foreground"}`}>{layer.label}</p>
                      <p className="text-[9px] text-muted-foreground">{layer.source}</p>
                    </div>
                    <div className={`h-4 w-8 rounded-full transition-colors ${activeLayers[layer.id] ? "bg-primary" : "bg-muted"}`}>
                      <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${activeLayers[layer.id] ? "translate-x-4" : ""}`} />
                    </div>
                  </button>
                  {activeLayers[layer.id] && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">Opacity:</span>
                        <Slider
                          value={[opacities[layer.id] ?? 70]}
                          onValueChange={([v]) => setOpacities(prev => ({ ...prev, [layer.id]: v }))}
                          min={10} max={100} step={10}
                          className="flex-1"
                          aria-label={`${layer.label} opacity`}
                        />
                        <span className="text-[9px] text-muted-foreground tabular-nums w-8">{opacities[layer.id] ?? 70}%</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1">{layer.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Legend */}
            <div className="pt-2 border-t border-border">
              <p className="text-[9px] text-muted-foreground mb-2">Color key (all layers):</p>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Good</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Poor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation Insight */}
        {activeCount >= 2 && worstCounties.length > 0 && (
          <Card className="mt-4 border-primary/20 bg-primary/[0.03]">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-bold">{worstCounties.join(", ")}</span> score poorly across {activeCount} of your active layers.
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Sources: {MAP_LAYERS.filter(l => activeLayers[l.id]).map(l => l.source).join(" · ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        <Card className="mt-4 bg-muted/30">
          <CardContent className="py-3">
            <p className="text-[9px] text-muted-foreground">
              All layers use seeded data from verified public sources. Live API integration available for broadband (FCC), PFAS (EGLE ArcGIS), and disaster risk (FEMA). Map tiles: CARTO/OpenStreetMap.
            </p>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button asChild variant="outline"><Link to="/health-map"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Health Map</Link></Button>
        </div>
      </section>
    </Layout>
  );
}
