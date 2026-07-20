import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Info,
  Users,
  Wind,
  Droplets,
  MapPin,
  Map,
  Share2,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import { CHNATractMap } from "@/components/chna/CHNATractMap";
import {
  generateCHNABriefPDF,
  generateCHNABriefCSV,
} from "@/utils/generateCHNABrief";
import {
  HFH_SYSTEM,
  CHNA_SYSTEM_OPTIONS,
  CHNA_PRIORITIES,
  CHNA_DRIVERS,
  CHNA_METRICS,
  PRIORITY_DRIVER_MAP,
} from "@/data/chnaSeed";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import {
  COUNTY_PROFILES,
  COUNTY_UNINSURED_SOURCE,
  COUNTY_PCP_SOURCE,
  COUNTY_FOOD_INSECURITY_SOURCE,
} from "@/data/michigan-county-profiles";
import {
  getPlacesForCountyName,
  CDC_PLACES_COUNTY_PROVENANCE,
} from "@/data/cdc-places-county";
import {
  countFacilitiesForCounty,
  VERIFIED_FACILITY_SOURCE_LABEL,
} from "@/data/verifiedHealthFacilities";
import type {
  CHNAPriority,
  CHNADomain,
  CHNAGeography,
  CHNAMetric,
  IntegrityLabel,
} from "@/types/chna";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// County compare data (existing functionality, absorbed as a tab).
// Every field is pulled from a real, already-ingested all-83-county
// source at module load - see the per-field comments below. Fields with
// no real all-83-county source anywhere in the codebase (health rank,
// SVI, life expectancy, depression rate, child poverty, energy burden)
// were dropped rather than shown as invented numbers; see FIXLOG.md.
interface CountyCompareRecord {
  name: string;
  population: number;
  insuredRate: number;
  pcpPer100k: number;
  foodInsecurityRate: number;
  obesityRate: number;
  diabetesRate: number;
  facilities: number;
}

/** Reads a labeled value out of a CountyProfile's healthHighlights list
 * by substring match on the label, mirroring BriefPage.tsx's getVal(). */
function getHealthValue(
  hh: { label: string; value: string }[],
  search: string,
): string {
  return (
    hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))
      ?.value ?? ""
  );
}

