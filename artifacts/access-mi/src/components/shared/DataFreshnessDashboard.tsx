import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Zap, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DATA_SOURCE_DISPLAY,
  PLATFORM_FRESHNESS,
  getFreshnessSummary,
} from "@/config/platformConstants";
import { DATA_FRESHNESS_SOURCES } from "@/data/dataFreshness";

/**
 * Renders the freshness registry (src/data/dataFreshness.ts) - and nothing
 * else.
 *
 * This component previously carried its OWN hardcoded 15-source array with its
 * own status values and its own verification date. The two lists disagreed on
 * membership, on per-source dates (CDC PLACES: "fresh, 2025-12-07" here vs
 * "stale, 2024-05-01" in the registry), and on the rollup: /methodology showed
 * "100% fresh, verified March 15, 2026" from this component while /about
 * showed "1 of 15 tracked datasets fresh, verified 2026-07-14" from
 * getFreshnessSummary() over the registry. The platform contradicted itself on
 * its own freshness claim, on two live pages at once.
 *
 * One list, one rollup, one date. If the honest distribution looks bad
 * (1 fresh / 4 aging / 10 stale today), that is a statement about the data -
 * fix the data, not the dashboard.
 */

type FreshnessStatus = "fresh" | "aging" | "stale";

const STATUS_CONFIG: Record<
  FreshnessStatus,
  { icon: typeof CheckCircle2; color: string; dotColor: string; label: string }
> = {
  fresh: {
    icon: CheckCircle2,
    color: "text-michigan-forest-deep",
    dotColor: "bg-michigan-forest",
    label: "Fresh",
  },
  aging: {
    icon: Clock,
    color: "text-michigan-gold-deep",
    dotColor: "bg-michigan-gold",
    label: "Aging",
  },
  stale: {
    icon: AlertCircle,
    color: "text-michigan-coral-deep",
    dotColor: "bg-michigan-coral",
    label: "Stale",
  },
};

export default function DataFreshnessDashboard() {
  const summary = getFreshnessSummary();
  const freshPct = Math.round((summary.fresh / summary.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
          <Database className="h-5 w-5 text-michigan-teal-deep" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Freshness</h2>
          <p className="text-sm text-muted-foreground">
            Source vintage, when we last pulled it, and whether a newer release
            exists upstream
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracking {summary.total} of {DATA_SOURCE_DISPLAY} sources with
            freshness snapshots
          </p>
        </div>
      </div>

      {/* Overall rollup + breakdown - same numbers /about renders */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="sm:col-span-2 border-michigan-teal/20 bg-michigan-teal/5">
          <CardContent className="py-6 text-center">
            <p className="text-5xl font-bold text-michigan-teal-deep">
              {freshPct}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              of tracked sources fresh
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last platform-wide verification pass:{" "}
              {PLATFORM_FRESHNESS.lastVerified}
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              {summary.total} tracked · {summary.fresh} fresh · {summary.aging}{" "}
              aging · {summary.stale} stale
            </p>
          </CardContent>
        </Card>
        <div className="sm:col-span-3 grid grid-cols-3 gap-3">
          {(["fresh", "aging", "stale"] as FreshnessStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg border border-border p-3"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`}
                />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {summary[status]}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {config.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source cards - straight from the registry */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_FRESHNESS_SOURCES.map((source, i) => {
          const config = STATUS_CONFIG[source.freshnessStatus];
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${config.dotColor}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {source.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {source.sourceYear} · pulled {source.lastPulled} ·{" "}
                  {source.updateFrequency}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {source.isLive && (
                  <Badge
                    variant="outline"
                    className="text-[9px] text-michigan-teal-deep"
                  >
                    <Zap className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                    API
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-[9px] ${config.color}`}
                >
                  {config.label}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        "Fresh" means our copy matches the newest upstream release; "aging" and
        "stale" mean a newer release exists that we have not re-pulled. Statuses
        are set manually during provenance audits, not by automatic monitoring.
        The "API" mark means the source also has a live endpoint the platform
        can query at runtime.
      </p>
    </motion.div>
  );
}
