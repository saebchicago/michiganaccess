import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import type { IntegrityLabel } from "@/types/chna";
import {
  Activity,
  GitBranch,
  Database,
  HeartPulse,
  TrendingUp,
  Info,
  ExternalLink,
} from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ── sourced / corrected data ─────────────────────────────────────────── */

const leanItems = [
  {
    icon: Activity,
    category: "Throughput Optimization",
    question: "How does the platform reduce patient navigation waste?",
    metrics: {
      before: "4.5 hours",
      after: "12 minutes",
      improvement: "94%",
      label: "Projected Waste Elimination",
    },
    roi: "Projected: $1,500–$3,000 per avoided ED visit × target 850 diverted visits/month = $1.5–$2.7M estimated annual value",
    detail:
      "Multi-signal triage surfaces urgent care, retail clinics, and telehealth above EDs for non-emergent conditions. Filtering by wait time, walk-in availability, and service match routes low-acuity demand to appropriate care tiers.",
    footnote:
      "Navigation time reduction is a modeled projection based on reducing 5 search handoffs to 1. Comparable Lean interventions show lead time reductions of 60–88% (Holden, 2011; PMC systematic review). ED visit cost range per AHRQ HCUP StatBrief #268 and Illustra Health (2025). Diversion volume is a platform target.",
  },
  {
    icon: GitBranch,
    category: "Leakage Reduction",
    question: "How does centralized SDOH navigation preserve network revenue?",
    metrics: {
      before: "34%",
      after: "67%",
      improvement: "+97%",
      label: "Projected Referral Completion",
    },
    roi: "Projected: $2.4M in preserved network revenue annually through reduced out-of-network referrals",
    detail:
      "Integrating community resources into the clinical referral workflow keeps patients within coordinated care ecosystems. Addresses housing, food, and transportation barriers that drive out-of-network exits.",
    footnote:
      "34% baseline aligns with pooled meta-analysis of SDOH referral completion rates (mean 36%, Kreuter et al., PMC). 67% target based on CDC evidence showing direct/warm-handoff referral models raising connection rates from 5% to 75%. Revenue preservation is modeled based on estimated network leakage per out-of-network referral.",
  },
  {
    icon: Database,
    category: "Data Integrity (Poka-Yoke)",
    question: "How is resource decay prevented through error-proofing?",
    metrics: {
      before: "Manual",
      after: "Automated",
      improvement: "100%",
      label: "Validation Coverage",
    },
    roi: "Quarterly CMS refresh + annual HRSA UDS releases + MDHHS registry feeds eliminate stale data",
    detail:
      "Edge Function proxies with 1-hour cache TTL cross-validate CMS Hospital Compare against HRSA UDS and Michigan DHHS registries. Stale records (>90 days) receive degraded confidence scores. Automated reconciliation detects closures and service changes.",
    footnote:
      "CMS Hospital Compare refreshes quarterly (Jan, Apr, Jul, Oct) per eCQI.healthit.gov. HRSA UDS submissions are annual (due Feb 15), published mid-year per BPHC.HRSA.gov. MDHHS feed cadence varies by program.",
  },
  {
    icon: HeartPulse,
    category: "Value-Based Care",
    question: "How does SDOH tracking enable community benefit attribution?",
    metrics: {
      before: "Untracked",
      after: "Full SDOH",
      improvement: "Measured",
      label: "SDOH Integration",
    },
    roi: "Projected: SDOH referral tracking enables IRS Schedule H reporting and VBC contract optimization",
    detail:
      "Social determinants affect up to 50% of county-level variation in health outcomes, while clinical care accounts for only 20% (ASPE/HHS, 2022; Healthy People 2030, ODPHP). Trinity Health screened 1M+ outpatients and found 27.4% reported at least one unmet social need. Their CHW-driven SDOH intervention was system-reported to achieve a ~16% reduction in preventable hospitalizations among dually-enrolled patients (not independently verified). Unified access to housing, SNAP enrollment, utility assistance, and employment services alongside clinical care targets reduced readmissions and chronic disease progression.",
    footnote:
      "SDOH impact sourced from ASPE/HHS 'Addressing Social Determinants of Health' (2022) and Healthy People 2030 (ODPHP). Trinity Health data: 27.4% unmet need rate from 1M+ screened. ~16% hospitalization reduction is system-reported (Trinity Health/FindHelp case study 2025, not independently verified or peer-reviewed). ROI figures are projected platform targets, not achieved outcomes.",
  },
];

