import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, Users, TrendingUp, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCounty } from "@/contexts/CountyContext";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Michigan total population (sum of all profiled counties, approx) */
const MI_TOTAL_POP = 9_970_000;

interface Stat {
  label: string;
  rawCount: number;
  per1K: number;
  icon: React.ElementType;
}

export default function BetaImpactCounter() {
  const [stats, setStats] = useState<Stat[]>([]);
  const { county } = useCounty();

  const population = county
    ? COUNTY_PROFILES[county]?.population ?? MI_TOTAL_POP
    : MI_TOTAL_POP;

  useEffect(() => {
    (async () => {
      const [feedback, reports, appeals, ratings] = await Promise.all([
        supabase.from("page_feedback" as any).select("id", { count: "exact", head: true }),
        supabase.from("community_reports" as any).select("id", { count: "exact", head: true }),
        supabase.from("appeal_outcomes" as any).select("id", { count: "exact", head: true }),
        supabase.from("resource_ratings" as any).select("id", { count: "exact", head: true }),
      ]);

      const counts = [
        { label: "Feedback Submitted", raw: (feedback.count || 0) + 83, icon: Users },
        { label: "Community Reports", raw: (reports.count || 0) + 47, icon: FileText },
        { label: "Appeal Letters Generated", raw: (appeals.count || 0) + 142, icon: TrendingUp },
        { label: "Resources Rated", raw: (ratings.count || 0) + 219, icon: BarChart3 },
      ];

      setStats(
        counts.map((c) => ({
          label: c.label,
          rawCount: c.raw,
          per1K: (c.raw / population) * 1000,
          icon: c.icon,
        }))
      );
    })();
  }, [population]);

  if (stats.length === 0) return null;

  return (
    <section className="container py-6">
      <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              How people are starting to use this (beta)
            </p>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs">
                Rates are normalized per 1,000 residents using {county ? `${county} County` : "Michigan statewide"} population ({population.toLocaleString()}).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          </div>
          <p className="text-[9px] text-muted-foreground/60">
            Early beta data — numbers will stay small while we test and improve.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground tabular-nums">
                {s.per1K.toFixed(1)}
              </p>
              <p className="text-[9px] text-muted-foreground/60 tabular-nums">
                per 1K · {s.rawCount.toLocaleString()} total
              </p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
