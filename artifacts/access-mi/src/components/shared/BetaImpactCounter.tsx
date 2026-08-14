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
      const results = await Promise.all([
        supabase.from("page_feedback" as any).select("id", { count: "exact", head: true }),
        supabase.from("community_reports" as any).select("id", { count: "exact", head: true }),
        supabase.from("appeal_outcomes" as any).select("id", { count: "exact", head: true }),
        supabase.from("resource_ratings" as any).select("id", { count: "exact", head: true }),
      ]);

      // A failed count query returns `count: null`. Coercing that to 0 would
      // publish "0 community reports" as a fact about participation, so if
      // any of the four counts is missing we render nothing at all rather
      // than a partially-zeroed panel.
      if (results.some((r) => r.error || r.count === null)) return;

      const [feedback, reports, appeals, ratings] = results;
      const counts = [
        { label: "Feedback Submitted", raw: feedback.count as number, icon: Users },
        { label: "Community Reports", raw: reports.count as number, icon: FileText },
        { label: "Appeal Letters Generated", raw: appeals.count as number, icon: TrendingUp },
        { label: "Resources Rated", raw: ratings.count as number, icon: BarChart3 },
      ];

      // Don't render if no real activity yet
      if (counts.every((c) => c.raw === 0)) return;

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
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform activity
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs">
                Aggregate counters from early beta usage across the platform.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                {s.rawCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
