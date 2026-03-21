import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SignalCard {
  title: string;
  value: string;
  trend: string;
  direction: "up" | "down" | "stable";
  tone: "worsening" | "improving" | "stable";
  trendLabel: string;
  source: string;
}

const HOMEPAGE_SIGNALS: SignalCard[] = [
  {
    title: "Diabetes",
    value: "10.8%",
    trend: "Rising faster than national average",
    direction: "up",
    tone: "worsening",
    trendLabel: "Rising",
    source: "CDC BRFSS · County Health Rankings",
  },
  {
    title: "Life Expectancy",
    value: "74.2 yrs",
    trend: "Declining slightly since 2019",
    direction: "down",
    tone: "worsening",
    trendLabel: "Declining",
    source: "MDHHS Vital Records · CDC WONDER",
  },
  {
    title: "Primary Care Access",
    value: "+4.2%",
    trend: "Improving statewide",
    direction: "up",
    tone: "improving",
    trendLabel: "Improving",
    source: "CMS Provider Data · HRSA",
  },
  {
    title: "Uninsured Rate",
    value: "5.2%",
    trend: "Coverage improving",
    direction: "down",
    tone: "improving",
    trendLabel: "Improving",
    source: "Census ACS · MDHHS",
  },
];

const toneClasses: Record<SignalCard["tone"], { badge: string; icon: string }> = {
  worsening: {
    badge: "border-red-200 bg-red-50 text-red-700",
    icon: "text-red-300",
  },
  improving: {
    badge: "border-green-200 bg-green-50 text-green-700",
    icon: "text-green-300",
  },
  stable: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "text-amber-300",
  },
};

function SignalIcon({ direction, tone }: { direction: SignalCard["direction"]; tone: SignalCard["tone"] }) {
  const colorClass = toneClasses[tone].icon;
  if (direction === "up") return <ArrowUpRight className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
  if (direction === "stable") return <Minus className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
  return <ArrowDownRight className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
}

export default function InsightSignalsSection() {
  return (
    <section
      id="instant-insight"
      className="pt-0 pb-14 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white"
      aria-labelledby="instant-insight-title"
    >
      <div className="container max-w-6xl space-y-8">
        <div className="max-w-3xl space-y-4">
          <Badge
            variant="outline"
            className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Instant Insight
          </Badge>
          <div className="space-y-3">
            <h2
              id="instant-insight-title"
              className="text-2xl font-bold"
            >
              Michigan Civic Intelligence
            </h2>
            <p className="text-base leading-relaxed text-slate-300">
              Key signals across health, housing, energy &amp; safety
            </p>
          </div>
        </div>

        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          data-testid="signal-cards-grid"
        >
          {HOMEPAGE_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.title}
              data-testid="signal-card"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.05 }}
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <Card className="h-full border-white/10 bg-white/5 text-white shadow-[0_24px_64px_-32px_rgba(6,182,212,0.65)] backdrop-blur-sm">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{signal.title}</p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-white">{signal.value}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{signal.trend}</p>
                    </div>
                    <div
                      className="rounded-full bg-white/10 p-2"
                      data-testid="trend-indicator"
                      aria-label={signal.trendLabel}
                    >
                      <SignalIcon direction={signal.direction} tone={signal.tone} />
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Badge className={toneClasses[signal.tone].badge} data-testid="trend-indicator">
                      {signal.trendLabel}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="cursor-help text-xs text-slate-400 underline decoration-dotted underline-offset-4"
                        >
                          Source
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        {signal.source}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