function parsePercent(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** CountyProfile stores primary-care access as a population-per-1-PCP
 * ratio string (e.g. "1,426:1"); convert to PCPs per 100,000 residents. */
function parseRatioToPer100k(value: string): number {
  const n = parseInt(value.split(":")[0].replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.round(100000 / n) : 0;
}

function average(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// Built once at module load from real, already-ingested all-83-county
// sources (see the DATA_SOURCES box in CountyCompareTab for citations):
//   - population, insured rate, PCP ratio, food insecurity: COUNTY_PROFILES
//     (Census PEP Vintage 2024 / County Health Rankings 2025)
//   - obesity, diabetes: CDC PLACES County 2025 release (MODELED, MRP-based)
//   - facilities: CMS Hospital General Information + HRSA Health Center Sites
const COUNTIES: CountyCompareRecord[] = Object.keys(MI_COUNTY_FIPS)
  .sort((a, b) => a.localeCompare(b))
  .map((name) => {
    const profile = COUNTY_PROFILES[name];
    const uninsuredPct = parsePercent(
      getHealthValue(profile.healthHighlights, "uninsured"),
    );
    const pcpRatio = getHealthValue(profile.healthHighlights, "primary care");
    const places = getPlacesForCountyName(name);
    return {
      name,
      population: profile.population,
      insuredRate: Math.round((100 - uninsuredPct) * 10) / 10,
      pcpPer100k: parseRatioToPer100k(pcpRatio),
      foodInsecurityRate: parsePercent(
        getHealthValue(profile.healthHighlights, "food"),
      ),
      obesityRate: places?.measures.obesity.crudePrevalence ?? 0,
      diabetesRate: places?.measures.diabetes.crudePrevalence ?? 0,
      facilities: countFacilitiesForCounty(name),
    };
  });

// Unweighted mean across all 83 counties (each county counts once,
// regardless of population) - matches the convention already used by
// buildStateSnapshotMetrics() in snapshotMetrics.ts.
const MI_AVG = {
  insuredRate: Math.round(average(COUNTIES.map((c) => c.insuredRate)) * 10) / 10,
  pcpPer100k: Math.round(average(COUNTIES.map((c) => c.pcpPer100k))),
  foodInsecurityRate:
    Math.round(average(COUNTIES.map((c) => c.foodInsecurityRate)) * 10) / 10,
  obesityRate: Math.round(average(COUNTIES.map((c) => c.obesityRate)) * 10) / 10,
  diabetesRate: Math.round(average(COUNTIES.map((c) => c.diabetesRate)) * 10) / 10,
  facilities: Math.round(average(COUNTIES.map((c) => c.facilities))),
};

const COMPARE_METRICS = [
  {
    key: "insuredRate" as const,
    label: "Insured Rate",
    unit: "%",
    avg: MI_AVG.insuredRate,
    higherBetter: true,
  },
  {
    key: "pcpPer100k" as const,
    label: "PCPs per 100K",
    unit: "",
    avg: MI_AVG.pcpPer100k,
    higherBetter: true,
  },
  {
    key: "foodInsecurityRate" as const,
    label: "Food Insecurity",
    unit: "%",
    avg: MI_AVG.foodInsecurityRate,
    higherBetter: false,
  },
  {
    key: "obesityRate" as const,
    label: "Obesity Rate (modeled)",
    unit: "%",
    avg: MI_AVG.obesityRate,
    higherBetter: false,
  },
  {
    key: "diabetesRate" as const,
    label: "Diabetes (modeled)",
    unit: "%",
    avg: MI_AVG.diabetesRate,
    higherBetter: false,
  },
  {
    key: "facilities" as const,
    label: "Facilities",
    unit: "",
    avg: MI_AVG.facilities,
    higherBetter: true,
  },
];

type MetricKey = (typeof COMPARE_METRICS)[number]["key"];

// Domain config
const DOMAIN_CONFIG: Record<CHNADomain, { label: string; Icon: typeof Users }> =
  {
    workforce: { label: "Workforce and Economic Stability", Icon: Users },
    air: { label: "Air Quality", Icon: Wind },
    water: { label: "Water Quality", Icon: Droplets },
    access: { label: "Healthcare Access", Icon: MapPin },
  };

function geoLabel(geography: CHNAGeography, note?: string): string {
  if (note) return note;
  const labels: Record<CHNAGeography, string> = {
    state: "Michigan",
    county: "County",
    city: "City",
    tract: "Census Tract",
  };
  return labels[geography];
}

// Sub-components

function PriorityCard({
  priority,
  selected,
  onClick,
}: {
  priority: CHNAPriority;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        selected
          ? "border-primary bg-primary/5 font-semibold text-primary"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <span className="block font-medium">{priority.label}</span>
      <span className="mt-0.5 block text-[11px] text-muted-foreground">
        {priority.scope === "enterprise"
          ? "Enterprise priority"
          : `Hospital-specific: ${priority.hospitals?.join(", ")}`}
      </span>
    </button>
  );
}

// Shape markers for mixed-integrity groups. In single-integrity groups, no marker is shown.
const INTEGRITY_MARKERS: Record<IntegrityLabel, string> = {
  VERIFIED: "●",
  MODELED: "◆",
  PROJECTED: "▲",
};

interface LegendEntry {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
  marker?: string;
}

function buildLegendEntries(
  metrics: CHNAMetric[],
  isMixed: boolean,
): LegendEntry[] {
  const seen = new Set<string>();
  const entries: LegendEntry[] = [];
  for (const m of metrics) {
    const key = `${m.integrityLabel}|${m.source}|${m.vintage}`;
    if (!seen.has(key)) {
      seen.add(key);
      entries.push({
        integrityLabel: m.integrityLabel,
        source: m.source,
        vintage: m.vintage,
        marker: isMixed ? INTEGRITY_MARKERS[m.integrityLabel] : undefined,
      });
    }
  }
  return entries;
}

function DomainLegend({ entries }: { entries: LegendEntry[] }) {
  return (
    <div
      className="mb-2 flex flex-wrap gap-x-4 gap-y-1 border-b border-border pb-2"
      aria-label="Data source legend"
    >
      {entries.map((entry, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          {entry.marker && (
            <span aria-hidden="true" className="font-bold">
              {entry.marker}
            </span>
          )}
          <IntegrityBadge label={entry.integrityLabel} />
          <span>
            {entry.source} ({entry.vintage})
          </span>
        </span>
      ))}
    </div>
  );
}

function MetricRow({
  label,
  value,
  unit,
  geography,
  note,
  marker,
}: {
  label: string;
  value: number | string;
  unit: string;
  geography: CHNAGeography;
  note?: string;
  marker?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md border border-border bg-background px-3 py-2.5">
      {marker && (
        <span
          className="shrink-0 text-xs font-bold text-muted-foreground"
          aria-hidden="true"
        >
          {marker}
        </span>
      )}
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <span className="shrink-0 text-sm font-semibold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit}
      </span>
      <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
        {geoLabel(geography, note ?? undefined)}
      </Badge>
    </div>
  );
}

function DomainSection({
  domain,
  priorityId,
}: {
  domain: CHNADomain;
  priorityId: string;
}) {
  const { label, Icon } = DOMAIN_CONFIG[domain];
  const driver = CHNA_DRIVERS.find((d) => d.domain === domain);
  const metrics = CHNA_METRICS.filter(
    (m) => m.priorityId === priorityId && m.driverId === driver?.id,
  );

  if (metrics.length === 0) return null;

  const uniqueLabels = [...new Set(metrics.map((m) => m.integrityLabel))];
  const isMixed = uniqueLabels.length > 1;
  const legendEntries = buildLegendEntries(metrics, isMixed);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-3 space-y-1.5">
        <DomainLegend entries={legendEntries} />
        {metrics.map((m) => (
          <MetricRow
            key={m.id}
            label={m.label}
            value={m.value}
            unit={m.unit}
            geography={m.geography}
            note={m.note}
            marker={isMixed ? INTEGRITY_MARKERS[m.integrityLabel] : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function GranularityGapPanel({
  priorityId,
  systemLabel,
}: {
  priorityId: string;
  systemLabel: string;
}) {
  const domains = PRIORITY_DRIVER_MAP[priorityId] ?? [];
  return (
    <Card className="border-dashed border-primary/30 bg-primary/3">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm text-primary">
            Granularity gap: county and city level only
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1.5">
        <p>
          The {systemLabel} CHNA reports the{" "}
          {domains.map((d) => DOMAIN_CONFIG[d].label.toLowerCase()).join(", ")}{" "}
          indicators above at county or city level. The map below surfaces
          census-tract-level data for these domains from federal sources,
          revealing neighborhood patterns within the counties the CHNA covers.
        </p>
        <div className="mt-3">
          <CHNATractMap priorityId={priorityId} domains={domains} />
        </div>
      </CardContent>
    </Card>
  );
}

function PrioritiesTab() {
  const [selectedSystemId, setSelectedSystemId] = useState("hfh-2022");
  const [selectedPriorityId, setSelectedPriorityId] = useState(
    CHNA_PRIORITIES[0].id,
  );
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const selectedSystem =
    CHNA_SYSTEM_OPTIONS.find((s) => s.id === selectedSystemId) ??
    CHNA_SYSTEM_OPTIONS[0];
  const systemData = selectedSystemId === "hfh-2022" ? HFH_SYSTEM : HFH_SYSTEM;

  const selectedPriority = CHNA_PRIORITIES.find(
    (p) => p.id === selectedPriorityId,
  )!;
  const domains = PRIORITY_DRIVER_MAP[selectedPriorityId] ?? [];

  return (
    <div className="space-y-6">
      {/* System selector */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Health system
        </label>
        <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHNA_SYSTEM_OPTIONS.map((s) => (
              <SelectItem key={s.id} value={s.id} disabled={!s.available}>
                {s.label}
                {!s.available && " (coming soon)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* System banner */}
      <Card className="bg-muted/40">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-foreground">
              {systemData.label}
            </span>
            <span className="text-muted-foreground">
              Service area: {systemData.counties.join(", ")} counties
              {systemData.cities && systemData.cities.length > 0
                ? `; ${systemData.cities.join(", ")}`
                : ""}
            </span>
            <Badge variant="outline" className="text-[10px]">
              CHNA vintage {systemData.vintage}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Priority selector */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select a priority
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHNA_PRIORITIES.map((p) => (
            <PriorityCard
              key={p.id}
              priority={p}
              selected={p.id === selectedPriorityId}
              onClick={() => setSelectedPriorityId(p.id)}
            />
          ))}
        </div>
      </div>

      {/* Priority detail */}
      <div
        className="space-y-5"
        aria-label={`Detail: ${selectedPriority.label}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {selectedPriority.label}
            </h2>
            <Badge
              variant={
                selectedPriority.scope === "enterprise"
                  ? "default"
                  : "secondary"
              }
            >
              {selectedPriority.scope === "enterprise"
                ? "Enterprise priority"
                : `Site-specific: ${selectedPriority.hospitals?.join(", ")}`}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate(
                  `/chna/share?system=${selectedSystemId}&priority=${selectedPriorityId}`,
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              Share brief
            </button>
            <button
              disabled={downloading}
              onClick={async () => {
                setDownloading(true);
                try {
                  await generateCHNABriefPDF(selectedPriority, systemData);
                } finally {
                  setDownloading(false);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={() =>
                generateCHNABriefCSV(selectedPriority, systemData)
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              Download CSV
            </button>
          </div>
        </div>

        {domains.map((domain) => (
          <DomainSection
            key={domain}
            domain={domain}
            priorityId={selectedPriorityId}
          />
        ))}

        <GranularityGapPanel
          priorityId={selectedPriorityId}
          systemLabel={selectedSystem.shortLabel}
        />
      </div>

      {/* Integrity legend */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
        <Info
          className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Data integrity labels:</strong> VERIFIED = measured directly
            from a primary federal or state source. MODELED = derived from
            verified inputs. PROJECTED = forward-looking estimate. Labels are
            fixed per source type and are not editorial characterizations.
          </p>
          <p>
            <strong>Source:</strong> Priority metrics are drawn from the{" "}
            {selectedSystem.shortLabel} Community Health Needs Assessment (
            {selectedSystem.vintage}), which cites BRFSS, MDHHS, CDC, and MDEQ
            as primary sources.
          </p>
        </div>
      </div>
    </div>
  );
}

// County compare sub-components (existing functionality)
function StatCard({
  label,
  value,
  unit,
  avg,
  higherBetter,
}: {
  label: string;
  value: number;
  unit: string;
  avg: number;
  higherBetter: boolean;
}) {
  const diff = value - avg;
  const isBetter = higherBetter ? diff >= 0 : diff <= 0;
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground font-medium mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {value}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {unit}
          </span>
        </p>
        <Badge
          variant={isBetter ? "default" : "destructive"}
          className="mt-2 text-[10px]"
        >
          {diff > 0 ? "+" : ""}
          {diff.toFixed(1)} vs MI avg
        </Badge>
      </CardContent>
    </Card>
  );
}

function BarViz({
  county,
  metric,
}: {
  county: CountyCompareRecord;
  metric: (typeof COMPARE_METRICS)[number];
}) {
  const val = county[metric.key as keyof CountyCompareRecord] as number;
  const max =
    Math.max(
      ...COUNTIES.map(
        (c) => c[metric.key as keyof CountyCompareRecord] as number,
      ),
    ) * 1.1;
  const pct = (val / max) * 100;
  const avgPct = (metric.avg / max) * 100;
  return (
    <div className="relative h-7 bg-muted rounded-full overflow-hidden">
      <div
        className="absolute h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-primary/60"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
      <div
        className="absolute h-full w-0.5 bg-destructive z-10"
        style={{ left: `${avgPct}%` }}
        title={`MI Avg: ${metric.avg}`}
        aria-hidden="true"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground">
        {val}
        {metric.unit}
      </span>
    </div>
  );
}

function CountyCompareTab() {
  const [selectedCounty, setSelectedCounty] = useState("Wayne");
  const [compareCounty, setCompareCounty] = useState("Washtenaw");

  const county = COUNTIES.find((c) => c.name === selectedCounty)!;
  const compare = COUNTIES.find((c) => c.name === compareCounty)!;

  const findings = useMemo(
    () =>
      [
        county.obesityRate > MI_AVG.obesityRate * 1.1 &&
          `Obesity rate ${((county.obesityRate / MI_AVG.obesityRate - 1) * 100).toFixed(0)}% above state average (modeled, CDC PLACES)`,
        county.diabetesRate > MI_AVG.diabetesRate * 1.1 &&
          `Diabetes prevalence ${((county.diabetesRate / MI_AVG.diabetesRate - 1) * 100).toFixed(0)}% above state average (modeled, CDC PLACES)`,
        county.foodInsecurityRate > MI_AVG.foodInsecurityRate * 1.1 &&
          `Food insecurity ${((county.foodInsecurityRate / MI_AVG.foodInsecurityRate - 1) * 100).toFixed(0)}% above state average`,
        county.pcpPer100k > 0 &&
          county.pcpPer100k < MI_AVG.pcpPer100k * 0.8 &&
          `Primary care physician shortage: ${county.pcpPer100k} per 100K vs. ${MI_AVG.pcpPer100k} state average`,
      ].filter(Boolean) as string[],
    [county],
  );

  return (
    <div className="space-y-6">
      {/* County selectors */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Primary County
          </label>
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name} County
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Compare With
          </label>
          <Select value={compareCounty} onValueChange={setCompareCounty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name} County
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compare">Side-by-Side</TabsTrigger>
          <TabsTrigger value="metrics">All Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{county.name} County</CardTitle>
              <p className="text-sm text-muted-foreground">
                Population: {county.population.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Insured Rate"
                  value={county.insuredRate}
                  unit="%"
                  avg={MI_AVG.insuredRate}
                  higherBetter
                />
                <StatCard
                  label="PCPs per 100K"
                  value={county.pcpPer100k}
                  unit=""
                  avg={MI_AVG.pcpPer100k}
                  higherBetter
                />
                <StatCard
                  label="Food Insecurity"
                  value={county.foodInsecurityRate}
                  unit="%"
                  avg={MI_AVG.foodInsecurityRate}
                  higherBetter={false}
                />
                <StatCard
                  label="Facilities"
                  value={county.facilities}
                  unit=""
                  avg={MI_AVG.facilities}
                  higherBetter
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Health Indicators vs. Michigan Average
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Red line = Michigan state average (unweighted mean across all
                83 counties)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {COMPARE_METRICS.map((m) => (
                <div key={m.key} className="flex items-center gap-4">
                  <span className="text-xs font-medium text-muted-foreground w-32 shrink-0 text-right">
                    {m.label}
                  </span>
                  <div className="flex-1">
                    <BarViz county={county} metric={m} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {findings.length > 0 && (
            <Card className="bg-primary text-primary-foreground border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-primary-foreground">
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5" aria-hidden="true">
                        ●
                      </span>
                      <p className="text-sm text-primary-foreground/80">{f}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-center">{county.name}</TableHead>
                    <TableHead className="text-center">
                      {compare.name}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      label: "Population",
                      a: county.population.toLocaleString(),
                      b: compare.population.toLocaleString(),
                    },
                    ...COMPARE_METRICS.map((m) => ({
                      label: m.label,
                      a: `${county[m.key as keyof CountyCompareRecord]}${m.unit}`,
                      b: `${compare[m.key as keyof CountyCompareRecord]}${m.unit}`,
                      higherBetter: m.higherBetter,
                      numA: county[m.key as keyof CountyCompareRecord] as number,
                      numB: compare[m.key as keyof CountyCompareRecord] as number,
                    })),
                  ].map((row, i) => {
                    const numRow = row as {
                      numA?: number;
                      numB?: number;
                      higherBetter?: boolean;
                    };
                    let aWins = false,
                      bWins = false;
                    if (
                      numRow.numA !== undefined &&
                      numRow.numB !== undefined
                    ) {
                      aWins = numRow.higherBetter
                        ? numRow.numA > numRow.numB
                        : numRow.numA < numRow.numB;
                      bWins = !aWins && numRow.numA !== numRow.numB;
                    }
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {row.label}
                        </TableCell>
                        <TableCell
                          className={`text-center font-semibold ${aWins ? "text-emerald-600 dark:text-emerald-400" : bWins ? "text-destructive" : ""}`}
                        >
                          {row.a}
                        </TableCell>
                        <TableCell
                          className={`text-center font-semibold ${bWins ? "text-emerald-600 dark:text-emerald-400" : aWins ? "text-destructive" : ""}`}
                        >
                          {row.b}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>County</TableHead>
                    <TableHead className="text-center">Population</TableHead>
                    {COMPARE_METRICS.map((m) => (
                      <TableHead
                        key={m.key}
                        className="text-center whitespace-nowrap"
                      >
                        {m.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COUNTIES.map((c) => (
                    <TableRow
                      key={c.name}
                      className={`cursor-pointer ${c.name === selectedCounty ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"}`}
                      onClick={() => setSelectedCounty(c.name)}
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-center">
                        {c.population.toLocaleString()}
                      </TableCell>
                      {COMPARE_METRICS.map((m) => (
                        <TableCell key={m.key} className="text-center">
                          {c[m.key as keyof CountyCompareRecord]}
                          {m.unit}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
        <Info
          className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-xs text-muted-foreground">
          <strong>Data Sources:</strong> {COUNTY_UNINSURED_SOURCE} (insured
          rate); {COUNTY_PCP_SOURCE} (PCPs per 100K); {COUNTY_FOOD_INSECURITY_SOURCE};{" "}
          {CDC_PLACES_COUNTY_PROVENANCE.source_name} (obesity, diabetes -
          modeled county-level estimates, not directly measured);{" "}
          {VERIFIED_FACILITY_SOURCE_LABEL} (facilities). All 83 Michigan
          counties. See{" "}
          <a href="/methodology" className="text-primary hover:underline">
            Methodology
          </a>{" "}
          for full documentation.
        </p>
      </div>
    </div>
  );
}

// Main page export
export function CHNAExplorerPage() {
  usePageMeta({
    title: "CHNA Explorer - Access Michigan",
    description:
      "Michigan health system CHNA priorities mapped to workforce, air, water, and access indicators at neighborhood resolution: the granularity the CHNA itself does not provide.",
    path: "/chna-explorer",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data and Insights", href: "/data-and-insights" },
          { label: "CHNA Explorer" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Interactive
            </Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-2">
              Community Health Needs Assessment
            </h1>
            <p className="text-muted-foreground">
              Michigan health system CHNA priorities mapped to the workforce,
              air, water, and access indicators the CHNA names as drivers, at
              the neighborhood granularity the CHNA itself does not provide.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <Tabs defaultValue="priorities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="priorities">System Priorities</TabsTrigger>
            <TabsTrigger value="county-compare">County Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="priorities">
            <PrioritiesTab />
          </TabsContent>

          <TabsContent value="county-compare">
            <CountyCompareTab />
          </TabsContent>
        </Tabs>
      </div>

    </Layout>
  );
}
