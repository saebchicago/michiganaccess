import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import {
  useEJScreenTracts,
  useAQSMonitors,
  useCSOOutfalls,
  usePFASSites,
  useNRITracts,
  useACSTract,
  EJSCREEN_META,
  AQS_META,
  CSO_META,
  PFAS_META,
  NRI_META,
  ACS_META,
  type EJScreenTract,
  type AQSMonitor,
  type CSOOutfall,
  type PFASSite,
  type NRITract,
  type ACSTractVehicle,
} from "@/hooks/useCHNATractData";
import type { CHNADomain, DataMode, IntegrityLabel } from "@/types/chna";

// HFH service area: Wayne, Oakland, Macomb, Jackson
const MAP_CENTER: [number, number] = [42.45, -83.2];
const MAP_ZOOM = 9;

// PM2.5 percentile choropleth scale (EJScreen)
function ejColor(pct: number | null): string {
  if (pct === null) return "#94a3b8";
  if (pct >= 90) return "#b91c1c";
  if (pct >= 75) return "#dc2626";
  if (pct >= 50) return "#f97316";
  if (pct >= 25) return "#eab308";
  return "#22c55e";
}

function nriColor(score: number | null): string {
  if (score === null) return "#94a3b8";
  if (score >= 75) return "#b91c1c";
  if (score >= 50) return "#f97316";
  if (score >= 25) return "#eab308";
  return "#22c55e";
}

function vehicleColor(pct: number): string {
  if (pct >= 30) return "#b91c1c";
  if (pct >= 20) return "#f97316";
  if (pct >= 10) return "#eab308";
  return "#22c55e";
}

function makeCircle(
  lat: number,
  lng: number,
  color: string,
  radius = 10,
): L.CircleMarker {
  return L.circleMarker([lat, lng], {
    radius,
    fillColor: color,
    color: "#fff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.75,
  });
}

function makeDivIcon(symbol: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:8px;color:white">${symbol}</div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
}

// Build layer groups from current data
function buildEJScreenGroup(tracts: EJScreenTract[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const t of tracts) {
    if (!t.lat || !t.lng) continue;
    const m = makeCircle(t.lat, t.lng, ejColor(t.pm25Percentile), 12);
    m.bindPopup(
      `<strong>${t.county} County</strong><br>` +
        `Tract: ${t.tractFips}<br>` +
        `PM2.5 percentile: ${t.pm25Percentile ?? "-"}<br>` +
        `Air toxics cancer risk: ${t.airToxicsCancerRisk ?? "-"} per million<br>` +
        `<em style="font-size:11px">Source: EJScreen 2.32 (EPA) · Modeled</em>`,
    );
    group.addLayer(m);
  }
  return group;
}

function buildAQSGroup(monitors: AQSMonitor[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const m of monitors) {
    const icon = makeDivIcon("◉", "#1d4ed8");
    const marker = L.marker([m.lat, m.lng], { icon });
    marker.bindPopup(
      `<strong>${m.name}</strong><br>` +
        `${m.city ?? ""}<br>` +
        `AQI: ${m.aqi ?? "-"}<br>` +
        `PM2.5: ${m.pm25 ?? "-"} µg/m³<br>` +
        `<em style="font-size:11px">Source: EPA AirNow / AQS · Verified${m.provisional ? " (provisional)" : ""}</em>`,
    );
    group.addLayer(marker);
  }
  return group;
}

function buildCSOGroup(outfalls: CSOOutfall[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const o of outfalls) {
    if (!o.lat || !o.lng) continue;
    const icon = makeDivIcon("C", "#7c3aed");
    const marker = L.marker([o.lat, o.lng], { icon });
    marker.bindPopup(
      `<strong>${o.name}</strong><br>` +
        (o.waterBody ? `Water body: ${o.waterBody}<br>` : "") +
        (o.permitId ? `Permit: ${o.permitId}<br>` : "") +
        `<em style="font-size:11px">Source: EGLE CSO Inventory · Verified</em>`,
    );
    group.addLayer(marker);
  }
  return group;
}

