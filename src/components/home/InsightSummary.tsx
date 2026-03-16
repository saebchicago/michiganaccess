import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MICHIGAN_INTELLIGENCE_SIGNALS, type PolicySignal } from "@/data/michigan-intelligence";

const signalTone: Record<PolicySignal, string> = {
  "Rising Risk": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  Improving: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  Stable: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  Critical: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
};

function DirectionIcon({ direction }: { direction: "up" | "down" | "steady" }) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4" aria-hidden="true" />;
  if (direction === "down") return <ArrowDownRight className="h-4 w-4" aria-hidden="true" />;
  return <ArrowRight className="h-4 w-4" aria-hidden="true" />;
}

export default function InsightSummary() {
  return (
    <section id="instant-insight" className="py-14 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white" aria-labelledby="instant-insight-title">
      <div className="container max-w-6xl space-y-8">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Instant Insight
          </Badge>
          <div className="space-y-3">
            <h2 id="instant-insight-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Michigan Health Intelligence
            </h2>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              Start with signals, not spreadsheets. Access Michigan now opens with the clearest statewide changes first,
              then lets people drill down into the counties, disparities, and decisions behind them.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MICHIGAN_INTELLIGENCE_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Card className="h-full border-white/10 bg-white/5 text-white shadow-[0_24px_64px_-32px_rgba(6,182,212,0.65)] backdrop-blur-sm">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{signal.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{signal.summary}</p>
                    </div>
                    <div className="rounded-full bg-white/10 p-2 text-cyan-200">
                      <DirectionIcon direction={signal.direction} />
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Badge className={signalTone[signal.signal]}>{signal.signal}</Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help text-xs text-slate-400 underline decoration-dotted underline-offset-4">
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
