/**
 * CompareZipsPage — Side-by-side ZIP code comparison.
 * Designed for residents, CHNA teams, VBC programs, journalists, and policymakers.
 * Structural context over blame. Data honesty over estimation.
 */
import { useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, MapPin, Download, AlertTriangle, Info, FileText,
  Heart, Home, Zap, Droplets, Bus, Activity, Copy, ArrowRight,
  Shield, ExternalLink, MessageSquare,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCensusACS, getCensusValue } from "@/hooks/useCensusACS";
import { zipToCounty } from "@/data/michigan-county-seats";
import AskCopilotButton from "@/components/shared/AskCopilotButton";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
interface MetricDef {
  key: string;
  label: string;
  subtext: string;
  tooltip: string;
  source: string;
  asOf: string;
  higherIsBetter?: boolean;
  format?: "percent" | "dollar" | "number" | "ratio";
  censusTable?: string;
  censusField?: string;
}

interface MetricSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  metrics: MetricDef[];
}

// ── Metric definitions ───────────────────────────────────────────────────────
const SECTIONS: MetricSection[] = [
  {
    id: "health",
    title: "Health & Coverage",
    icon: <Heart className="h-4 w-4" />,
    metrics: [
      {
        key: "uninsured", label: "Uninsured rate", subtext: "Share of residents without health insurance.",
        tooltip: "Estimated from ACS 5-year data (Table B27001). Reflects civilian noninstitutionalized population.",
        source: "Census ACS", asOf: "2023", format: "percent",
        censusTable: "B27001", censusField: "B27001_005E",
      },
      {
        key: "median_income", label: "Median household income", subtext: "Middle-point household earnings.",
        tooltip: "ACS 5-year estimate (Table B19013). Inflation-adjusted to survey year dollars.",
        source: "Census ACS", asOf: "2023", format: "dollar",
        censusTable: "B19013", censusField: "B19013_001E",
      },
      {
        key: "poverty", label: "Poverty rate", subtext: "Share of residents below the federal poverty level.",
        tooltip: "ACS 5-year estimate (Table B17001). Federal poverty thresholds vary by household size.",
        source: "Census ACS", asOf: "2023", format: "percent",
        censusTable: "B17001", censusField: "B17001_002E",
      },
    ],
  },
  {
    id: "housing",
    title: "Income & Housing Stability",
    icon: <Home className="h-4 w-4" />,
    metrics: [
      {
        key: "median_rent", label: "Median gross rent", subtext: "Typical monthly rent including utilities.",
        tooltip: "ACS 5-year estimate (Table B25064). Includes contract rent plus utility costs.",
        source: "Census ACS", asOf: "2023", format: "dollar",
        censusTable: "B25064", censusField: "B25064_001E",
      },
      {
        key: "owner_occupied", label: "Homeownership rate", subtext: "Share of occupied units that are owner-occupied.",
        tooltip: "ACS 5-year estimate (Table B25003). Higher rates may indicate greater housing stability.",
        source: "Census ACS", asOf: "2023", format: "percent", higherIsBetter: true,
        censusTable: "B25003", censusField: "B25003_002E",
      },
    ],
  },
  {
    id: "energy",
    title: "Utilities & Energy",
    icon: <Zap className="h-4 w-4" />,
    metrics: [
      {
        key: "energy_burden", label: "Energy burden (proxy)", subtext: "Estimated share of income spent on energy.",
        tooltip: "Modeled from DOE LEAD tool and HUD data. Approximate for ZIP-level geographies.",
        source: "DOE / HUD", asOf: "2023", format: "percent",
      },
      {
        key: "outage_burden", label: "Recent outage burden", subtext: "Average customer outage events in major storms over 3–5 years.",
        tooltip: "Based on MPSC and outage datasets where available. Counts may be approximate for some ZIPs; see methodology.",
        source: "MPSC", asOf: "2024",
      },
    ],
  },
  {
    id: "water",
    title: "Water & Environment",
    icon: <Droplets className="h-4 w-4" />,
    metrics: [
      {
        key: "water_violations", label: "Drinking water violations", subtext: "SDWA violations in service area (past 3 years).",
        tooltip: "From EPA SDWIS database, mapped to ZIP by water system service areas. Some ZIPs span multiple systems.",
        source: "EPA SDWIS", asOf: "2024",
      },
      {
        key: "air_quality", label: "Air quality (AQI proxy)", subtext: "Typical air quality index for the area.",
        tooltip: "Based on nearest AirNow monitoring station. May not reflect hyper-local conditions.",
        source: "EPA AirNow", asOf: "2024",
      },
    ],
  },
  {
    id: "transportation",
    title: "Transportation & Safety",
    icon: <Bus className="h-4 w-4" />,
    metrics: [
      {
        key: "commute_time", label: "Average commute time", subtext: "Mean travel time to work in minutes.",
        tooltip: "ACS 5-year estimate. Includes all modes of transportation.",
        source: "Census ACS", asOf: "2023", format: "number",
        censusTable: "B08303", censusField: "B08303_001E",
      },
      {
        key: "no_vehicle", label: "Households without a vehicle", subtext: "Share of households with zero vehicles available.",
        tooltip: "ACS 5-year estimate. Higher rates may indicate transit dependency.",
        source: "Census ACS", asOf: "2023", format: "percent",
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const isValidMIZip = (z: string) => /^4[89]\d{3}$/.test(z);

function formatValue(val: number | null | undefined, format?: string): string {
  if (val == null || isNaN(val)) return "—";
  switch (format) {
    case "percent": return `${val.toFixed(1)}%`;
    case "dollar": return `$${val.toLocaleString()}`;
    case "ratio": return val.toFixed(2);
    default: return val.toLocaleString();
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

// ── Page Component ───────────────────────────────────────────────────────────
export default function CompareZipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialZips = [
    searchParams.get("z1") || "",
    searchParams.get("z2") || "",
    searchParams.get("z3") || "",
    searchParams.get("z4") || "",
  ];
  const [inputs, setInputs] = useState(initialZips);
  const [activeZips, setActiveZips] = useState<string[]>(
    initialZips.filter(isValidMIZip)
  );

  usePageMeta({
    title: "Compare ZIP Codes — Access Michigan",
    description: "See how Michigan ZIP codes line up on health, coverage, housing, utilities, transportation, and environment — with context, not blame.",
    path: "/compare-zips",
  });

  // Census data for active ZIPs (county-level fallback)
  const counties = useMemo(() =>
    activeZips.map(z => zipToCounty(z) || "Unknown"),
    [activeZips]
  );

  const handleCompare = useCallback(() => {
    const valid = inputs.filter(isValidMIZip);
    if (valid.length < 2) {
      toast.error("Enter at least 2 valid Michigan ZIP codes (starting with 48 or 49).");
      return;
    }
    setActiveZips(valid);
    const params = new URLSearchParams();
    valid.forEach((z, i) => params.set(`z${i + 1}`, z));
    setSearchParams(params, { replace: true });
  }, [inputs, setSearchParams]);

  const handleInputChange = (idx: number, val: string) => {
    const next = [...inputs];
    next[idx] = val.replace(/\D/g, "").slice(0, 5);
    setInputs(next);
  };

  // Data coverage assessment
  const dataCoverage = useMemo(() => {
    if (activeZips.length === 0) return "—";
    const knownCounties = counties.filter(c => c !== "Unknown").length;
    if (knownCounties === activeZips.length) return "High";
    if (knownCounties >= activeZips.length * 0.5) return "Medium";
    return "Limited";
  }, [activeZips, counties]);

  const copilotContext = activeZips.length >= 2
    ? `Comparing ZIP codes: ${activeZips.join(", ")} (counties: ${counties.join(", ")}). Data coverage: ${dataCoverage}.`
    : "ZIP comparison page — no active comparison yet.";

  // Copy helpers
  const copyKeyStats = useCallback(() => {
    if (activeZips.length < 2) return;
    const text = `Comparing Michigan ZIPs: ${activeZips.join(" vs ")} (mapped to ${counties.join(", ")} counties). Data sources: MDHHS, CMS, HUD, Census ACS. See full comparison at accessmi.org/compare-zips`;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied key stats to clipboard"));
  }, [activeZips, counties]);

  const hasComparison = activeZips.length >= 2;

  return (
    <Layout>
      {/* ═══ HERO ═══ */}
      <section className="bg-gradient-to-b from-primary/8 via-primary/3 to-background py-12 lg:py-16">
        <div className="container max-w-3xl text-center">
          <Breadcrumbs items={[{ label: "Compare", href: "/compare" }, { label: "ZIP Codes" }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              ZIP Comparison
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              Compare ZIP codes — clearly and fairly
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              See how Michigan ZIP codes line up on health, coverage, housing, utilities, transportation, and environment — with context, not blame.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2 flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3" aria-hidden="true" />
              No ads. No tracking. No made-up numbers. If we don't have data, we say so.
            </p>
          </motion.div>

          {/* ── ZIP Inputs ── */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="mt-8 space-y-4"
          >
            <label className="text-sm font-medium text-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Choose up to 4 Michigan ZIP codes
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {inputs.map((val, i) => (
                <Input
                  key={i}
                  placeholder={`ZIP ${i + 1}`}
                  value={val}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                  className="w-28 text-center tabular-nums"
                  maxLength={5}
                  inputMode="numeric"
                  aria-label={`ZIP code ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button onClick={handleCompare} className="gap-1.5">
                <BarChart3 className="h-4 w-4" /> Compare ZIP codes
              </Button>
              <Link to="/compare" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Or compare counties instead →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {hasComparison && (
        <div className="container max-w-5xl py-8 space-y-8 print:py-4">
          {/* ═══ FAIRNESS DISCLAIMER ═══ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card className="border-amber-200/60 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  How to use these comparisons
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    ZIP codes are about systems, not the worth of people or neighborhoods.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    Use these comparisons to understand where services, infrastructure, and investment are stronger or weaker — not to shame communities.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    Many patterns come from long histories of policy and investment, not individual choices.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ DATA QUALITY STRIP ═══ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    Data quality for this comparison
                  </h3>
                  <span className="text-muted-foreground">
                    Coverage:{" "}
                    <Badge variant={dataCoverage === "High" ? "default" : dataCoverage === "Medium" ? "secondary" : "outline"} className="text-xs ml-1">
                      {dataCoverage}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">Last major update: March 2026</span>
                  <span className="text-muted-foreground">Sources: MDHHS, CMS, HUD, EGLE, MPSC, NHTSA, Census</span>
                  <Link to="/methodology" className="text-primary hover:underline flex items-center gap-0.5">
                    See full data & methods <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  Some metrics may not be available for every ZIP. Missing or coarse data are clearly marked rather than estimated or filled in.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ COMPARISON TABLE ═══ */}
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={si}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border/40">
                    <span className="text-primary">{section.icon}</span>
                    <h3 className="font-semibold text-foreground text-sm">{section.title}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/20">
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-1/3">Metric</th>
                          {activeZips.map((z) => (
                            <th key={z} className="text-center px-3 py-2.5 font-medium text-foreground tabular-nums">
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{z}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {zipToCounty(z) || "Unknown"} Co.
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.metrics.map((metric) => (
                          <tr key={metric.key} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-start gap-1.5">
                                <div>
                                  <div className="font-medium text-foreground text-xs flex items-center gap-1">
                                    {metric.label}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="text-muted-foreground/50 hover:text-primary">
                                          <Info className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="max-w-xs text-xs">
                                        <p className="font-semibold mb-1">How we define this</p>
                                        <p>{metric.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{metric.subtext}</p>
                                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                    Source: {metric.source} · As of: {metric.asOf}
                                  </p>
                                </div>
                              </div>
                            </td>
                            {activeZips.map((z) => (
                              <td key={z} className="text-center px-3 py-3 tabular-nums text-xs text-foreground">
                                <span className="text-muted-foreground italic text-[11px]">Data pending</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* ═══ INTERPRETATION SCAFFOLDING ═══ */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* For Residents */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="h-full">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-primary" />
                    What this means for residents
                  </h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li>
                      Differences between ZIPs often reflect where resources and services have been invested — not the quality of the people who live there.
                    </li>
                    <li>
                      If your ZIP shows gaps in coverage or access, help may be available through local programs and navigators.
                    </li>
                    <li className="flex items-center gap-1">
                      Not sure where to start?
                      <Link to="/find-care" className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Find help near you <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* For CHNA / VBC */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="h-full">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    For CHNA, value-based care, and planning teams
                  </h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li>
                      Larger gaps between ZIPs may signal priorities for your next CHNA or community benefit plan.
                    </li>
                    <li>
                      Use these numbers to validate lived experience and qualitative findings, not replace them — especially where data coverage is "Medium" or "Limited."
                    </li>
                    <li>
                      For deeper analysis, export data and combine with your internal claims, EHR, and survey data.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* For Data Nerds & Journalists */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <Card className="h-full">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    For journalists and data nerds
                  </h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li>Use the export below for your own charts and analyses.</li>
                    <li>Always mention the data vintage and source in your stories.</li>
                    <li>
                      If you see something that looks off, tell us — we routinely fix errors and publish changes.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ═══ EXPORT HELPERS ═══ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Download className="h-4 w-4 text-primary" />
                  Export & share
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled>
                    <Download className="h-3.5 w-3.5" /> Download CSV
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled>
                    <Download className="h-3.5 w-3.5" /> Download JSON
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={copyKeyStats}>
                    <Copy className="h-3.5 w-3.5" /> Copy key stats with citations
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  CSV and JSON exports will be available once live data feeds are connected for ZIP-level metrics.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ COPILOT ═══ */}
          <div className="flex justify-center">
            <AskCopilotButton context={copilotContext} label="Ask Copilot about this comparison" />
          </div>

          {/* ═══ MICRO CTA ═══ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card className="border-primary/20 bg-primary/3">
              <CardContent className="p-6 text-center">
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Use these insights in your work
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-1">
                  If you're leading a CHNA, value-based care program, health plan, utility, or local government project, we can help you use this data responsibly.
                </p>
                <p className="text-xs text-muted-foreground/70 mb-5">
                  Access Michigan is an independent civic effort led by a Michigan healthcare operations and data professional.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/contact">
                    <Button className="gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Talk with Saeb about a project
                    </Button>
                  </Link>
                  <Link to="/methodology">
                    <Button variant="outline" className="gap-1.5">
                      <Shield className="h-4 w-4" /> Learn how we keep this honest
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!hasComparison && (
        <div className="container max-w-2xl py-16 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Enter at least 2 Michigan ZIP codes above to see a side-by-side comparison.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Not sure which ZIPs to compare? Try your home ZIP and a neighboring community.
            </p>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
