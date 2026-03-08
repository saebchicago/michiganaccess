import { motion } from "framer-motion";
import {
  Activity,
  Zap,
  Droplets,
  Bus,
  TreePine,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNerdMode } from "@/contexts/NerdModeContext";
import NerdModeToggle from "@/components/shared/NerdModeToggle";
import type { Place } from "@/models/Place";

/* ── Types ─────────────────────────────────────────────────── */

interface VPMetric {
  label: string;
  value: string;
  stateAvg?: string;
  direction: "higher-is-better" | "lower-is-better" | "neutral";
  soWhat: string;
  source: string;
  sourceYear: string;
}

interface VPDomain {
  id: string;
  title: string;
  subtitle?: string;
  funderNote?: string;
  icon: typeof Activity;
  color: string;
  bgColor: string;
  metrics: VPMetric[];
}

/* ── Delta chip ────────────────────────────────────────────── */

function DeltaIndicator({
  direction,
}: {
  direction: "higher-is-better" | "lower-is-better" | "neutral";
}) {
  if (direction === "neutral")
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  // We show a generic indicator — actual comparison would need numeric data
  return direction === "higher-is-better" ? (
    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <TrendingDown className="h-3 w-3 text-amber-600 dark:text-amber-400" />
  );
}

/* ── Build domain data for a place ─────────────────────────── */

function getHighlight(highlights: { label: string; value: string }[] | undefined, search: string): string {
  if (!highlights) return "Data pending";
  const found = highlights.find((h) => h.label.toLowerCase().includes(search.toLowerCase()));
  return found?.value || "Data pending";
}

function buildDomains(place: Place): VPDomain[] {
  const profile = place.countyProfile;
  const hh = profile?.healthHighlights;

  return [
    {
      id: "health-vbc",
      title: "Health — Value-Based Care",
      subtitle: "Avoidable use, access equity, and social risk.",
      funderNote: "Use for CHNAs, community benefit, VBC program design.",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      metrics: [
        {
          label: "Uninsured Rate",
          value: getHighlight(hh, "uninsured"),
          stateAvg: "6.2%",
          direction: "lower-is-better",
          soWhat: "Lower means more people can access preventive care without financial hardship.",
          source: "Census ACS",
          sourceYear: "2023",
        },
        {
          label: "Primary Care Ratio",
          value: getHighlight(hh, "primary care"),
          stateAvg: "1,280:1",
          direction: "lower-is-better",
          soWhat: "Fewer patients per provider means shorter waits and more access.",
          source: "County Health Rankings",
          sourceYear: "2024",
        },
        {
          label: "Preventable Hospital Stays",
          value: "Data pending",
          stateAvg: "4,710 per 100K",
          direction: "lower-is-better",
          soWhat: "High rates signal gaps in outpatient care that drive costly ER visits.",
          source: "CMS / CHR",
          sourceYear: "2024",
        },
        {
          label: "Food Insecurity",
          value: getHighlight(hh, "food"),
          stateAvg: "13.5%",
          direction: "lower-is-better",
          soWhat: "Food insecurity compounds chronic conditions like diabetes and hypertension.",
          source: "Feeding America",
          sourceYear: "2023",
        },
      ],
    },
    {
      id: "energy-pbr",
      title: "Energy — Performance-Based Regulation",
      subtitle: "Reliability, outage equity, and energy burden.",
      funderNote: "Use for PBR rate cases, equity filings, utility performance reviews.",
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      metrics: [
        {
          label: "Avg. Outage Duration (SAIDI)",
          value: "Data pending",
          stateAvg: "~480 min/yr",
          direction: "lower-is-better",
          soWhat: "Longer outages disproportionately harm medically vulnerable residents.",
          source: "MPSC / EIA",
          sourceYear: "2024",
        },
        {
          label: "Outage Frequency (SAIFI)",
          value: "Data pending",
          stateAvg: "~1.3 events/yr",
          direction: "lower-is-better",
          soWhat: "Frequent outages signal aging infrastructure or storm vulnerability.",
          source: "MPSC",
          sourceYear: "2024",
        },
        {
          label: "Energy Burden",
          value: "Data pending",
          stateAvg: "3.5% of income",
          direction: "lower-is-better",
          soWhat: "When energy costs exceed 6% of income, families face impossible tradeoffs.",
          source: "DOE LEAD Tool",
          sourceYear: "2023",
        },
      ],
    },
    {
      id: "water",
      title: "Water — Safe, Affordable, Reliable",
      subtitle: "Drinking water quality, lead risk, and affordability.",
      funderNote: "Use for infrastructure grants, lead remediation priorities.",
      icon: Droplets,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-500/10",
      metrics: [
        {
          label: "Drinking Water Violations",
          value: "Data pending",
          stateAvg: "Varies",
          direction: "lower-is-better",
          soWhat: "Violations may indicate treatment failures or aging distribution systems.",
          source: "EPA SDWIS",
          sourceYear: "2024",
        },
        {
          label: "Lead Service Lines",
          value: "Data pending",
          direction: "lower-is-better",
          soWhat: "Lead pipes pose acute health risks, especially for children.",
          source: "EGLE",
          sourceYear: "2024",
        },
      ],
    },
    {
      id: "transportation",
      title: "Transportation — Access & Safety",
      subtitle: "Transit coverage, crash burden, and connectivity.",
      funderNote: "Use for transit grants, Safe Routes to School, MDOT planning.",
      icon: Bus,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      metrics: [
        {
          label: "Transit Coverage",
          value: "Data pending",
          direction: "higher-is-better",
          soWhat: "Lack of transit isolates residents from jobs, healthcare, and services.",
          source: "NTD / MDOT",
          sourceYear: "2024",
        },
        {
          label: "Crash Rate",
          value: "Data pending",
          stateAvg: "~650 per 100K",
          direction: "lower-is-better",
          soWhat: "High crash rates reflect road design and enforcement gaps.",
          source: "Michigan Traffic Crash Facts",
          sourceYear: "2023",
        },
      ],
    },
    {
      id: "environment",
      title: "Environment — Justice & Exposure",
      subtitle: "Air quality, contamination risk, and environmental justice.",
      funderNote: "Use for EJ screening, Superfund proximity analysis, CHNA environmental factors.",
      icon: TreePine,
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      metrics: [
        {
          label: "Unhealthy Air Days (AQI > 100)",
          value: "Data pending",
          stateAvg: "~5 days/yr",
          direction: "lower-is-better",
          soWhat: "Poor air quality triggers asthma, COPD flares, and cardiovascular events.",
          source: "EPA AirNow",
          sourceYear: "2024",
        },
        {
          label: "EJ Screen Index",
          value: "Data pending",
          direction: "lower-is-better",
          soWhat: "Higher EJ index signals environmental injustice in pollution exposure.",
          source: "EPA EJScreen",
          sourceYear: "2024",
        },
        {
          label: "Superfund Proximity",
          value: "Data pending",
          direction: "lower-is-better",
          soWhat: "Proximity to contaminated sites correlates with long-term health risks.",
          source: "EPA",
          sourceYear: "2024",
        },
      ],
    },
  ];
}