const wasteTable = [
  {
    metric: "Search handoffs",
    before: "5",
    after: "1",
    icon: "🔄",
    source: "Platform design (handoff reduction model)",
  },
  {
    metric: "Navigation time",
    before: "4.5 hrs",
    after: "12 min",
    icon: "⏱️",
    source: "Projected based on handoff elimination",
  },
  {
    metric: "Data sources consulted",
    before: "8+",
    after: "1 (unified)",
    icon: "📊",
    source: "Platform architecture",
  },
  {
    metric: "Referral completion",
    before: "34%",
    after: "67%",
    icon: "🎯",
    source: "PMC meta-analysis baseline; CDC warm-handoff target",
  },
  {
    metric: "Resource freshness verification",
    before: "Manual",
    after: "Automated",
    icon: "✅",
    source: "CMS + HRSA UDS + MDHHS cross-validation",
  },
];

const sources = [
  {
    label: "AHRQ HCUP StatBrief #268",
    url: "https://hcup-us.ahrq.gov/reports/statbriefs/sb268-ED-Costs-2017.jsp",
  },
  {
    label: "ASPE/HHS - Social Determinants of Health (2022)",
    url: "https://aspe.hhs.gov/reports/addressing-social-determinants-health-examples-successful-evidence-based-strategies", // check-copy-ok
  },
  {
    label: "Healthy People 2030 - SDOH",
    url: "https://health.gov/healthypeople/priority-areas/social-determinants-health",
  },
  {
    label: "PMC - Lean in Healthcare Systematic Review",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5765299/",
  },
  {
    label: "PMC - SDOH Referral Completion Meta-Analysis",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8107233/",
  },
  {
    label: "CDC - Social Determinants of Health at CDC",
    url: "https://www.cdc.gov/about/priorities/social-determinants-of-health.html",
  },
  {
    label: "CMS Hospital Compare Refresh Schedule",
    url: "https://ecqi.healthit.gov/",
  },
  {
    label: "HRSA UDS Reporting",
    url: "https://bphc.hrsa.gov/data-reporting/uds-training-and-technical-assistance",
  },
  {
    label: "Trinity Health - Community Impact Report (FY2025, Jan 2026)",
    url: "https://company.findhelp.com/blog/2025/09/10/trinity-health-preventable-hospitalizations/",
  },
  {
    label: "Henry Ford Health - ACO Shared Savings (CMS)",
    url: "https://www.cms.gov/priorities/innovation/innovation-models/aco",
  },
  {
    label: "MVC PY 2026-2027 Technical Document",
    url: "https://michiganvalue.org/wp-content/uploads/2024/10/MVC-P4P-Technical-Document-PY26-27-FINAL-10.26.24-compressed-compressed.pdf",
  },
  {
    label: "MiCHWA - CHW Medicaid Registry",
    url: "https://michwa.org/mi-medicaid-chw-credential-registry/",
  },
  {
    label: "MDHHS SDOH Advisory Council Report (March 2025)",
    url: "https://www.michigan.gov/mdhhs/-/media/Project/Websites/mdhhs/Inside-MDHHS/Policy-and-Planning/Social-Determinants-of-Health-Strategy/SDOH-AC-Recs-Report-FINAL-032025.pdf",
  },
];

/* ── verified health system VBC outcomes ────────────────────────────── */

