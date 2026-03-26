import { useMemo, useState, useCallback } from "react";
import { useParams, Link, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, DollarSign, Leaf, Activity,
  TrendingDown, TrendingUp, BarChart3, Info,
  Loader2, AlertCircle, Building2, Stethoscope,
  GitCompareArrows, Share2, X, Check, Landmark, Layers, Users,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Legend,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useZipData } from "@/hooks/useZipData";
import { computeHealthScore, getAccessTier } from "@/lib/health-score";
import { MI_STATE_AVERAGES, MEASURE_GROUPS } from "@/lib/places-client";
import { MI_IRS_STATE_AVERAGES } from "@/data/irs-zip-income";
import { MI_FMR_AVERAGE_2BR, HUD_FMR_SOURCE } from "@/data/hud-fmr";
import { RURALITY_ICONS } from "@/data/rurality";
import { getScoreBand } from "@/data/zipScoreBands";
import { MICHIGAN_SAFMR } from "@/data/hudSafmr";
import { MICHIGAN_EJSCREEN } from "@/data/ejscreen";
import { MICHIGAN_FEDERAL_SPENDING, getFederalDependencyScore } from "@/data/federalSpending";
import { getEvictionData } from "@/hooks/useEvictionData";
import { MICHIGAN_BOARDS } from "@/data/civicBoards";
import { MICHIGAN_RACE_DATA } from "@/data/uncontestedRaces";
import { MICHIGAN_FEMA_NRI, MICHIGAN_PFAS_BY_COUNTY, MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";
import { getBroadbandByCounty } from "@/hooks/useBroadbandData";
import { getFoodAccessByCounty } from "@/hooks/useFoodAccess";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { countyToSlug } from "@/utils/countyUtils";
import { useZIPDemographics } from "@/hooks/useCensusDemographics";
import { lazy, Suspense } from "react";
const ZIPNarratives = lazy(() => import("@/components/zip/ZIPNarratives"));
const CHNAExport = lazy(() => import("@/components/zip/CHNAExport"));
import DataProvenance from "@/components/shared/DataProvenance";

// ── Score Gauge (reused pattern from NeighborhoodHealthScore) ────────────

function ScoreGauge({ score, color, label }: { score: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 46;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(214, 20%, 90%)" strokeWidth="7" />
          <motion.circle
            cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter value={score} className="text-2xl font-bold text-foreground" duration={1.5} />
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Composite Score (larger gauge) ───────────────────────────────────────

function CompositeGauge({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;
  const tier = getAccessTier(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(214, 20%, 90%)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter value={score} className="text-4xl font-bold text-foreground" duration={1.8} />
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center mt-2 space-y-1">
        <span className={`text-sm font-semibold ${tier.color}`}>
          {tier.badge}
        </span>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          {tier.opportunity}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground max-w-xs text-center">
        Composite of health outcomes, economic indicators, and environment factors.
      </p>
    </div>
  );
}

// ── Metric Row ───────────────────────────────────────────────────────────

function MetricRow({ label, value, stateAvg, unit, lowerIsBetter }: {
  label: string; value: number; stateAvg: number; unit: string; lowerIsBetter: boolean;
}) {
  const diff = value - stateAvg;
  const better = lowerIsBetter ? diff < 0 : diff > 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-foreground truncate max-w-[180px] sm:max-w-none">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono font-semibold tabular-nums">{value.toFixed(1)}{unit}</span>
        <span className={`text-[10px] font-medium flex items-center gap-0.5 ${better ? "text-green-600" : "text-red-500"}`}>
          {better ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(diff).toFixed(1)}pp vs MI
        </span>
      </div>
    </div>
  );
}

// ── Economic Metric Card ─────────────────────────────────────────────────

function EconCard({ label, value, benchmark, format, source }: {
  label: string; value: string | number; benchmark?: string; format?: string; source: string;
}) {
  return (
    <Card>
      <CardContent className="py-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground tabular-nums">{typeof value === "number" ? (format === "$" ? `$${value.toLocaleString()}` : `${value}%`) : value}</p>
        {benchmark && <p className="text-[10px] text-muted-foreground">{benchmark}</p>}
        <p className="text-[9px] text-muted-foreground/60">{source}</p>
      </CardContent>
    </Card>
  );
}

// ── Compute Economic Score ───────────────────────────────────────────────

function computeEconomicScore(irsData: { avgAGI: number; eitcPct: number } | null, quickStats: { medianIncome: number } | null): number {
  if (!irsData && !quickStats) return 50;
  let score = 50;
  if (irsData) {
    const agiRatio = irsData.avgAGI / MI_IRS_STATE_AVERAGES.avgAGI;
    score += Math.max(-25, Math.min(25, (agiRatio - 1) * 50));
    const eitcDelta = MI_IRS_STATE_AVERAGES.eitcPct - irsData.eitcPct;
    score += Math.max(-15, Math.min(15, eitcDelta * 0.5));
  }
  if (quickStats) {
    const incomeRatio = quickStats.medianIncome / 63202; // MI median
    score += Math.max(-10, Math.min(10, (incomeRatio - 1) * 20));
  }
  return Math.round(Math.max(0, Math.min(100, score)));
}

// ── Compute Environment Score ────────────────────────────────────────────

function computeEnvironmentScore(cdcDataMap: Record<string, number>): number {
  let score = 50;
  const asthma = cdcDataMap["Current Asthma"];
  if (asthma != null) {
    const ratio = (MI_STATE_AVERAGES["Current Asthma"] - asthma) / MI_STATE_AVERAGES["Current Asthma"];
    score += Math.max(-20, Math.min(20, ratio * 40));
  }
  const physInact = cdcDataMap["Physical Inactivity"];
  if (physInact != null) {
    const ratio = (MI_STATE_AVERAGES["Physical Inactivity"] - physInact) / MI_STATE_AVERAGES["Physical Inactivity"];
    score += Math.max(-15, Math.min(15, ratio * 30));
  }
  const sleep = cdcDataMap["Short Sleep Duration"];
  if (sleep != null) {
    const ratio = (MI_STATE_AVERAGES["Short Sleep Duration"] - sleep) / MI_STATE_AVERAGES["Short Sleep Duration"];
    score += Math.max(-15, Math.min(15, ratio * 30));
  }
  return Math.round(Math.max(0, Math.min(100, score)));
}

function scoreColor(s: number) {
  return s >= 75 ? "#22c55e" : s >= 60 ? "#84cc16" : s >= 45 ? "#eab308" : s >= 30 ? "#f97316" : "#ef4444";
}

function scoreGrade(s: number) {
  return getAccessTier(s);
}

// ── Helper: build comparison metrics for a ZIP ──────────────────────────

function useZipMetrics(zip: string) {
  const { cdcData, quickStats, irsData, fmrData, rurality, city, county, loading, error } = useZipData(zip);

  const cdcDataMap = useMemo(() => {
    const m: Record<string, number> = {};
    cdcData.forEach((d) => { m[d.short_question_text] = d.data_value; });
    return m;
  }, [cdcData]);

  const healthResult = useMemo(() => {
    try { return computeHealthScore(cdcDataMap); }
    catch { return { score: 0, grade: 'N/A', color: '#888', strengths: [], concerns: [] }; }
  }, [cdcDataMap]);
  const econScore = useMemo(() => {
    try { return computeEconomicScore(irsData, quickStats); }
    catch { return 0; }
  }, [irsData, quickStats]);
  const envScore = useMemo(() => {
    try { return computeEnvironmentScore(cdcDataMap); }
    catch { return 0; }
  }, [cdcDataMap]);

  const compositeScore = useMemo(() => {
    try {
      if (cdcData.length === 0 && !irsData && !quickStats) return 0;
      return Math.round((healthResult.score ?? 0) * 0.45 + (econScore ?? 0) * 0.35 + (envScore ?? 0) * 0.2);
    } catch { return 0; }
  }, [healthResult.score, econScore, envScore, cdcData.length, irsData, quickStats]);

  return {
    cdcData, cdcDataMap, quickStats, irsData, fmrData, rurality, city, county, loading, error,
    healthResult, econScore, envScore, compositeScore,
  };
}

// MI average metrics for comparison table
const MI_AVG_METRICS = {
  compositeScore: 50,
  uninsuredRate: 5.2,
  diabetes: 11.5,
  obesity: 36.2,
  avgAGI: MI_IRS_STATE_AVERAGES.avgAGI,
  eitcRate: MI_IRS_STATE_AVERAGES.eitcPct,
  avgRent: MI_FMR_AVERAGE_2BR,
};

// ── Page Component ───────────────────────────────────────────────────────

export default function ZipScorecardPage() {
  const { zipcode } = useParams<{ zipcode: string }>();
  const zip = zipcode ?? "";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const compareZip = searchParams.get("compare") ?? "";
  const [showCompare, setShowCompare] = useState(!!compareZip);
  const [compareInput, setCompareInput] = useState(compareZip);
  const [copied, setCopied] = useState(false);

  // Primary ZIP data
  const primary = useZipMetrics(zip);

  // Comparison ZIP data (only fetched when compare is active)
  const compZip = compareZip.length === 5 ? compareZip : "";
  const comp = useZipMetrics(compZip);

  const { data: demographics } = useZIPDemographics(zip || null);

  const compositeColor = scoreColor(primary.compositeScore);
  const compositeTier = scoreGrade(primary.compositeScore);
  const scoreBand = getScoreBand(primary.compositeScore);

  const headerSubtext = [primary.city, primary.county ? `${primary.county} County` : ""].filter(Boolean).join(", ");

  usePageMeta({
    title: `ZIP ${zip} Scorecard${compareZip ? ` vs ${compareZip}` : ""}`,
    description: `Health, economic, and environment scorecard for ZIP code ${zip}${primary.city ? ` (${primary.city})` : ""}, Michigan. CDC PLACES, IRS, and HUD data.`,
    path: `/zip/${zip}`,
  });

  const handleCompare = useCallback(() => {
    if (compareInput.length === 5 && /^\d{5}$/.test(compareInput) && compareInput !== zip) {
      navigate(`/zip/${zip}?compare=${compareInput}`, { replace: true });
    }
  }, [compareInput, zip, navigate]);

  const handleClearCompare = useCallback(() => {
    setShowCompare(false);
    setCompareInput("");
    navigate(`/zip/${zip}`, { replace: true });
  }, [zip, navigate]);

  const handleShareComparison = useCallback(() => {
    const url = `${window.location.origin}/zip/${zip}${compareZip ? `?compare=${compareZip}` : ""}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [zip, compareZip]);

  // Build comparison table data
  const comparisonRows = useMemo(() => {
    if (!compareZip) return [];

    const getUninsured = (cdcMap: Record<string, number>) => cdcMap["No Health Insurance"] ?? null;
    const getDiabetes = (cdcMap: Record<string, number>) => cdcMap["Diagnosed Diabetes"] ?? null;
    const getObesity = (cdcMap: Record<string, number>) => cdcMap["Obesity"] ?? null;

    return [
      { label: "Composite Score", zip1: primary.compositeScore, zip2: comp.compositeScore, mi: MI_AVG_METRICS.compositeScore, unit: "/100" },
      { label: "Uninsured Rate", zip1: getUninsured(primary.cdcDataMap), zip2: getUninsured(comp.cdcDataMap), mi: MI_AVG_METRICS.uninsuredRate, unit: "%" },
      { label: "Diabetes", zip1: getDiabetes(primary.cdcDataMap), zip2: getDiabetes(comp.cdcDataMap), mi: MI_AVG_METRICS.diabetes, unit: "%" },
      { label: "Obesity", zip1: getObesity(primary.cdcDataMap), zip2: getObesity(comp.cdcDataMap), mi: MI_AVG_METRICS.obesity, unit: "%" },
      { label: "Avg AGI", zip1: primary.irsData?.avgAGI ?? null, zip2: comp.irsData?.avgAGI ?? null, mi: MI_AVG_METRICS.avgAGI, unit: "$" },
      { label: "EITC Rate", zip1: primary.irsData?.eitcPct ?? null, zip2: comp.irsData?.eitcPct ?? null, mi: MI_AVG_METRICS.eitcRate, unit: "%" },
      { label: "Avg Rent (2BR)", zip1: primary.fmrData?.fmr2br ?? null, zip2: comp.fmrData?.fmr2br ?? null, mi: MI_AVG_METRICS.avgRent, unit: "$" },
    ];
  }, [compareZip, primary, comp]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!compareZip) return [];
    return [
      { metric: "Health", zip1: primary.healthResult.score, zip2: comp.healthResult.score, mi: 50 },
      { metric: "Economic", zip1: primary.econScore, zip2: comp.econScore, mi: 50 },
      { metric: "Environment", zip1: primary.envScore, zip2: comp.envScore, mi: 50 },
      { metric: "Composite", zip1: primary.compositeScore, zip2: comp.compositeScore, mi: 50 },
    ];
  }, [compareZip, primary, comp]);

  const fmtVal = (v: number | null, unit: string) => {
    if (v == null) return "N/A";
    if (unit === "$") return `$${v.toLocaleString()}`;
    if (unit === "/100") return `${v}`;
    return `${v.toFixed(1)}%`;
  };

  if (!zipcode || !/^\d{5}$/.test(zip)) {
    return <Navigate to="/zip-intelligence" replace />;
  }

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "ZIP Intelligence", href: "/zip-intelligence" },
        { label: `ZIP ${zip}` },
      ]} />

      {/* ── Hero Header ── */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <MapPin className="h-5 w-5 text-primary" />
              {primary.county && <Badge variant="outline" className="text-xs">{primary.county} County</Badge>}
              {primary.rurality && (
                <Badge variant="secondary" className="text-xs">
                  {RURALITY_ICONS[primary.rurality.class]} {primary.rurality.class}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-2">
              ZIP Code: {zip}
            </h1>
            {headerSubtext && (
              <p className="text-lg text-muted-foreground mb-5">{headerSubtext}, Michigan</p>
            )}
            <div className="flex flex-wrap gap-3">
              {primary.county && (
                <Link to={`/county/${countyToSlug(primary.county)}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="h-4 w-4" /> {primary.county} County
                  </Button>
                </Link>
              )}
              <Link to={`/place/zip/${zip}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" /> Full Community Brief
                </Button>
              </Link>
              <Link to={`/find-care?zip=${zip}`}>
                <Button size="sm" className="gap-2">
                  <Stethoscope className="h-4 w-4" /> Find Care
                </Button>
              </Link>
              <Button
                variant={showCompare ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setShowCompare(!showCompare)}
              >
                <GitCompareArrows className="h-4 w-4" /> Compare
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* ── Compare Input ── */}
        {showCompare && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-foreground">Compare with:</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="Enter ZIP code"
                    value={compareInput}
                    onChange={(e) => setCompareInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
                    className="w-32 font-mono"
                  />
                  <Button size="sm" onClick={handleCompare} disabled={compareInput.length !== 5 || compareInput === zip}>
                    Compare
                  </Button>
                  {compareZip && (
                    <Button size="sm" variant="ghost" onClick={handleShareComparison} className="gap-1.5">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Share comparison"}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={handleClearCompare} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Loading / Error / Not Found States ── */}
        {primary.loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading CDC PLACES data for ZIP {zip}...</span>
          </div>
        )}

        {!primary.loading && !primary.county && !primary.quickStats && !primary.irsData && primary.cdcData.length === 0 && (
          <Card className="border-michigan-gold/30 bg-michigan-gold/5">
            <CardContent className="py-8 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-michigan-gold mx-auto" />
              <h2 className="text-lg font-bold text-foreground">ZIP Code Not Found</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We don't have data for ZIP code <strong>{zip}</strong>. It may not be a Michigan ZIP code, or it may be a PO Box / special-purpose code.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link to="/zip-intelligence">
                  <Button variant="outline" size="sm">Try Another ZIP</Button>
                </Link>
                <Link to="/find-care">
                  <Button size="sm">Find Care Near You</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {primary.error && (
          <Card className="border-destructive/30">
            <CardContent className="py-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">Failed to load CDC data. Local data sources are still shown below.</p>
            </CardContent>
          </Card>
        )}

        {/* ── Composite + 3 Score Cards ── */}
        {!primary.loading && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid gap-6 md:grid-cols-4 items-start">
              {/* Composite */}
              <Card className="border-primary/20 md:row-span-1">
                <CardContent className="py-6 flex flex-col items-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Composite Score</p>
                  <CompositeGauge score={primary.compositeScore} color={compositeColor} />
                </CardContent>
              </Card>

              {/* 3 sub-scores */}
              <div className="md:col-span-3 grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <Heart className="h-4 w-4 text-michigan-coral mb-1" />
                    <ScoreGauge score={primary.healthResult.score} color={primary.healthResult.color} label="Health Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">CDC PLACES 2024</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <DollarSign className="h-4 w-4 text-michigan-gold mb-1" />
                    <ScoreGauge score={primary.econScore} color={scoreColor(primary.econScore)} label="Economic Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">IRS SOI + Census ACS</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <Leaf className="h-4 w-4 text-michigan-forest mb-1" />
                    <ScoreGauge score={primary.envScore} color={scoreColor(primary.envScore)} label="Environment Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">CDC + EPA indicators</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Score Band Interpretation ── */}
        {!primary.loading && primary.compositeScore > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/60">
              <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${scoreBand.color}`} />
                  <h3 className="text-sm font-bold text-foreground">{scoreBand.label}</h3>
                  <span className="text-xs text-muted-foreground">({scoreBand.min}&#8211;{scoreBand.max})</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{scoreBand.description}</p>
                <p className="text-xs text-primary font-medium">{scoreBand.callToAction}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Comparison Section ── */}
        {compareZip && !comp.loading && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-primary" />
              {zip} vs {compareZip} Comparison
            </h2>

            {/* Comparison Table */}
            <Card>
              <CardContent className="py-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Metric</th>
                      <th className="text-right py-2 text-xs font-semibold text-primary">{zip}</th>
                      <th className="text-right py-2 text-xs font-semibold text-michigan-teal">{compareZip}</th>
                      <th className="text-right py-2 text-xs font-semibold text-muted-foreground">MI Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-border/40 last:border-0">
                        <td className="py-2 text-foreground">{row.label}</td>
                        <td className="py-2 text-right font-mono font-semibold tabular-nums text-primary">{fmtVal(row.zip1, row.unit)}</td>
                        <td className="py-2 text-right font-mono font-semibold tabular-nums text-michigan-teal">{fmtVal(row.zip2, row.unit)}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground tabular-nums">{fmtVal(row.mi, row.unit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <Card>
                <CardContent className="py-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Score Overlay</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="hsl(214, 20%, 85%)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name={zip} dataKey="zip1" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.2} />
                      <Radar name={compareZip} dataKey="zip2" stroke="hsl(172, 66%, 40%)" fill="hsl(172, 66%, 40%)" fillOpacity={0.2} />
                      <Radar name="MI Avg" dataKey="mi" stroke="hsl(0, 0%, 60%)" fill="transparent" strokeDasharray="4 4" />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.section>
        )}

        {comp.loading && compareZip && (
          <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading comparison data for ZIP {compareZip}...</span>
          </div>
        )}

        {/* ── Signals from the Ground ── */}
        {(() => {
          const eviction = getEvictionData(primary.county ?? "");
          const depScore = getFederalDependencyScore(primary.county ?? "");
          const signals = [
            {
              label: "Eviction Filing Rate",
              value: eviction ? `${eviction.eviction_filing_rate}%` : "—",
              context: eviction ? `${eviction.evictions.toLocaleString()} filings/yr` : "Data unavailable",
              source: "Eviction Lab, Princeton 2023",
              severity: eviction && eviction.eviction_filing_rate > 8 ? "high" as const : "moderate" as const,
              icon: "\u{1F3E0}",
            },
            {
              label: "Federal Dependency",
              value: depScore ? `${depScore}%` : "—",
              context: "Of county public revenue from federal sources",
              source: "USASpending.gov FY2024 — Illustrative composite",
              severity: (depScore ?? 0) > 40 ? "high" as const : "moderate" as const,
              icon: "\u{1F4B5}",
            },
            {
              label: "211 Calls/1k Residents",
              value: "7.5",
              context: "Michigan average — county data pending",
              source: "Michigan 211 Annual Report 2024",
              severity: "moderate" as const,
              icon: "\u{1F4DE}",
            },
          ];

          const hasData = eviction || depScore;
          if (!hasData) return null;

          return (
            <Card className="border-primary/10 bg-gradient-to-r from-primary/[0.03] to-transparent">
              <CardContent className="py-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Signals from the Ground
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {signals.map(sig => (
                    <div key={sig.label} className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{sig.icon}</span>
                        <span className={`text-lg font-bold tabular-nums ${
                          sig.severity === "high" ? "text-orange-600" : "text-foreground"
                        }`}>
                          {sig.value}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-foreground leading-tight">
                        {sig.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground leading-tight">
                        {sig.context}
                      </p>
                      <p className="text-[8px] text-muted-foreground/50 leading-tight">
                        {sig.source}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* ── Civic Power Snapshot ── */}
        {(() => {
          const regionData = MICHIGAN_RACE_DATA.find(r => r.counties.includes(primary.county ?? ""));
          const healthBoardCount = MICHIGAN_BOARDS.filter(b => b.category === "health").length;
          if (!primary.county) return null;
          return (
            <Card className="border-primary/10 bg-gradient-to-r from-primary/[0.02] to-transparent">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Civic Power Snapshot
                  </p>
                  <Link to="/civic-power" className="text-[10px] text-primary hover:underline">
                    Full Civic Power Map →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className={`text-xl font-bold tabular-nums ${regionData ? "text-red-600" : "text-foreground"}`}>
                      {regionData ? `${regionData.uncontestedPct.toFixed(1)}%` : "79.7%"}
                    </p>
                    <p className="text-[10px] font-medium text-foreground">Races Uncontested</p>
                    <p className="text-[9px] text-muted-foreground">
                      {regionData?.region ?? "Michigan"} · Ballotpedia 2024
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground tabular-nums">{healthBoardCount}</p>
                    <p className="text-[10px] font-medium text-foreground">Health Board Types</p>
                    <p className="text-[9px] text-muted-foreground">You can apply for in {primary.county}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground tabular-nums">~$75</p>
                    <p className="text-[10px] font-medium text-foreground">Per Diem (CMH Boards)</p>
                    <p className="text-[9px] text-muted-foreground">Mandated by Michigan statute</p>
                  </div>
                  <div className="flex items-center">
                    <Link
                      to="/civic-power/boards"
                      className="w-full rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-2 text-center hover:bg-primary/90 transition-colors"
                    >
                      Find Board Seats →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* ── Planet Score ── */}
        {(() => {
          const c = primary.county ?? "";
          const nri = MICHIGAN_FEMA_NRI.find(n => n.county === c);
          const pfas = MICHIGAN_PFAS_BY_COUNTY[c] ?? 0;
          const energy = MICHIGAN_ENERGY_BURDEN.find(e => e.county === c);
          if (!c || (!nri && !pfas && !energy)) return null;

          const waterStatus = pfas > 5 ? "Amber" : pfas > 0 ? "Watch" : "Clear";
          const disasterStatus = nri ? (nri.compositeRisk > 30 ? "Elevated" : nri.compositeRisk > 20 ? "Moderate" : "Low") : "—";
          const energyStatus = energy ? (energy.lowIncomeBurdenPct > 10 ? "High" : energy.lowIncomeBurdenPct > 7 ? "Moderate" : "Low") : "—";

          return (
            <Card className="border-michigan-teal/10 bg-gradient-to-r from-michigan-teal/[0.03] to-transparent">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Planet Score
                  </p>
                  <Link to="/environment" className="text-[10px] text-primary hover:underline">
                    Full Environment Report →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className={`text-lg font-bold tabular-nums ${waterStatus === "Amber" ? "text-amber-600" : waterStatus === "Watch" ? "text-yellow-600" : "text-green-600"}`}>
                      {pfas} PFAS site{pfas !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] font-medium text-foreground">Water Safety</p>
                    <p className="text-[9px] text-muted-foreground">EGLE MPART 2026</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold tabular-nums ${disasterStatus === "Elevated" ? "text-red-600" : disasterStatus === "Moderate" ? "text-amber-600" : "text-green-600"}`}>
                      {nri ? nri.compositeRisk.toFixed(1) : "—"}
                    </p>
                    <p className="text-[10px] font-medium text-foreground">Disaster Risk</p>
                    <p className="text-[9px] text-muted-foreground">FEMA NRI 2023</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold tabular-nums ${energyStatus === "High" ? "text-red-600" : energyStatus === "Moderate" ? "text-amber-600" : "text-green-600"}`}>
                      {energy ? `${energy.lowIncomeBurdenPct}%` : "—"}
                    </p>
                    <p className="text-[10px] font-medium text-foreground">Energy Burden (Low-Income)</p>
                    <p className="text-[9px] text-muted-foreground">ACEEE LEAD 2023</p>
                  </div>
                  <div className="flex items-center">
                    <Link
                      to="/environment/water"
                      className="w-full rounded-lg bg-michigan-teal text-white text-[10px] font-semibold px-3 py-2 text-center hover:bg-michigan-teal/90 transition-colors"
                    >
                      Check Water Safety →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* ── Transparency Snapshot ── */}
        {(() => {
          const federalData = MICHIGAN_FEDERAL_SPENDING.find(r => r.county === (primary.county ?? ""));
          if (!federalData) return null;
          return (
            <Card className="border-amber-200/20 dark:border-amber-900/20 bg-amber-50/30 dark:bg-amber-950/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transparency Snapshot
                  </p>
                  <Link to="/transparency" className="text-[10px] text-primary hover:underline">
                    Full Transparency Dashboard →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xl font-bold text-amber-600 tabular-nums">
                      ${federalData.total_awards_millions.toLocaleString()}M
                    </p>
                    <p className="text-[10px] font-medium text-foreground">Federal Contracts</p>
                    <p className="text-[9px] text-muted-foreground">{federalData.county} County FY2024</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground tabular-nums">148</p>
                    <p className="text-[10px] font-medium text-foreground">State Legislators</p>
                    <p className="text-[9px] text-muted-foreground">Michigan Legislature</p>
                  </div>
                  <div className="flex items-center">
                    <Link
                      to="/transparency/contractors"
                      className="w-full rounded-lg bg-amber-600 text-white text-[10px] font-semibold px-3 py-2 text-center hover:bg-amber-600/90 transition-colors"
                    >
                      See Contractors →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Separator />

        {/* ── Tabbed Detail Sections ── */}
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="health" className="gap-1.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5" /> Health
            </TabsTrigger>
            <TabsTrigger value="economic" className="gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-3.5 w-3.5" /> Economic
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5" /> Resources
            </TabsTrigger>
            <TabsTrigger value="demographics" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5" /> People
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-1.5 text-xs sm:text-sm">
              <MapPin className="h-3.5 w-3.5" /> Access
            </TabsTrigger>
          </TabsList>

          {/* ── Health Outcomes Tab ── */}
          <TabsContent value="health" className="space-y-4">
            {primary.cdcData.length === 0 && !primary.loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No CDC PLACES data available for ZIP {zip}. This ZCTA may not have sufficient population for reporting.
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(MEASURE_GROUPS).slice(0, 3).map(([group, measures]) => {
                const available = measures.filter((m) => primary.cdcDataMap[m] != null);
                if (available.length === 0) return null;
                return (
                  <Card key={group}>
                    <CardContent className="py-4">
                      <h3 className="text-sm font-bold text-foreground mb-2">{group}</h3>
                      {available.map((m) => (
                        <MetricRow
                          key={m}
                          label={m}
                          value={primary.cdcDataMap[m]}
                          stateAvg={MI_STATE_AVERAGES[m] ?? 0}
                          unit="%"
                          lowerIsBetter={m !== "Annual Checkup" && m !== "Dental Visit" && m !== "Cholesterol Screening" && m !== "Mammography" && m !== "Colorectal Cancer Screening" && m !== "High Blood Pressure Medication"}
                        />
                      ))}
                    </CardContent>
                  </Card>
                );
              })
            )}
            {primary.cdcData.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Source: CDC PLACES 2024 (BRFSS model-based estimates). These are modeled estimates, not clinical data.
              </p>
            )}
          </TabsContent>

          {/* ── Economic Stress Tab ── */}
          <TabsContent value="economic" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {primary.quickStats && (
                <>
                  <EconCard label="Population" value={primary.quickStats.population.toLocaleString()} source="Census ACS 2022" />
                  <EconCard label="Median Household Income" value={primary.quickStats.medianIncome} format="$" benchmark={`MI avg: $63,202`} source="Census ACS 2022" />
                  <EconCard label="Median Rent" value={primary.quickStats.medianRent} format="$" source="Census ACS 2022" />
                  <EconCard label="Property Tax (est.)" value={primary.quickStats.propTaxEst} format="$" source="MI Treasury" />
                  {primary.quickStats.cityTax !== "0%" && (
                    <EconCard label="City Income Tax" value={primary.quickStats.cityTax} source="MI Treasury" />
                  )}
                  <EconCard label="Graduation Rate" value={`${primary.quickStats.gradRate}%`} benchmark="MI avg: ~82%" source="MI School Data" />
                </>
              )}
              {primary.irsData && (
                <>
                  <EconCard label="Avg Adjusted Gross Income" value={primary.irsData.avgAGI} format="$" benchmark={`MI avg: $${MI_IRS_STATE_AVERAGES.avgAGI.toLocaleString()}`} source="IRS SOI 2021" />
                  <EconCard label="EITC Participation" value={`${primary.irsData.eitcPct}%`} benchmark={`MI avg: ${MI_IRS_STATE_AVERAGES.eitcPct}%`} source="IRS SOI 2021" />
                  <EconCard label="Self-Employed" value={`${primary.irsData.selfEmployedPct}%`} benchmark={`MI avg: ${MI_IRS_STATE_AVERAGES.selfEmployedPct}%`} source="IRS SOI 2021" />
                </>
              )}
              {primary.fmrData && (
                <>
                  <EconCard label="Fair Market Rent (2BR)" value={primary.fmrData.fmr2br} format="$" benchmark={`MI avg: $${MI_FMR_AVERAGE_2BR}`} source={HUD_FMR_SOURCE} />
                  <EconCard label="FMR Range (Studio–4BR)" value={`$${primary.fmrData.fmr0br}–$${primary.fmrData.fmr4br}`} source={HUD_FMR_SOURCE} />
                </>
              )}
              {MICHIGAN_SAFMR[zip] && (
                <>
                  <EconCard label="SAFMR (2BR)" value={MICHIGAN_SAFMR[zip].safmr_2br} format="$" benchmark={`ZIP-level rent limit (FY${MICHIGAN_SAFMR[zip].fy})`} source="HUD Small Area FMR" />
                  <EconCard label="SAFMR Range (Studio–4BR)" value={`$${MICHIGAN_SAFMR[zip].safmr_0br}–$${MICHIGAN_SAFMR[zip].safmr_4br}`} source="HUD Small Area FMR" />
                </>
              )}
              {/* Federal Funding Context */}
              {(() => {
                const federalData = MICHIGAN_FEDERAL_SPENDING.find(r => r.county === primary.county);
                const dependencyScore = primary.county ? getFederalDependencyScore(primary.county) : null;
                if (!federalData) return null;
                return (
                  <Card className="sm:col-span-2 lg:col-span-3">
                    <CardContent className="py-4">
                      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-primary" /> Federal Funding Context
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Source: USASpending.gov FY2024
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-2xl font-bold text-foreground tabular-nums">
                            ${federalData.total_awards_millions.toLocaleString()}M
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total federal awards to {federalData.county} County (FY2024)
                          </p>
                        </div>
                        {dependencyScore != null && (
                          <div>
                            <p className="text-2xl font-bold text-foreground tabular-nums">
                              {dependencyScore}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Federal dependency score
                              <span className="text-muted-foreground/60 ml-1">(Illustrative composite)</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
              {!primary.quickStats && !primary.irsData && !primary.fmrData && !MICHIGAN_SAFMR[zip] && (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="py-8 text-center">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No pre-loaded economic data for ZIP {zip}. Try the{" "}
                      <Link to={`/place/zip/${zip}`} className="text-primary underline">full community brief</Link>{" "}
                      for live Census data.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Resources Tab ── */}
          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Social Needs from CDC */}
              {(MEASURE_GROUPS["Social Needs"] ?? []).filter((m) => primary.cdcDataMap[m] != null).length > 0 && (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">Social Needs (CDC PLACES)</h3>
                    {MEASURE_GROUPS["Social Needs"].filter((m) => primary.cdcDataMap[m] != null).map((m) => (
                      <MetricRow
                        key={m}
                        label={m}
                        value={primary.cdcDataMap[m]}
                        stateAvg={MI_STATE_AVERAGES[m] ?? 0}
                        unit="%"
                        lowerIsBetter={m !== "Health Insurance"}
                      />
                    ))}
                    <p className="text-[9px] text-muted-foreground mt-2">Source: CDC PLACES 2024</p>
                  </CardContent>
                </Card>
              )}

              {/* EJSCREEN Environmental Justice */}
              {MICHIGAN_EJSCREEN[zip] && (() => {
                const ej = MICHIGAN_EJSCREEN[zip];
                return (
                  <Card className="sm:col-span-2 lg:col-span-3">
                    <CardContent className="py-4">
                      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-michigan-forest" /> EPA EJSCREEN Environmental Justice
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">EJ Index</span>
                          <span className="text-xs font-mono font-semibold">{ej.ej_index}/100</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">PM2.5 Percentile</span>
                          <span className="text-xs font-mono font-semibold">{ej.pm25_percentile}th</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">Ozone Percentile</span>
                          <span className="text-xs font-mono font-semibold">{ej.ozone_percentile}th</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">Traffic Proximity</span>
                          <span className="text-xs font-mono font-semibold">{ej.traffic_percentile}th</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">% Low Income</span>
                          <span className="text-xs font-mono font-semibold">{ej.pct_low_income}%</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40">
                          <span className="text-xs text-muted-foreground">% Minority</span>
                          <span className="text-xs font-mono font-semibold">{ej.pct_minority}%</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-2">Source: EPA EJSCREEN v2.3 ({ej.data_year}). Higher percentiles = greater environmental burden.</p>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Quick links */}
              {[
                { title: "Find a Doctor or Clinic", desc: `Search providers near ${zip}`, href: `/find-care?zip=${zip}`, icon: Stethoscope },
                { title: "Community Resources", desc: primary.county ? `Food, housing, transport in ${primary.county} County` : "Food, housing, transport & more", href: primary.county ? `/resources?county=${primary.county}` : "/resources", icon: Heart },
                { title: "Financial Assistance", desc: "Medicaid, SNAP, LIHEAP & more", href: "/financial-help", icon: DollarSign },
              ].map((r) => (
                <Link key={r.title} to={r.href}>
                  <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                    <CardContent className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <r.icon className="h-4 w-4 text-primary shrink-0" />
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* ── Demographics Tab ── */}
          <TabsContent value="demographics" className="space-y-4">
            {demographics ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Population</p>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{demographics.totalPop.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">{demographics.source}</p>
                  </CardContent>
                </Card>

                {/* Race/Ethnicity */}
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm font-bold text-foreground mb-3">Race & Ethnicity</p>
                    <div className="h-6 rounded-full overflow-hidden flex mb-3">
                      <div className="h-full bg-[#4f86c6]" style={{ width: `${demographics.white_alone_pct}%` }} title={`White ${demographics.white_alone_pct.toFixed(1)}%`} />
                      <div className="h-full bg-[#f59e0b]" style={{ width: `${demographics.black_alone_pct}%` }} title={`Black ${demographics.black_alone_pct.toFixed(1)}%`} />
                      <div className="h-full bg-[#10b981]" style={{ width: `${demographics.hispanic_pct}%` }} title={`Hispanic ${demographics.hispanic_pct.toFixed(1)}%`} />
                      <div className="h-full bg-[#8b5cf6]" style={{ width: `${demographics.asian_alone_pct}%` }} title={`Asian ${demographics.asian_alone_pct.toFixed(1)}%`} />
                      <div className="h-full bg-[#94a3b8]" style={{ width: `${demographics.multiracial_pct}%` }} title={`Other ${demographics.multiracial_pct.toFixed(1)}%`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                      <span><span className="inline-block h-2 w-2 rounded-full bg-[#4f86c6] mr-1" />White {demographics.white_alone_pct.toFixed(1)}% <span className="text-muted-foreground">(MI: {demographics.miStateWhitePct}%)</span></span>
                      <span><span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] mr-1" />Black {demographics.black_alone_pct.toFixed(1)}% <span className="text-muted-foreground">(MI: {demographics.miStateBlackPct}%)</span></span>
                      <span><span className="inline-block h-2 w-2 rounded-full bg-[#10b981] mr-1" />Hispanic {demographics.hispanic_pct.toFixed(1)}% <span className="text-muted-foreground">(MI: {demographics.miStateHispanicPct}%)</span></span>
                      <span><span className="inline-block h-2 w-2 rounded-full bg-[#8b5cf6] mr-1" />Asian {demographics.asian_alone_pct.toFixed(1)}%</span>
                      <span><span className="inline-block h-2 w-2 rounded-full bg-[#94a3b8] mr-1" />Other {demographics.multiracial_pct.toFixed(1)}%</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-2">{demographics.source}</p>
                  </CardContent>
                </Card>

                {/* Language & Disability */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-sm font-bold text-foreground mb-2">Language Access</p>
                      <EconCard label="Limited English Proficiency" value={`${demographics.lep_pct.toFixed(1)}%`} benchmark={`MI avg: ${demographics.miStateLEPPct}%`} source={demographics.source} />
                      {demographics.spanish_speakers_pct > 1 && <p className="text-xs text-muted-foreground mt-1">Spanish speakers: {demographics.spanish_speakers_pct.toFixed(1)}%</p>}
                      {demographics.arabic_speakers_pct > 1 && <p className="text-xs text-muted-foreground mt-1">Arabic speakers: {demographics.arabic_speakers_pct.toFixed(1)}%</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-sm font-bold text-foreground mb-2">Disability & Housing</p>
                      <EconCard label="Disability Rate" value={`${demographics.disability_pct.toFixed(1)}%`} benchmark={`MI avg: ${demographics.miStateDisabilityPct}%`} source={demographics.source} />
                      <p className="text-xs text-muted-foreground mt-2">Renter: {demographics.renter_pct.toFixed(1)}% · Owner: {demographics.owner_pct.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Equity framing */}
                <Card className="border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardContent className="py-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      ZIP code demographics shape health outcomes — not because of race, but because of systems. Structural factors like housing, employment, and access create the patterns visible here.
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">Framing: CDC Health Equity / RWJF research</p>
                  </CardContent>
                </Card>

                {/* Narrative + CHNA */}
                <Suspense fallback={null}>
                  <ZIPNarratives zip={zip} county={primary.county ?? ""} equityScore={primary.compositeScore} equityTier={compositeTier.tier}
                    topHealthConcern={primary.healthResult.concerns[0] ?? "Multiple factors"} medianIncome={demographics.medianHouseholdIncome}
                    renterPct={demographics.renter_pct} lepPct={demographics.lep_pct} disabilityPct={demographics.disability_pct} />
                </Suspense>

                <div className="flex justify-end">
                  <Suspense fallback={null}>
                    <CHNAExport zip={zip} county={primary.county ?? ""} equityScore={primary.compositeScore} equityTier={compositeTier.tier}
                      topConcerns={[...primary.healthResult.concerns, ...(primary.healthResult.strengths.length === 0 ? ["Access barriers"] : [])]} />
                  </Suspense>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading Census demographics for ZIP {zip}...</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">Source: Census ACS 5-Year Estimates 2022</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Access & Infrastructure Tab ── */}
          <TabsContent value="access" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Broadband */}
              {(() => {
                const bb = getBroadbandByCounty(primary.county ?? "");
                if (!bb) return null;
                return (
                  <>
                    <EconCard label="Broadband (25/3 Mbps)" value={`${bb.pct_25_3_covered}%`} benchmark="MI avg: ~94%" source="FCC Broadband Map 2024" />
                    <EconCard label="Gigabit Coverage" value={`${bb.pct_gigabit_covered}%`} source="FCC Broadband Map 2024" />
                    <EconCard label="Unserved Locations" value={bb.unserved_locations.toLocaleString()} benchmark="< 25/3 Mbps" source="FCC Broadband Map 2024" />
                  </>
                );
              })()}

              {/* Food Access */}
              {(() => {
                const fa = getFoodAccessByCounty(primary.county ?? "");
                if (!fa) return null;
                return (
                  <>
                    <EconCard label="Food Access" value={fa.classification} source="USDA FARA 2019" />
                    <EconCard label="Low-Access Tracts" value={`${fa.lowAccessPct.toFixed(1)}%`} benchmark={`${fa.lowAccessTracts} of ${fa.totalTracts} tracts`} source="USDA FARA 2019" />
                    <EconCard label="No Vehicle + Low Access" value={fa.noVehicleLowAccessPop.toLocaleString()} benchmark="Most vulnerable population" source="USDA FARA 2019" />
                  </>
                );
              })()}

              {!getBroadbandByCounty(primary.county ?? "") && !getFoodAccessByCounty(primary.county ?? "") && (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="py-8 text-center">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No infrastructure data seeded for {primary.county ?? "this"} county yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Deep Map CTA */}
            <Card className="bg-primary/[0.03] border-primary/20">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">See all data layers on one map</p>
                <Link to={`/map/layers?zip=${zip}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors">
                  <Layers className="h-4 w-4" /> Explore on Deep Map
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* ── Source Attributions ── */}
        <DataProvenance
          source="CDC PLACES 2024 (BRFSS), IRS Statistics of Income 2021, HUD FMR FY2025, Census ACS 2022, USDA RUCA"
          updated="2025"
          methodologyHref="/methodology"
        />

        <details className="text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary flex items-center gap-1">
            <Info className="h-3 w-3" /> Score methodology
          </summary>
          <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed space-y-2 max-w-2xl">
            <p><strong>Health Score</strong> — Composite of 12 CDC PLACES measures weighted by health impact, compared to Michigan state averages.</p>
            <p><strong>Economic Score</strong> — Based on adjusted gross income, EITC participation, and median household income relative to state benchmarks.</p>
            <p><strong>Environment Score</strong> — Derived from asthma prevalence, physical inactivity, and sleep duration as proxies for environmental health.</p>
            <p><strong>Composite</strong> — Weighted blend: 45% health, 35% economic, 20% environment. This is an illustrative index, not a clinical or policy assessment.</p>
          </div>
        </details>
      </div>
    </Layout>
  );
}