function buildPFASGroup(sites: PFASSite[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const s of sites) {
    if (!s.lat || !s.lng) continue;
    const icon = makeDivIcon("P", "#be123c");
    const marker = L.marker([s.lat, s.lng], { icon });
    marker.bindPopup(
      `<strong>${s.name}</strong><br>` +
        (s.siteType ? `Type: ${s.siteType}<br>` : "") +
        (s.status ? `Status: ${s.status}<br>` : "") +
        `<em style="font-size:11px">Source: EGLE PFAS Sites · Verified</em>`,
    );
    group.addLayer(marker);
  }
  return group;
}

function buildNRIGroup(tracts: NRITract[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const t of tracts) {
    if (!t.lat || !t.lng) continue;
    const m = makeCircle(t.lat, t.lng, nriColor(t.riskScore), 10);
    m.bindPopup(
      `<strong>${t.county} County</strong><br>` +
        `Tract: ${t.tractFips}<br>` +
        `Risk rating: ${t.riskRating ?? "-"}<br>` +
        `Risk score: ${t.riskScore ?? "-"}<br>` +
        `<em style="font-size:11px">Source: FEMA NRI · Modeled</em>`,
    );
    group.addLayer(m);
  }
  return group;
}

function buildACSGroup(tracts: ACSTractVehicle[]): L.LayerGroup {
  const group = L.layerGroup();
  for (const t of tracts) {
    if (!t.lat || !t.lng) continue;
    const m = makeCircle(t.lat, t.lng, vehicleColor(t.noVehiclePct), 9);
    m.bindPopup(
      `<strong>${t.county}</strong><br>` +
        `Tract: ${t.tractFips}<br>` +
        `Households without a vehicle: ${t.noVehiclePct}%<br>` +
        `(${t.noVehicleHouseholds.toLocaleString()} of ${t.totalHouseholds.toLocaleString()})<br>` +
        `<em style="font-size:11px">Source: ACS B08201 2022 · Verified survey estimate</em>`,
    );
    group.addLayer(m);
  }
  return group;
}

// Legend layer entry with dataMode badge
interface LayerEntry {
  key: string;
  label: string;
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
  dataMode: DataMode;
  visible: boolean;
  colorSwatch?: string;
  symbol?: string;
}

function CachedSampleBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
      role="status"
      aria-label="This layer is showing cached sample data, not a live federal response"
    >
      <AlertCircle className="h-2.5 w-2.5" aria-hidden="true" />
      cached sample
    </span>
  );
}

