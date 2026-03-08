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
  Shield, ExternalLink, MessageSquare, FileCode,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageMeta } from "@/hooks/usePageMeta";
import { zipToCounty } from "@/data/michigan-county-seats";
import {
  getZipComparisonSummary,
  METRIC_GROUPS,
  type ZipComparisonSummary,
  type MetricDefinition,
  type MetricGroupId,
} from "@/data/zip-comparison-types";
import AskCopilotButton from "@/components/shared/AskCopilotButton";
import ViewModeToggle, { type ViewMode } from "@/components/shared/ViewModeToggle";
import PartnerCTABar from "@/components/brief/PartnerCTABar";
import { toast } from "sonner";

// ── Icon lookup ──────────────────────────────────────────────────────────────
const GROUP_ICONS: Record<MetricGroupId, React.ReactNode> = {
  health_coverage: <Heart className="h-4 w-4" />,
  income_housing: <Home className="h-4 w-4" />,
  utilities_energy: <Zap className="h-4 w-4" />,
  water_environment: <Droplets className="h-4 w-4" />,
  transport_safety: <Bus className="h-4 w-4" />,
  value_performance: <Activity className="h-4 w-4" />,
};

// ── Animation ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const isValidMIZip = (z: string) => /^4[89]\d{3}$/.test(z);
const isAnyUSZip = (z: string) => /^\d{5}$/.test(z);

function coverageBadgeVariant(level: string): "default" | "secondary" | "outline" {
  if (level === "high") return "default";
  if (level === "medium") return "secondary";
  return "outline";
}

