import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Heart, DollarSign, Leaf, Activity,
  TrendingDown, TrendingUp, BarChart3, Info,
  Loader2, AlertCircle, Building2, Stethoscope, ShieldAlert, Hospital,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useZipData } from "@/hooks/useZipData";
import { computeHealthScore } from "@/lib/health-score";
import { MI_STATE_AVERAGES, MEASURE_GROUPS } from "@/lib/places-client";
import { MI_IRS_STATE_AVERAGES } from "@/data/irs-zip-income";
import { MI_FMR_AVERAGE_2BR, HUD_FMR_SOURCE } from "@/data/hud-fmr";
import { RURALITY_ICONS } from "@/data/rurality";
import { MICHIGAN_SAFMR, MI_SAFMR_AVERAGE_2BR, HUD_SAFMR_SOURCE } from "@/data/hudSafmr";
import { ZIP_TOP_HOSPITALS, CMS_HSAF_SOURCE } from "@/data/cmsHsaf";
import { MICHIGAN_EJSCREEN, EPA_EJSCREEN_SOURCE } from "@/data/ejscreen";
import { MICHIGAN_GEOCARE, HRSA_GEOCARE_SOURCE } from "@/data/geocare";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { countyToSlug } from "@/utils/countyUtils";
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

function CompositeGauge({ score, color, grade }: { score: number; color: string; grade: string }) {
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

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
      <Badge style={{ backgroundColor: color, color: score >= 50 ? "#000" : "#fff" }} className="text-sm px-3 py-0.5">
        Grade: {grade}
      </Badge>
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
  return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "F";
}

// ── Page Component ───────────────────────────────────────────────────────