function LegendEntry({
  entry,
  onToggle,
}: {
  entry: LayerEntry;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <button
        onClick={onToggle}
        aria-pressed={entry.visible}
        aria-label={`Toggle ${entry.label} layer`}
        className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          entry.visible
            ? "border-primary bg-primary"
            : "border-muted-foreground bg-background"
        }`}
      >
        {entry.colorSwatch && entry.visible && (
          <span
            className="block h-2.5 w-2.5 rounded-sm mx-auto"
            style={{ background: entry.colorSwatch }}
            aria-hidden="true"
          />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">
            {entry.label}
          </span>
          <IntegrityBadge label={entry.integrityLabel} />
          {entry.dataMode === "fallback" && <CachedSampleBadge />}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {entry.source} ({entry.vintage})
        </p>
      </div>
    </div>
  );
}

interface CHNATractMapProps {
  priorityId: string;
  domains: CHNADomain[];
}

export function CHNATractMap({ priorityId, domains }: CHNATractMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupsRef = useRef<Record<string, L.LayerGroup>>({});

  const showAir = domains.includes("air");
  const showWater = domains.includes("water");
  const showAccess = domains.includes("access");

  const ejscreen = useEJScreenTracts(showAir);
  const aqs = useAQSMonitors(showAir);
  const cso = useCSOOutfalls(showWater);
  const pfas = usePFASSites(showWater);
  const nri = useNRITracts(showWater || showAir);
  const acs = useACSTract(showAccess);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    ejscreen: showAir,
    aqs: showAir,
    cso: showWater,
    pfas: showWater,
    nri: false,
    acs: showAccess,
  });

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com">CARTO</a> &copy; OpenStreetMap contributors',
        maxZoom: 18,
      },
    ).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Rebuild all data layers whenever data or visibility changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layers
    Object.values(groupsRef.current).forEach((g) => g.remove());
    groupsRef.current = {};

    const add = (key: string, group: L.LayerGroup) => {
      groupsRef.current[key] = group;
      if (visible[key]) group.addTo(map);
    };

    if (showAir) {
      add("ejscreen", buildEJScreenGroup(ejscreen.data));
      add("aqs", buildAQSGroup(aqs.data));
    }
    if (showWater) {
      add("cso", buildCSOGroup(cso.data));
      add("pfas", buildPFASGroup(pfas.data));
      add("nri", buildNRIGroup(nri.data));
    }
    if (showAccess) {
      add("acs", buildACSGroup(acs.data));
    }
  }, [
    ejscreen.data,
    aqs.data,
    cso.data,
    pfas.data,
    nri.data,
    acs.data,
    visible,
    showAir,
    showWater,
    showAccess,
  ]);

  // Reset visible layers when priority/domains change
  useEffect(() => {
    setVisible({
      ejscreen: showAir,
      aqs: showAir,
      cso: showWater,
      pfas: showWater,
      nri: false,
      acs: showAccess,
    });
  }, [priorityId, showAir, showWater, showAccess]);

  function toggleLayer(key: string) {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const map = mapRef.current;
      const group = groupsRef.current[key];
      if (map && group) {
        if (next[key]) group.addTo(map);
        else group.remove();
      }
      return next;
    });
  }

  const legendEntries: LayerEntry[] = [
    showAir && {
      key: "ejscreen",
      label: "PM2.5 Burden (EJScreen tract)",
      ...EJSCREEN_META,
      dataMode: ejscreen.dataMode,
      visible: visible.ejscreen ?? false,
      colorSwatch: "#f97316",
    },
    showAir && {
      key: "aqs",
      label: "AQS PM2.5 Monitors",
      ...AQS_META,
      dataMode: aqs.dataMode,
      visible: visible.aqs ?? false,
      symbol: "◉",
    },
    showWater && {
      key: "cso",
      label: "CSO Outfalls",
      ...CSO_META,
      dataMode: cso.dataMode,
      visible: visible.cso ?? false,
      symbol: "C",
    },
    showWater && {
      key: "pfas",
      label: "PFAS Sites",
      ...PFAS_META,
      dataMode: pfas.dataMode,
      visible: visible.pfas ?? false,
      symbol: "P",
    },
    (showWater || showAir) && {
      key: "nri",
      label: "FEMA Risk Index (tract)",
      ...NRI_META,
      dataMode: nri.dataMode,
      visible: visible.nri ?? false,
      colorSwatch: "#f97316",
    },
    showAccess && {
      key: "acs",
      label: "Zero-Vehicle Households (ACS)",
      ...ACS_META,
      dataMode: acs.dataMode,
      visible: visible.acs ?? false,
      colorSwatch: "#f97316",
    },
  ].filter(Boolean) as LayerEntry[];

  const anyFallback = legendEntries.some((e) => e.dataMode === "fallback");

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden border border-border">
        <div
          ref={containerRef}
          style={{ height: "400px" }}
          aria-label="CHNA tract-level map"
        />
      </div>

      {/* Legend panel */}
      <Card>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Map layers</CardTitle>
            {anyFallback && (
              <span
                className="flex items-center gap-1 text-[11px] text-amber-700"
                role="status"
              >
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                One or more layers are showing cached sample data
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border pt-0">
          {legendEntries.map((entry) => (
            <LegendEntry
              key={entry.key}
              entry={entry}
              onToggle={() => toggleLayer(entry.key)}
            />
          ))}
        </CardContent>
      </Card>

      {/* About these numbers panel */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-2">
        <Info
          className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>About these numbers.</strong> Layers carry one of three
            integrity statuses, shown in the legend:
          </p>
          <ul className="list-none space-y-0.5 ml-0">
            <li>
              <strong>VERIFIED:</strong> directly measured from a monitoring
              instrument (AQS monitors) or from a government administrative
              inventory (EGLE outfalls, PFAS sites, ACS survey).
            </li>
            <li>
              <strong>MODELED:</strong> derived from verified inputs using an
              EPA or FEMA analytical model (EJScreen percentiles, FEMA NRI risk
              scores). Reflects estimated burden, not direct measurement.
            </li>
          </ul>
          <p>
            A <strong>cached sample</strong> badge means a federal data service
            did not respond and this layer is showing representative seed data,
            not a live API result. No value is presented as live when it is not.
          </p>
          <p>
            Coverage is not uniform. PFAS and CSO data reflect known sites only;
            absence of a marker does not indicate absence of concern.
          </p>
        </div>
      </div>
    </div>
  );
}