const verifiedOutcomes: {
  system: string;
  highlights: string[];
  source: string;
  integrityLabel: IntegrityLabel;
  vintage: string;
}[] = [
  {
    system: "Trinity Health (FY2025)",
    highlights: [
      "$2.9 billion community impact; $1.4 billion IRS-defined community benefit",
      "$310 million in care costs covering ~450,000 patients",
      "$44 million in community investing loans since 2018 → $1.18 billion local investment",
      "162 CHWs addressed 16,300+ social needs",
      "1 million+ outpatients screened for SDOH; 27.4% reported at least one unmet need",
      "System-reported ~16% decrease in preventable hospitalizations (July 2021–July 2024, dually-enrolled patients; not independently verified)",
      "45% reduction in health disparities (system-reported)",
    ],
    source:
      "Trinity Health Community Impact Report (Jan 2026) / FindHelp case study. Not independently verified or peer-reviewed.",
    integrityLabel: "MODELED",
    vintage: "FY2025, system-reported",
  },
  {
    system: "Henry Ford Health",
    highlights: [
      "Mosaic ACO: $27.2M shared savings, $19.9M retained (PY2024)",
      "Absorbed eight former Ascension Michigan hospitals (October 2024)",
      "$3 billion hospital expansion approved by Detroit City Council (February 2024)",
    ],
    source:
      "Henry Ford Health Mosaic ACO press release (Dec 2025): henryford.com/news/2025/12/henry-ford-health-mosaic-accountable-care-organization-earns-27-million-in-shared-savings",
    integrityLabel: "VERIFIED",
    vintage: "PY2024, Dec 2025 press release",
  },
  {
    system: "CHW Medicaid Reimbursement (Statewide)",
    highlights: [
      "Effective January 1, 2024 (CMS-approved October 2023)",
      "Ratio: 1 CHW per 5,000 Medicaid managed care members (required in MCO contracts)",
      "126-hour training requirement; MiCHWA manages registry",
      "ROI: >$2 return per $1 invested",
    ],
    source: "MDHHS Medicaid policy; MiCHWA registry",
    integrityLabel: "VERIFIED",
    vintage: "2024, MDHHS",
  },
  {
    system: "Michigan Value Collaborative (PY 2026-2027)",
    highlights: [
      "10-point scoring: episode spending (3pts), value metrics (4pts), health equity (1pt, NEW), engagement (2pts)",
      "Covers BCBSM PPO, BCN, Medicare FFS, and now Michigan Medicaid (~84% of insured)",
      "Key measures: sepsis 14-day follow-up rate, cardiac rehab participation rate, health equity",
    ],
    source: "MVC P4P Technical Document PY26-27",
    integrityLabel: "VERIFIED",
    vintage: "PY2026-2027, MVC",
  },
  {
    system: "MDHHS SDOH Hubs (7 Confirmed)",
    highlights: [
      "Cohort 1: Detroit Health Dept, District Health Dept #10, Greater Flint Health Coalition/United Way, Wayne County Health Dept",
      "Cohort 2: United Way of Bay County, Muskegon County Health Dept, Heart of West Michigan United Way (Kent County)",
      "Launched January-May 2024; Advisory Council Report published March 2025",
    ],
    source: "MDHHS SDOH Strategy Advisory Council",
    integrityLabel: "VERIFIED",
    vintage: "2024-2025, MDHHS",
  },
];

/* ── component ────────────────────────────────────────────────────────── */

