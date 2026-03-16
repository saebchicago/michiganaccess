import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SignalCard {
  title: string;
  value: string;
  trend: string;
  direction: "up" | "down";
  tone: "worsening" | "improving";
  source: string;
}

const HOMEPAGE_SIGNALS: SignalCard[] = [
  {
    title: "Diabetes",
    value: "10.8%",
    trend: "Rising faster than national average",
    direction: "up",
    tone: "worsening",
    source: "CDC BRFSS · County Health Rankings",
  },
  {
    title: "Life Expectancy",
    value: "74.2 yrs",
    trend: "Declining slightly since 2019",
    direction: "down",
    tone: "worsening",
    source: "MDHHS Vital Records · CDC WONDER",
  },
  {
    title: "Primary Care Access",
    value: "+4.2%",
    trend: "Improving statewide",
    direction: "up",
    tone: "improving",
    source: "CMS Provider Data · HRSA",
  },
  {
    title: "Uninsured Rate",
    value: "5.2%",
    trend: "Coverage improving",
    direction: "down",
    tone: "improving",
    source: "Census ACS · MDHHS",
  },
];

const toneClasses: Record<SignalCard["tone"], { badge: string; icon: string }> = {
  worsening: {
    badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
    icon: "text-rose-300",
  },
  improving: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    icon: "text-emerald-300",
  },
};

function SignalIcon({ direction, tone }: { direction: "up" | "down"; tone: SignalCard["tone"] }) {
  const colorClass = toneClasses[tone].icon;
  if (direction === "up") return <ArrowUpRight className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
  return <ArrowDownRight className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
}

export default function InsightSignalsSection() {
  return (
    <section
      id="instant-insight"
      className="py-14 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white"
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
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Michigan Health Intelligence
            </h2>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              Start with signals, not spreadsheets. Access Michigan opens with the
              clearest statewide changes first, then lets you drill down into the
              counties, disparities, and decisions behind them.
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
              whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
              <Card className="h-full border-white/10 bg-white/5 text-white shadow-[0_24px_64px_-32px_rgba(6,182,212,0.65)] backdrop-blur-sm">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{signal.title}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{signal.value}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{signal.trend}</p>
                    </div>
                    <div className="rounded-full bg-white/10 p-2">
                      <SignalIcon direction={signal.direction} tone={signal.tone} />
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Badge className={toneClasses[signal.tone].badge}>
                      {signal.tone === "improving" ? "Improving" : "Rising Risk"}
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