// ── ZipComparisonTable (sub-component) ───────────────────────────────────────
function ZipComparisonTable({ summary }: { summary: ZipComparisonSummary }) {
  const { zips, metricDefinitions, values } = summary;

  const grouped = useMemo(() => {
    const map = new Map<MetricGroupId, MetricDefinition[]>();
    for (const g of METRIC_GROUPS) map.set(g.id, []);
    for (const d of metricDefinitions) map.get(d.groupId)?.push(d);
    return map;
  }, [metricDefinitions]);

  const valueMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of values) {
      const key = `${v.metricId}::${v.zip}`;
      m.set(key, v.value != null ? (v.displayValue ?? String(v.value)) : "");
    }
    return m;
  }, [values]);

  return (
    <>
      {METRIC_GROUPS.map((group, gi) => {
        const defs = grouped.get(group.id);
        if (!defs || defs.length === 0) return null;
        return (
          <motion.div
            key={group.id}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={gi}
          >
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border/40">
                  <span className="text-primary">{GROUP_ICONS[group.id]}</span>
                  <h3 className="font-semibold text-foreground text-sm">{group.title}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-1/3">Metric</th>
                        {zips.map((z) => (
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
                      {defs.map((metric) => (
                        <tr key={metric.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground text-xs flex items-center gap-1">
                              {metric.label}
                              {metric.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-muted-foreground/50 hover:text-primary" aria-label={`Definition: ${metric.label}`}>
                                      <Info className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs text-xs">
                                    <p className="font-semibold mb-1">How we define this</p>
                                    <p>{metric.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            {metric.subtext && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{metric.subtext}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              Source: {metric.sourceShort}{metric.asOfYear ? ` · As of: ${metric.asOfYear}` : ""}
                            </p>
                          </td>
                          {zips.map((z) => {
                            const display = valueMap.get(`${metric.id}::${z}`);
                            const county = zipToCounty(z);
                            return (
                              <td key={z} className="text-center px-3 py-3 tabular-nums text-xs text-foreground">
                                {display ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span>{display}</span>
                                    {county && (
                                      <span className="text-[9px] text-muted-foreground/60 font-normal leading-tight">
                                        County-level data for {county} Co.
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground italic text-[11px]">data not available</span>
                                )}
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
          </motion.div>
        );
      })}
    </>
  );
}

// ── Page Component ───────────────────────────────────────────────────────────
export default function CompareZipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialZips = [
    searchParams.get("z1") || "",
    searchParams.get("z2") || "",
    searchParams.get("z3") || "",
    searchParams.get("z4") || "",
  ];
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const [inputs, setInputs] = useState(initialZips);
  const [activeZips, setActiveZips] = useState<string[]>(
    initialZips.filter(isValidMIZip)
  );

  usePageMeta({
    title: "Compare ZIP Codes — Access Michigan",
    description: "See how Michigan ZIP codes line up on health, coverage, housing, utilities, transportation, and environment — with context, not blame.",
    path: "/compare-zips",
  });

  // Build mock comparison summary for active ZIPs
  const summary: ZipComparisonSummary | null = useMemo(
    () => (activeZips.length >= 2 ? getZipComparisonSummary(activeZips) : null),
    [activeZips]
  );

  const counties = useMemo(() =>
    activeZips.map(z => zipToCounty(z) || "Unknown"),
    [activeZips]
  );

  const handleCompare = useCallback(() => {
    const nonMI = inputs.filter(z => isAnyUSZip(z) && !isValidMIZip(z));
    if (nonMI.length > 0) {
      toast.error(`Access Michigan covers Michigan ZIP codes only. ${nonMI.join(", ")} ${nonMI.length === 1 ? "is" : "are"} outside Michigan.`);
      return;
    }
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

  const hasComparison = summary !== null;

  // ── Export stubs ──
  const handleCSV = useCallback(() => {
    toast.info("CSV export will be wired to real data soon.");
  }, []);
  const handleJSON = useCallback(() => {
    toast.info("JSON export will be wired to real data soon.");
  }, []);
  const copyKeyStats = useCallback(() => {
    if (!summary) return;
    const text = `Comparing Michigan ZIPs: ${summary.zips.join(" vs ")} (mapped to ${counties.join(", ")} counties). Data sources: ${summary.globalSources.join(", ")}. See full comparison at accessmi.org/compare-zips`;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied key stats with citations."));
  }, [summary, counties]);
  const copyMarkdown = useCallback(() => {
    if (!summary) return;
    const lines: string[] = [];
    lines.push(`| Metric | ${summary.zips.join(" | ")} |`);
    lines.push(`|--------|${summary.zips.map(() => "--------").join("|")}|`);
    for (const def of summary.metricDefinitions) {
      const vals = summary.zips.map((z) => {
        const mv = summary.values.find((v) => v.metricId === def.id && v.zip === z);
        return mv?.value != null ? (mv.displayValue ?? String(mv.value)) : "n/a";
      });
      lines.push(`| ${def.label} | ${vals.join(" | ")} |`);
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success("Copied table as Markdown."));
  }, [summary]);

  const copilotContext = hasComparison
    ? `Context: compare_zips. Comparing ZIP codes: ${activeZips.join(", ")} (counties: ${counties.join(", ")}). Data coverage: ${summary!.dataCoverage}. Metrics: ${summary!.metricDefinitions.map(d => d.label).join(", ")}. Instructions: Provide a short summary of the biggest differences between these ZIPs, a "for residents" block, a "for CHNA / planning" block, and 2 cautions about over-interpreting ZIP-level data.`
    : "ZIP comparison page — no active comparison yet.";

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
                <div className="flex items-center gap-3">
                  <Link to="/compare" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Or compare counties instead →
                  </Link>
                  <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>
          </motion.div>
        </div>
      </section>

      {hasComparison && summary && (
        <div className="container max-w-5xl py-8 space-y-8 print:py-4">

          {/* ═══ FAIRNESS DISCLAIMER ═══ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card className="border-warning/30 bg-warning/5 dark:border-warning/20 dark:bg-warning/5">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                  How to use these comparisons
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
                    ZIP codes are about systems, not the worth of people or neighborhoods.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
                    Use these comparisons to understand where services, infrastructure, and investment are stronger or weaker — not to shame communities.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
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
                    <Badge variant={coverageBadgeVariant(summary.dataCoverage)} className="text-xs ml-1 capitalize">
                      {summary.dataCoverage}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">
                    Last major update: {new Date(summary.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <span className="text-muted-foreground">Sources: {summary.globalSources.join(", ")}</span>
                  <Link to="/methodology" className="text-primary hover:underline flex items-center gap-0.5">
                    See full data &amp; methods <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  Some metrics may not be available for every ZIP. Missing or coarse data are clearly marked rather than estimated or filled in.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ COMPARISON TABLE ═══ */}
          <ZipComparisonTable summary={summary} />

          {/* ═══ INTERPRETATION PANELS ═══ */}
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
                      These ZIP codes have different levels of nearby primary care and housing cost burden. Differences often reflect where resources have been invested — not the quality of the people who live there.
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
                      Use these metrics to identify where to deepen qualitative work and community engagement for your next CHNA or community benefit plan.
                    </li>
                    <li>
                      Use these numbers to validate lived experience, not replace it — especially where data coverage is "Medium" or "Limited."
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
                    <li>Download the data to build your own charts and analyses.</li>
                    <li>Always mention the data year and sources in your stories or reports.</li>
                    <li>
                      If something looks off, you can{" "}
                      <Link to="/contact" className="text-primary hover:underline">contact us</Link>
                      {" "}— we regularly fix issues and publish changes.
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
                  Export &amp; share
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleCSV}>
                    <Download className="h-3.5 w-3.5" /> Download CSV
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleJSON}>
                    <Download className="h-3.5 w-3.5" /> Download JSON
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={copyKeyStats}>
                    <Copy className="h-3.5 w-3.5" /> Copy 3 key stats with citations
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={copyMarkdown}>
                    <FileCode className="h-3.5 w-3.5" /> Copy table as Markdown
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  CSV and JSON exports coming soon. Markdown and citation copy work now with county-level data.
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

      {/* ── Empty state ── */}
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
