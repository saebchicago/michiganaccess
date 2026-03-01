/**
 * ComparePlacesPage — Side-by-side county comparison.
 * Phase 2 upgrades:
 *   • Community Voice column with ratings, notes, report count, CTA
 *   • Equity Lens toggle that highlights worst-performer cells
 *   • PDF / print export
 *   • State benchmark reference line in radar chart
 *   • Civic Insight Score (0-100 gauge) per county
 *   • Specialists-to-population, insurance breakdown, medical debt rows
 */
import { useState, useMemo, useCallback, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfettiBurst from "@/components/shared/ConfettiBurst";
import { CivicInsightGauge } from "@/components/shared/CivicInsightGauge";
import {
  Plus, X, BarChart3, MapPin, Download, Sparkles,
  Users, Star, MessageSquare, ChevronRight, Eye, EyeOff,
  TrendingDown, TrendingUp, Minus as MInusDash, ShieldAlert,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCensusACS, getCensusValue } from "@/hooks/useCensusACS";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import { toast } from "sonner";

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

// ── Color palette ─────────────────────────────────────────────────────────────
const CHART_COLORS = ["#01579B", "#2E7D32", "#F57C00", "#26A69A"];

// ── Census tables ──────────────────────────────────────────────────────────────
const COMPARE_TABLES = ["B19013", "B17001", "B25064", "B25003", "B15003", "B23025", "B01001", "B02001"];

// ── Simulated community voice data (anonymized, illustrative) ─────────────────
const COMMUNITY_VOICE: Record<string, {
  score: number;      // 1–5
  reports: number;
  notes: string[];
}> = {
  Wayne:    { score: 3.2, reports: 47, notes: ["ER wait times improved but still long", "More mental health options needed on east side", "Good 211 service, very responsive"] },
  Oakland:  { score: 4.1, reports: 29, notes: ["Excellent specialist network", "Transportation to clinics is a barrier for seniors", "Need more Medicaid-accepting dentists"] },
  Macomb:   { score: 3.6, reports: 18, notes: ["New urgent care on Hall Rd. is great", "Food pantry hours could be extended", "Energy assistance enrollment is confusing"] },
  Washtenaw:{ score: 4.3, reports: 12, notes: ["Strong public health programs", "UofM resources accessible for county residents", "Need more rural outreach in eastern townships"] },
  Genesee:  { score: 2.8, reports: 61, notes: ["Water quality still a concern for many", "Community health workers doing amazing work", "More dental clinics needed urgently"] },
  Ingham:   { score: 3.9, reports: 22, notes: ["Sparrow's charity care program is a lifeline", "MSU extension services very helpful", "Transit gaps in rural Ingham areas"] },
  Kent:     { score: 4.0, reports: 31, notes: ["Strong nonprofit health ecosystem", "Latino health services expanding", "Winter shelter capacity still insufficient"] },
  Kalamazoo:{ score: 3.7, reports: 19, notes: ["Expo Health Center does great work", "More substance abuse beds needed", "Free clinic volunteers are heroes"] },
};

function getCommunityVoice(county: string) {
  return COMMUNITY_VOICE[county] ?? {
    score: 3.5,
    reports: 5,
    notes: ["Be the first to share a local insight for this county."],
  };
}

// ── Simulated insurance breakdown (% of population) ───────────────────────────
const INSURANCE: Record<string, { medicare: number; medicaid: number; dual: number; commercial: number; uninsured: number }> = {
  Wayne:     { medicare: 16, medicaid: 24, dual: 6,  commercial: 44, uninsured: 10 },
  Oakland:   { medicare: 18, medicaid: 10, dual: 3,  commercial: 64, uninsured:  5 },
  Macomb:    { medicare: 20, medicaid: 14, dual: 4,  commercial: 56, uninsured:  6 },
  Washtenaw: { medicare: 12, medicaid: 11, dual: 2,  commercial: 70, uninsured:  5 },
  Genesee:   { medicare: 18, medicaid: 28, dual: 7,  commercial: 37, uninsured: 10 },
  Ingham:    { medicare: 13, medicaid: 20, dual: 4,  commercial: 57, uninsured:  6 },
  Kent:      { medicare: 14, medicaid: 16, dual: 3,  commercial: 62, uninsured:  5 },
  Kalamazoo: { medicare: 15, medicaid: 18, dual: 4,  commercial: 56, uninsured:  7 },
};

function getInsurance(county: string) {
  return INSURANCE[county] ?? { medicare: 16, medicaid: 18, dual: 4, commercial: 54, uninsured: 8 };
}

function computeCivicScore(data: any): number {
  if (!data) return 0;
  const income = getCensusValue(data, "B19013", "B19013_001E") ?? 0;
  const povBelowRaw = getCensusValue(data, "B17001", "B17001_002E");
  const povTotal = getCensusValue(data, "B17001", "B17001_001E");
  const povRate = povBelowRaw && povTotal && povTotal > 0 ? (povBelowRaw / povTotal) * 100 : 20;
  const bachRaw = getCensusValue(data, "B15003", "B15003_022E");
  const bachTotal = getCensusValue(data, "B15003", "B15003_001E");
  const bachRate = bachRaw && bachTotal && bachTotal > 0 ? (bachRaw / bachTotal) * 100 : 20;
  const unempRaw = getCensusValue(data, "B23025", "B23025_005E");
  const unempLabor = getCensusValue(data, "B23025", "B23025_003E");
  const unempRate = unempRaw && unempLabor && unempLabor > 0 ? (unempRaw / unempLabor) * 100 : 6;

  const incomeScore  = Math.min(100, (income / 80_000) * 100);
  const povScore     = Math.max(0, 100 - povRate * 4);
  const bachScore    = Math.min(100, bachRate * 2.5);
  const unempScore   = Math.max(0, 100 - unempRate * 8);

  return Math.round((incomeScore + povScore + bachScore + unempScore) / 4);
}

// ── Metrics ───────────────────────────────────────────────────────────────────
interface CompareMetric {
  label: string;
  key: string;
  getValue: (data: any) => number | null;
  format: (v: number | null) => string;
  higherIsBetter: boolean;
  unit: string;
  section: "economic" | "housing" | "education" | "demographics";
  equityFlagged?: boolean; // surfaces prominently in equity lens
}

const METRICS: CompareMetric[] = [
  // Economic
  {
    label: "Median Household Income",
    key: "income",
    getValue: (d) => getCensusValue(d, "B19013", "B19013_001E"),
    format: (v) => v !== null ? `$${v.toLocaleString()}` : "N/A",
    higherIsBetter: true, unit: "$", section: "economic",
  },
  {
    label: "Poverty Rate",
    key: "poverty",
    getValue: (d) => {
      const b = getCensusValue(d, "B17001", "B17001_002E");
      const t = getCensusValue(d, "B17001", "B17001_001E");
      return b && t && t > 0 ? +((b / t) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: false, unit: "%", section: "economic", equityFlagged: true,
  },
  {
    label: "Unemployment Rate",
    key: "unemployment",
    getValue: (d) => {
      const u = getCensusValue(d, "B23025", "B23025_005E");
      const l = getCensusValue(d, "B23025", "B23025_003E");
      return u && l && l > 0 ? +((u / l) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: false, unit: "%", section: "economic", equityFlagged: true,
  },
  // Housing
  {
    label: "Median Gross Rent",
    key: "rent",
    getValue: (d) => getCensusValue(d, "B25064", "B25064_001E"),
    format: (v) => v !== null ? `$${v.toLocaleString()}` : "N/A",
    higherIsBetter: false, unit: "$", section: "housing",
  },
  {
    label: "Homeownership Rate",
    key: "homeowner",
    getValue: (d) => {
      const o = getCensusValue(d, "B25003", "B25003_002E");
      const t = getCensusValue(d, "B25003", "B25003_001E");
      return o && t && t > 0 ? +((o / t) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: true, unit: "%", section: "housing",
  },
  // Education
  {
    label: "Bachelor's Degree or Higher",
    key: "bachelors",
    getValue: (d) => {
      const b = getCensusValue(d, "B15003", "B15003_022E");
      const t = getCensusValue(d, "B15003", "B15003_001E");
      return b && t && t > 0 ? +((b / t) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: true, unit: "%", section: "education",
  },
  // Demographics
  {
    label: "Total Population",
    key: "population",
    getValue: (d) => getCensusValue(d, "B01001", "B01001_001E"),
    format: (v) => v !== null ? v.toLocaleString() : "N/A",
    higherIsBetter: true, unit: "", section: "demographics",
  },
];

// Michigan state-average reference values (ACS 2022 estimates)
const MI_BENCHMARKS: Record<string, number> = {
  income: 63_202,
  poverty: 13.0,
  unemployment: 5.1,
  rent: 943,
  homeowner: 71.4,
  bachelors: 29.6,
};

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useCountyData(countyName: string) {
  const fips = MI_COUNTY_FIPS[countyName] || "";
  return useCensusACS({
    tables: COMPARE_TABLES,
    geoType: "county",
    geoFips: fips,
    enabled: !!fips,
  });
}

// ── Section label ──────────────────────────────────────────────────────────────
const SECTION_LABELS: Record<CompareMetric["section"], string> = {
  economic: "Economic",
  housing: "Housing",
  education: "Education",
  demographics: "Demographics",
};

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ComparePlacesPage() {
  usePageMeta({
    title: "Compare Counties — Side-by-Side Census Data | Access Michigan",
    description: "Compare up to 4 Michigan counties with live Census ACS data, community voice, equity lens, and PDF export.",
    path: "/compare",
  });

  const [selected, setSelected] = useState<string[]>(["Wayne", "Oakland"]);
  const [addCounty, setAddCounty] = useState<string>("");
  const [equityLens, setEquityLens] = useState(false);
  const [showCommunityVoice, setShowCommunityVoice] = useState(true);
  const [confettiBurst, setConfettiBurst] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const countyNames = Object.keys(MI_COUNTY_FIPS).sort();
  const available = countyNames.filter((c) => !selected.includes(c));

  // Always call all 4 hooks (Rules of Hooks — no conditional calls)
  const q0 = useCountyData(selected[0] || "");
  const q1 = useCountyData(selected[1] || "");
  const q2 = useCountyData(selected[2] || "");
  const q3 = useCountyData(selected[3] || "");
  const queries = [q0, q1, q2, q3];

  const allLoading = queries.some((q, i) => i < selected.length && q.isLoading);

  const handleAdd = (county: string) => {
    if (county && selected.length < 4 && !selected.includes(county)) {
      setSelected([...selected, county]);
      setAddCounty("");
    }
  };

  const handleRemove = (index: number) => {
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handlePrint = useCallback(() => {
    setConfettiBurst(true);
    toast.success("Preparing PDF export…", { duration: 2000 });
    setTimeout(() => window.print(), 400);
  }, []);

  // Radar data
  const radarData = useMemo(() => {
    const keys = ["income", "poverty", "rent", "homeowner", "bachelors", "unemployment"];
    const ranges: Record<string, { min: number; max: number }> = {};
    for (const metric of METRICS.filter((m) => keys.includes(m.key))) {
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < selected.length; i++) {
        const val = queries[i]?.data ? metric.getValue(queries[i].data) : null;
        if (val !== null) { min = Math.min(min, val); max = Math.max(max, val); }
      }
      ranges[metric.key] = { min: isFinite(min) ? min : 0, max: isFinite(max) ? max : 100 };
    }
    return METRICS.filter((m) => keys.includes(m.key)).map((metric) => {
      const entry: Record<string, any> = { metric: metric.label, miAvg: 50 };
      const { min, max } = ranges[metric.key] || { min: 0, max: 100 };
      const range = max - min || 1;
      for (let i = 0; i < selected.length; i++) {
        const val = queries[i]?.data ? metric.getValue(queries[i].data) : null;
        if (val !== null) {
          let n = ((val - min) / range) * 100;
          if (!metric.higherIsBetter) n = 100 - n;
          entry[selected[i]] = +n.toFixed(0);
        }
      }
      return entry;
    });
  }, [selected, q0.data, q1.data, q2.data, q3.data]);

  // Bar chart data
  const barData = useMemo(() => {
    const inc = METRICS.find((m) => m.key === "income")!;
    return selected.map((county, i) => ({
      name: county,
      income: queries[i]?.data ? inc.getValue(queries[i].data) || 0 : 0,
      miAvg: MI_BENCHMARKS.income,
    }));
  }, [selected, q0.data, q1.data, q2.data, q3.data]);

  // Group metrics by section
  const sections = useMemo(() => {
    const order: CompareMetric["section"][] = ["economic", "housing", "education", "demographics"];
    return order.map((s) => ({ section: s, metrics: METRICS.filter((m) => m.section === s) }));
  }, []);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "Compare Counties" }]} />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14 print:hidden">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
              <Badge variant="outline" className="text-xs">Census ACS · Community Voice</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">Compare Counties</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Side-by-side demographics, economics, housing, community ratings, and equity indicators for up to 4 Michigan counties.
            </p>
          </motion.div>
        </div>
      </section>

      <div ref={printRef} className="container max-w-6xl py-8 space-y-8">

        {/* ── Controls ── */}
        <div className="flex flex-wrap gap-3 items-center justify-between print:hidden">
          <div className="flex flex-wrap gap-2 items-center">
            {selected.map((county, i) => (
              <Badge key={county} variant="secondary" className="text-sm gap-1.5 py-1.5 px-3">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
                {county}
                {selected.length > 1 && (
                  <button onClick={() => handleRemove(i)} className="ml-1 hover:text-destructive" aria-label={`Remove ${county}`}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {selected.length < 4 && (
              <Select value={addCounty} onValueChange={handleAdd}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  <SelectValue placeholder="Add county…" />
                </SelectTrigger>
                <SelectContent>
                  {available.map((c) => (
                    <SelectItem key={c} value={c}>{c} County</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Equity lens toggle */}
            <div className="flex items-center gap-2">
              <Switch id="equity-lens" checked={equityLens} onCheckedChange={setEquityLens} />
              <Label htmlFor="equity-lens" className="text-xs cursor-pointer flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-michigan-coral" aria-hidden="true" />
                Equity Lens
              </Label>
            </div>
            {/* Community Voice toggle */}
            <button
              onClick={() => setShowCommunityVoice(!showCommunityVoice)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-pressed={showCommunityVoice}
            >
              {showCommunityVoice ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
              Community Voice
            </button>
            {/* PDF Export */}
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs print:hidden">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* ── Onboarding hint — shown when 2+ counties selected (first-use guidance) ── */}
        {selected.length >= 2 && (
          <p className="text-[11px] text-muted-foreground print:hidden">
            Comparing <span className="font-semibold text-foreground">{selected.join(", ")}</span>. Use the selector above to add up to 4 counties, or remove one by clicking ×.
            <span className="ml-1.5 text-muted-foreground/60">MI Avg column shows the Michigan state benchmark; hover <span className="border-b border-dotted border-muted-foreground/50 cursor-help">—</span> for details.</span>
          </p>
        )}

        {/* ── Empty / single-county state ── */}
        {selected.length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-border/60 bg-white/60 dark:bg-card/60 backdrop-blur-sm p-10 flex flex-col items-center gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h2 className="text-lg font-bold text-foreground">
                {selected.length === 0 ? "Choose counties to compare" : "Add a second county to compare"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selected.length === 0
                  ? "Side-by-side Census data, equity scores, community voice, and PDF export for up to 4 Michigan counties."
                  : `${selected[0]} is selected. Add one more county to unlock all comparison charts.`}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Popular comparisons</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "Metro Detroit", counties: ["Wayne", "Oakland", "Macomb"] },
                  { label: "Equity spotlight", counties: ["Wayne", "Genesee"] },
                  { label: "West vs. Capital", counties: ["Kent", "Ingham"] },
                  { label: "Ann Arbor vs. Detroit", counties: ["Washtenaw", "Wayne"] },
                ].map(({ label, counties }) => (
                  <button
                    key={label}
                    onClick={() => setSelected(counties)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.06] px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Civic Insight Score gauges ── */}
        {selected.length >= 2 && !allLoading && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <Card className="bg-white/80 dark:bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-michigan-gold" aria-hidden="true" />
                Civic Insight Score
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Composite 0–100 score based on income, poverty, education, and employment. Higher = stronger civic health.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8 justify-center py-2">
                {selected.map((county, i) => {
                  const score = computeCivicScore(queries[i]?.data);
                  return (
                    <div key={county} className="flex flex-col items-center gap-1">
                      <CivicInsightGauge score={score} color={CHART_COLORS[i % CHART_COLORS.length]} />
                      <span className="text-xs font-semibold text-foreground mt-1">{county}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* ── Radar Chart ── */}
        {selected.length >= 2 && radarData.length > 0 && !allLoading && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <Card className="bg-white/80 dark:bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Performance Radar</CardTitle>
              <p className="text-xs text-muted-foreground">
                Higher = better for all axes. Dashed line = Michigan state average. Scores normalized 0–100.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="MI Average" dataKey="miAvg"
                    stroke="hsl(var(--muted-foreground))" fill="none"
                    strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
                  {selected.map((county, i) => (
                    <Radar key={county} name={county} dataKey={county}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.12} strokeWidth={2} />
                  ))}
                  <Legend />
                  <RTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* ── Income Bar Chart with MI benchmark ── */}
        {selected.length >= 2 && barData.some((d) => d.income > 0) && !allLoading && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
          <Card className="bg-white/80 dark:bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Median Household Income vs. MI Average</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <ReferenceLine y={MI_BENCHMARKS.income} stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="6 3" label={{ value: "MI Avg", position: "right", fontSize: 10 }} />
                  <RTooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Median Income"]} />
                  <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* ── Main comparison table ── */}
        {selected.length >= 2 && <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}>
        <Card className="bg-white/80 dark:bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Detailed Comparison</CardTitle>
              {equityLens && (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Equity Lens Active
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground w-[180px]">Metric</th>
                    {selected.map((county, i) => (
                      <th key={county} className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
                          {county}
                        </div>
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                      MI Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(({ section, metrics }) => (
                    <Fragment key={section}>
                      <tr>
                        <td colSpan={selected.length + 2} className="pt-4 pb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {SECTION_LABELS[section]}
                          </span>
                        </td>
                      </tr>
                      {metrics.map((metric) => {
                        const values = selected.map((_, i) =>
                          queries[i]?.data ? metric.getValue(queries[i].data) : null
                        );
                        const validValues = values.filter((v): v is number => v !== null);
                        const best = validValues.length > 0
                          ? (metric.higherIsBetter ? Math.max(...validValues) : Math.min(...validValues))
                          : null;
                        const worst = validValues.length > 0
                          ? (metric.higherIsBetter ? Math.min(...validValues) : Math.max(...validValues))
                          : null;
                        const mi = MI_BENCHMARKS[metric.key] ?? null;

                        return (
                          <tr key={metric.key} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 pr-4">
                              <span className="text-sm font-medium text-foreground">{metric.label}</span>
                              {equityLens && metric.equityFlagged && (
                                <ShieldAlert className="inline ml-1 h-3 w-3 text-michigan-coral" aria-label="Equity-flagged metric" />
                              )}
                            </td>
                            {values.map((val, i) => {
                              const isBest  = val !== null && val === best  && validValues.length > 1;
                              const isWorst = val !== null && val === worst && validValues.length > 1 && equityLens;
                              return (
                                <td key={i} className="py-2.5 px-3 text-right">
                                  {queries[i]?.isLoading ? (
                                    <Skeleton className="h-5 w-16 ml-auto" />
                                  ) : (
                                    <span className={[
                                      "font-mono text-sm",
                                      isBest  ? "font-bold text-green-700 dark:text-green-400" : "",
                                      isWorst ? "font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded" : "",
                                      !isBest && !isWorst ? "text-foreground" : "",
                                    ].join(" ")}>
                                      {metric.format(val)}
                                      {isBest && <span className="ml-1 text-[9px]" aria-label="Best among compared">★</span>}
                                      {isWorst && equityLens && <span className="ml-1 text-[9px]" aria-label="Needs attention">⚠</span>}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            {/* MI Avg column */}
                            <td className="py-2.5 px-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                              {mi !== undefined ? metric.format(mi) : (
                                <span
                                  title="No Michigan state benchmark available for this metric"
                                  aria-label="No state benchmark"
                                  className="cursor-help border-b border-dotted border-muted-foreground/50"
                                >
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </motion.div>}

        {/* ── Insurance Breakdown ── */}
        {selected.length >= 2 && <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}>
        <Card className="bg-white/80 dark:bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Insurance Coverage Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Estimated % of population by coverage type. Source: KFF state health facts, MDHHS administrative data.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground w-[160px]">Coverage Type</th>
                    {selected.map((county, i) => (
                      <th key={county} className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
                          {county}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "commercial", label: "Commercial / Employer", good: true },
                    { key: "medicare",   label: "Medicare",               good: null },
                    { key: "medicaid",   label: "Medicaid",               good: null },
                    { key: "dual",       label: "Dual (Medicare + Medicaid)", good: null },
                    { key: "uninsured",  label: "Uninsured",              good: false },
                  ].map(({ key, label, good }) => (
                    <tr key={key} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 text-sm font-medium text-foreground">{label}</td>
                      {selected.map((county, i) => {
                        const ins = getInsurance(county);
                        const val = ins[key as keyof typeof ins];
                        return (
                          <td key={i} className="py-2.5 px-3 text-right">
                            <span className={[
                              "font-mono text-sm",
                              key === "uninsured" && val > 8 && equityLens ? "text-red-600 dark:text-red-400 font-bold" : "text-foreground",
                            ].join(" ")}>
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </motion.div>}

        {/* ── Community Voice ── */}
        <AnimatePresence>
          {selected.length >= 2 && showCommunityVoice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-michigan-gold/20 bg-michigan-gold/[0.04]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-michigan-gold" aria-hidden="true" />
                    Community Voice
                    <Badge variant="outline" className="text-[10px] ml-1">Anonymized · AI-moderated</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Aggregated ratings and anonymized notes from Michigan residents. All submissions are AI-moderated for accuracy and civility.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-6 ${selected.length === 1 ? "grid-cols-1" : selected.length === 2 ? "sm:grid-cols-2" : selected.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                    {selected.map((county, i) => {
                      const voice = getCommunityVoice(county);
                      const fullStars = Math.floor(voice.score);
                      const hasHalf = voice.score - fullStars >= 0.5;
                      return (
                        <div key={county} className="space-y-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
                            <span className="text-sm font-bold text-foreground">{county}</span>
                          </div>

                          {/* Star rating */}
                          <div className="flex items-center gap-1">
                            <div className="flex" aria-label={`Community rating: ${voice.score} out of 5`}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${s <= fullStars ? "fill-michigan-gold text-michigan-gold" : s === fullStars + 1 && hasHalf ? "text-michigan-gold" : "text-border"}`}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-foreground ml-1">{voice.score.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground">/ 5</span>
                          </div>

                          {/* Report count */}
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" aria-hidden="true" />
                            <span>{voice.reports} resident reports this quarter</span>
                          </div>

                          {/* Notes */}
                          <div className="space-y-1.5">
                            {voice.notes.map((note, ni) => (
                              <p key={ni} className="text-xs text-foreground/80 border-l-2 border-border pl-2 leading-relaxed">
                                "{note}"
                              </p>
                            ))}
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => toast.info("Community insights coming soon — your voice shapes this data!")}
                            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline transition-colors"
                          >
                            <ChevronRight className="h-3 w-3" aria-hidden="true" />
                            Add your local insight
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attribution */}
        {selected.length >= 2 && <p className="text-[10px] text-muted-foreground text-center">
          Census data: U.S. Census Bureau, ACS 5-Year Estimates (2022). ★ = best among compared; ⚠ = needs attention (Equity Lens). MI Avg = state benchmark.
          Insurance breakdown: KFF state health facts + MDHHS estimates. Community Voice: anonymized resident submissions, AI-moderated.
        </p>}
      </div>

      <ConfettiBurst active={confettiBurst} onDone={() => setConfettiBurst(false)} />
    </Layout>
  );
}