/* ── Metric Card ───────────────────────────────────────────── */

function MetricCard({ metric, nerd }: { metric: VPMetric; nerd: boolean }) {
  const isPending = metric.value === "Data pending";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
        <DeltaIndicator direction={metric.direction} />
      </div>
      <p className={`text-base font-bold ${isPending ? "text-muted-foreground italic" : "text-foreground"}`}>
        {metric.value}
      </p>
      {metric.stateAvg && (
        <p className="text-[10px] text-muted-foreground">
          State avg: {metric.stateAvg}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {metric.soWhat}
      </p>
      {nerd && (
        <p className="text-[10px] text-muted-foreground/70">
          Source: {metric.source} ({metric.sourceYear})
        </p>
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function ValuePerformanceSection({ place }: { place: Place }) {
  const { nerdMode } = useNerdMode();
  const domains = buildDomains(place);

  return (
    <section id="value-performance" className="space-y-6" aria-labelledby="vp-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 id="vp-heading" className="text-xl font-bold text-foreground flex items-center gap-1.5">
            Value &amp; Performance
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="About Value & Performance">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] text-xs">
                  A cross-sector snapshot of how health care, housing, utilities, transportation, and environment are working for this place.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            How well systems are working here — across health, utilities, water, transportation, and environment.
          </p>
        </div>
        <NerdModeToggle />
      </div>

      <div className="space-y-4">
        {domains.map((domain, di) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: di * 0.06, duration: 0.4 }}
          >
            <Card>
              <CardContent className="py-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${domain.bgColor} flex items-center justify-center`}>
                      <domain.icon className={`h-4 w-4 ${domain.color}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{domain.title}</h3>
                      {domain.subtitle && <p className="text-[11px] text-muted-foreground">{domain.subtitle}</p>}
                    </div>
                  </div>
                  {domain.funderNote && (
                    <p className="mt-2 text-[10px] text-primary/80 italic pl-10">
                      For funders / systems: {domain.funderNote}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {domain.metrics.map((m) => (
                    <MetricCard key={m.label} metric={m} nerd={nerdMode} />
                  ))}
                </div>

                {nerdMode && (
                  <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Methodology: VBC / PBR analog
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                      <Download className="h-3 w-3" /> CSV
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                      <ExternalLink className="h-3 w-3" /> API
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {nerdMode && (
        <p className="text-[10px] text-muted-foreground text-center">
          "Value &amp; Performance" maps value-based care (VBC) concepts from health and
          performance-based regulation (PBR) concepts from utilities to community-level indicators.
          See <a href="/methodology" className="text-primary hover:underline">methodology</a> for
          calculation details and data limitations.
        </p>
      )}
    </section>
  );
}