export default function ZipScorecardPage() {
  const { zipcode } = useParams<{ zipcode: string }>();
  const zip = zipcode ?? "";

  const { cdcData, quickStats, irsData, fmrData, rurality, city, county, loading, error } = useZipData(zip);

  // New data layers
  const safmrData = MICHIGAN_SAFMR[zip] ?? null;
  const hospitalData = ZIP_TOP_HOSPITALS[zip] ?? null;
  const ejData = MICHIGAN_EJSCREEN[zip] ?? null;
  const geocareData = MICHIGAN_GEOCARE[zip] ?? null;

  const cdcDataMap = useMemo(() => {
    const m: Record<string, number> = {};
    cdcData.forEach((d) => { m[d.short_question_text] = d.data_value; });
    return m;
  }, [cdcData]);

  const healthResult = useMemo(() => computeHealthScore(cdcDataMap), [cdcDataMap]);
  const econScore = useMemo(() => computeEconomicScore(irsData, quickStats), [irsData, quickStats]);
  const envScore = useMemo(() => computeEnvironmentScore(cdcDataMap), [cdcDataMap]);

  const compositeScore = useMemo(() => {
    if (cdcData.length === 0 && !irsData && !quickStats) return 0;
    return Math.round(healthResult.score * 0.45 + econScore * 0.35 + envScore * 0.2);
  }, [healthResult.score, econScore, envScore, cdcData.length, irsData, quickStats]);

  const compositeColor = scoreColor(compositeScore);
  const compositeGrade = scoreGrade(compositeScore);

  const headerSubtext = [city, county ? `${county} County` : ""].filter(Boolean).join(", ");

  usePageMeta({
    title: `ZIP ${zip} Scorecard`,
    description: `Health, economic, and environment scorecard for ZIP code ${zip}${city ? ` (${city})` : ""}, Michigan. CDC PLACES, IRS, and HUD data.`,
    path: `/zip/${zip}`,
  });

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
              {county && <Badge variant="outline" className="text-xs">{county} County</Badge>}
              {rurality && (
                <Badge variant="secondary" className="text-xs">
                  {RURALITY_ICONS[rurality.class]} {rurality.class}
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
              {county && (
                <Link to={`/county/${countyToSlug(county)}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="h-4 w-4" /> {county} County
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
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* ── Loading / Error / Not Found States ── */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading CDC PLACES data for ZIP {zip}...</span>
          </div>
        )}

        {!loading && !county && !quickStats && !irsData && cdcData.length === 0 && (
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

        {error && (
          <Card className="border-destructive/30">
            <CardContent className="py-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">Failed to load CDC data. Local data sources are still shown below.</p>
            </CardContent>
          </Card>
        )}

        {/* ── Composite + 3 Score Cards ── */}
        {!loading && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid gap-6 md:grid-cols-4 items-start">
              {/* Composite */}
              <Card className="border-primary/20 md:row-span-1">
                <CardContent className="py-6 flex flex-col items-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Composite Score</p>
                  <CompositeGauge score={compositeScore} color={compositeColor} grade={compositeGrade} />
                </CardContent>
              </Card>

              {/* 3 sub-scores */}
              <div className="md:col-span-3 grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <Heart className="h-4 w-4 text-michigan-coral mb-1" />
                    <ScoreGauge score={healthResult.score} color={healthResult.color} label="Health Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">CDC PLACES 2024</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <DollarSign className="h-4 w-4 text-michigan-gold mb-1" />
                    <ScoreGauge score={econScore} color={scoreColor(econScore)} label="Economic Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">IRS SOI + Census ACS</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-5 flex flex-col items-center gap-1">
                    <Leaf className="h-4 w-4 text-michigan-forest mb-1" />
                    <ScoreGauge score={envScore} color={scoreColor(envScore)} label="Environment Score" />
                    <p className="text-[9px] text-muted-foreground mt-1">CDC + EPA indicators</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>
        )}

        <Separator />

        {/* ── Tabbed Detail Sections ── */}
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health" className="gap-1.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5" /> Health
            </TabsTrigger>
            <TabsTrigger value="economic" className="gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-3.5 w-3.5" /> Economic
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5" /> Resources
            </TabsTrigger>
          </TabsList>

          {/* ── Health Outcomes Tab ── */}
          <TabsContent value="health" className="space-y-4">
            {cdcData.length === 0 && !loading ? (
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
                const available = measures.filter((m) => cdcDataMap[m] != null);
                if (available.length === 0) return null;
                return (
                  <Card key={group}>
                    <CardContent className="py-4">
                      <h3 className="text-sm font-bold text-foreground mb-2">{group}</h3>
                      {available.map((m) => (
                        <MetricRow
                          key={m}
                          label={m}
                          value={cdcDataMap[m]}
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
            {/* Hospital Utilization Card */}
            {hospitalData && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hospital className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Top Hospitals (Medicare Discharges)</h3>
                  </div>
                  <div className="space-y-2">
                    {hospitalData.map((h) => (
                      <div key={h.rank} className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] shrink-0 w-5 h-5 flex items-center justify-center p-0">{h.rank}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{h.hospital_name}</p>
                          <p className="text-[10px] text-muted-foreground">{h.hospital_city}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono font-semibold">{(h.share_of_zip_discharges * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground">{h.discharge_count} discharges</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2">{CMS_HSAF_SOURCE}</p>
                </CardContent>
              </Card>
            )}

            {/* FQHC Penetration Card */}
            {geocareData && !geocareData.is_suppressed && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="h-4 w-4 text-michigan-teal" />
                    <h3 className="text-sm font-bold text-foreground">FQHC Penetration</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <div className="h-6 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-michigan-teal/70"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(geocareData.hcp_penetration_rate * 100, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold tabular-nums">{(geocareData.hcp_penetration_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-semibold">{geocareData.low_income_population.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Low-Income Pop</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{geocareData.hcp_patients.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">HCP Patients</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive">{geocareData.unserved_low_income.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Unserved</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2">{HRSA_GEOCARE_SOURCE}</p>
                </CardContent>
              </Card>
            )}
            {geocareData?.is_suppressed && (
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">FQHC data suppressed for this ZIP (small population). {HRSA_GEOCARE_SOURCE}</p>
                </CardContent>
              </Card>
            )}

            {cdcData.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Source: CDC PLACES 2024 (BRFSS model-based estimates). These are modeled estimates, not clinical data.
              </p>
            )}
          </TabsContent>

          {/* ── Economic Stress Tab ── */}
          <TabsContent value="economic" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickStats && (
                <>
                  <EconCard label="Population" value={quickStats.population.toLocaleString()} source="Census ACS 2022" />
                  <EconCard label="Median Household Income" value={quickStats.medianIncome} format="$" benchmark={`MI avg: $63,202`} source="Census ACS 2022" />
                  <EconCard label="Median Rent" value={quickStats.medianRent} format="$" source="Census ACS 2022" />
                  <EconCard label="Property Tax (est.)" value={quickStats.propTaxEst} format="$" source="MI Treasury" />
                  {quickStats.cityTax !== "0%" && (
                    <EconCard label="City Income Tax" value={quickStats.cityTax} source="MI Treasury" />
                  )}
                  <EconCard label="Graduation Rate" value={`${quickStats.gradRate}%`} benchmark="MI avg: ~82%" source="MI School Data" />
                </>
              )}
              {irsData && (
                <>
                  <EconCard label="Avg Adjusted Gross Income" value={irsData.avgAGI} format="$" benchmark={`MI avg: $${MI_IRS_STATE_AVERAGES.avgAGI.toLocaleString()}`} source="IRS SOI 2021" />
                  <EconCard label="EITC Participation" value={`${irsData.eitcPct}%`} benchmark={`MI avg: ${MI_IRS_STATE_AVERAGES.eitcPct}%`} source="IRS SOI 2021" />
                  <EconCard label="Self-Employed" value={`${irsData.selfEmployedPct}%`} benchmark={`MI avg: ${MI_IRS_STATE_AVERAGES.selfEmployedPct}%`} source="IRS SOI 2021" />
                </>
              )}
              {fmrData && (
                <>
                  <EconCard label="Fair Market Rent (2BR)" value={fmrData.fmr2br} format="$" benchmark={`MI avg: $${MI_FMR_AVERAGE_2BR}`} source={HUD_FMR_SOURCE} />
                  <EconCard label="FMR Range (Studio–4BR)" value={`$${fmrData.fmr0br}–$${fmrData.fmr4br}`} source={HUD_FMR_SOURCE} />
                </>
              )}
              {safmrData && (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Small Area Fair Market Rents (SAFMR)</h3>
                    <div className="space-y-2">
                      {(["0br", "1br", "2br", "3br", "4br"] as const).map((br) => {
                        const key = `safmr_${br}` as keyof typeof safmrData;
                        const val = safmrData[key] as number;
                        const maxVal = safmrData.safmr_4br;
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                        const label = br === "0br" ? "Studio" : br.replace("br", " BR");
                        return (
                          <div key={br} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
                            <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-primary/70"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-xs font-mono font-semibold w-14 text-right">${val}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      MI avg 2BR: ${MI_SAFMR_AVERAGE_2BR} | {safmrData.is_modeled ? "Model-based" : "Survey-based"} | {HUD_SAFMR_SOURCE}
                    </p>
                  </CardContent>
                </Card>
              )}
              {!quickStats && !irsData && !fmrData && !safmrData && (
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
            {/* EJSCREEN Environmental Justice Index */}
            {ejData && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-4 w-4 text-michigan-forest" />
                    <h3 className="text-sm font-bold text-foreground">Environmental Justice Index</h3>
                    <Badge variant={ejData.ej_index >= 70 ? "destructive" : ejData.ej_index >= 45 ? "default" : "secondary"} className="text-[10px] ml-auto">
                      EJ Index: {ejData.ej_index}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([
                      ["PM2.5", ejData.pm25_percentile],
                      ["Ozone", ejData.ozone_percentile],
                      ["Traffic", ejData.traffic_percentile],
                      ["Wastewater", ejData.wastewater_percentile],
                      ["RMP Facilities", ejData.rmp_percentile],
                    ] as const).map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                        <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${val >= 70 ? "bg-red-500" : val >= 45 ? "bg-yellow-500" : "bg-green-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-right mt-0.5">{val}th pctl</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Demographics</p>
                      <p className="text-[10px]">{ejData.pct_low_income}% low-income</p>
                      <p className="text-[10px]">{ejData.pct_minority}% minority</p>
                      <p className="text-[10px]">{ejData.pct_less_hs}% &lt; HS</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2">{EPA_EJSCREEN_SOURCE}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Social Needs from CDC */}
              {(MEASURE_GROUPS["Social Needs"] ?? []).filter((m) => cdcDataMap[m] != null).length > 0 && (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">Social Needs (CDC PLACES)</h3>
                    {MEASURE_GROUPS["Social Needs"].filter((m) => cdcDataMap[m] != null).map((m) => (
                      <MetricRow
                        key={m}
                        label={m}
                        value={cdcDataMap[m]}
                        stateAvg={MI_STATE_AVERAGES[m] ?? 0}
                        unit="%"
                        lowerIsBetter={m !== "Health Insurance"}
                      />
                    ))}
                    <p className="text-[9px] text-muted-foreground mt-2">Source: CDC PLACES 2024</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick links */}
              {[
                { title: "Find a Doctor or Clinic", desc: `Search providers near ${zip}`, href: `/find-care?zip=${zip}`, icon: Stethoscope },
                { title: "Community Resources", desc: county ? `Food, housing, transport in ${county} County` : "Food, housing, transport & more", href: county ? `/resources?county=${county}` : "/resources", icon: Heart },
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
        </Tabs>

        <Separator />

        {/* ── Source Attributions ── */}
        <DataProvenance
          source="CDC PLACES 2024, IRS SOI 2021, HUD FMR/SAFMR FY2024-25, Census ACS 2022, USDA RUCA, CMS HSAF, EPA EJSCREEN v2.3, HRSA GeoCare 2023"
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