const LeanHealthcarePage = () => {
  usePageMeta({
    title: "Lean Healthcare Engineering - Access Michigan",
    description:
      "Management engineering methodology: throughput optimization, leakage reduction, and value-based care ROI projections with sourced citations.",
    path: "/lean-healthcare",
  });

  return (
    <Layout>
      <TooltipProvider>
        <section className="py-16">
          <div className="container max-w-5xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Badge
                variant="outline"
                className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary"
              >
                Management Engineering
              </Badge>
              <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">
                Lean Healthcare at Population Scale
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Management engineering applies process optimization principles -
                originally developed in manufacturing - to reduce waste and
                improve flow in healthcare delivery. This page outlines
                projected impact using sourced benchmarks.
              </p>
            </motion.div>

            {/* Methodology note */}
            <Card className="mb-8 border-primary/15 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">
                      Methodology note:
                    </strong>{" "}
                    Performance metrics on this page are{" "}
                    <em>projected targets</em> based on Lean intervention
                    benchmarks from peer-reviewed literature, not achieved
                    outcomes. All figures are labeled accordingly with source
                    citations. Cost ranges reflect published data from AHRQ,
                    CMS, and HRSA.
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Waste Elimination Summary */}
            <Card className="mb-10">
              <CardContent className="py-5">
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Waste
                  Elimination Summary
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-xs text-muted-foreground font-medium">
                          Metric
                        </th>
                        <th className="py-2 text-center text-xs text-muted-foreground font-medium">
                          Current State
                        </th>
                        <th className="py-2 text-center text-xs text-muted-foreground font-medium">
                          Projected State
                        </th>
                        <th className="py-2 text-right text-xs text-muted-foreground font-medium">
                          Source / Basis
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {wasteTable.map((r) => (
                        <tr key={r.metric} className="border-b last:border-0">
                          <td className="py-2 text-xs font-medium text-foreground">
                            {r.icon} {r.metric}
                          </td>
                          <td className="py-2 text-center text-xs text-destructive">
                            {r.before}
                          </td>
                          <td className="py-2 text-center text-xs font-semibold text-primary">
                            {r.after}
                          </td>
                          <td className="py-2 text-right text-[10px] text-muted-foreground max-w-[180px]">
                            {r.source}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Q&A cards */}
            <div className="space-y-6 mb-10">
              {leanItems.map((item, i) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card>
                    <CardContent className="py-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <item.icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              {item.category}
                            </Badge>
                            {item.category.includes("Poka-Yoke") && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs">
                                  <strong>Poka-Yoke</strong> (ポカヨケ):
                                  Japanese for "mistake-proofing" - a Lean
                                  technique from the Toyota Production System
                                  that uses system design to prevent errors
                                  before they occur.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-foreground mt-0.5">
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.detail}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Projected Performance
                          </p>
                          <p className="text-xs">
                            <span className="text-destructive">
                              {item.metrics.before}
                            </span>{" "}
                            →{" "}
                            <span className="text-primary font-bold">
                              {item.metrics.after}
                            </span>
                          </p>
                          <Badge className="mt-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                            {item.metrics.improvement} {item.metrics.label}
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-primary/5 p-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Projected ROI Impact
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            {item.roi}
                          </p>
                        </div>
                      </div>

                      {/* Footnote */}
                      <div className="rounded-md bg-muted/30 p-2.5">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          <strong>Sources:</strong> {item.footnote}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Verified Health System Outcomes */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" /> Verified Health
                System VBC Outcomes
              </h2>
              <div className="space-y-4">
                {verifiedOutcomes.map((outcome) => (
                  <Card key={outcome.system}>
                    <CardContent className="py-5">
                      <h3 className="text-sm font-bold text-foreground mb-2">
                        {outcome.system}
                      </h3>
                      <ul className="space-y-1.5 mb-3">
                        {outcome.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-start gap-2 flex-wrap">
                        <IntegrityBadge
                          label={outcome.integrityLabel}
                          source={outcome.source}
                          vintage={outcome.vintage}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          <strong>Source:</strong> {outcome.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Full source list */}
            <Card className="mb-10">
              <CardContent className="py-5">
                <h2 className="text-sm font-bold text-foreground mb-3">
                  References & Data Sources
                </h2>
                <ul className="space-y-1.5">
                  {sources.map((s) => (
                    <li
                      key={s.url}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="text-center">
              <ShareButton
                title="Lean Healthcare Engineering - Access Michigan"
                description="Throughput optimization, leakage reduction, and value-based care projected ROI methodology."
              />
            </div>
          </div>
        </section>
      </TooltipProvider>
    </Layout>
  );
};

export default LeanHealthcarePage;
