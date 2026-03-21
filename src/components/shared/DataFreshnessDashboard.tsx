import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Zap, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SourceStatus = "live" | "fresh" | "aging" | "stale";

interface DataSource {
  name: string;
  lastRefresh: string;
  frequency: string;
  status: SourceStatus;
}

const DATA_SOURCES: DataSource[] = [
  { name: "CDC PLACES", lastRefresh: "2025-12-07", frequency: "Annual", status: "fresh" },
  { name: "CMS Hospital Compare", lastRefresh: "2026-01-15", frequency: "Quarterly", status: "fresh" },
  { name: "HRSA HPSA", lastRefresh: "2025-09-15", frequency: "Quarterly", status: "fresh" },
  { name: "AirNow AQI", lastRefresh: "Live", frequency: "Hourly", status: "live" },
  { name: "USGS Water", lastRefresh: "Live", frequency: "15 minutes", status: "live" },
  { name: "EIA Electricity", lastRefresh: "2026-01-01", frequency: "Monthly", status: "fresh" },
  { name: "County Health Rankings", lastRefresh: "2025-03-15", frequency: "Annual (Mar)", status: "fresh" },
  { name: "SEMCOG Sidewalks", lastRefresh: "2025-12-01", frequency: "Quarterly", status: "fresh" },
  { name: "MPART PFAS", lastRefresh: "Ongoing", frequency: "As investigated", status: "live" },
  { name: "Michigan 211 (HSDS)", lastRefresh: "Continuous", frequency: "Daily", status: "live" },
  { name: "NPPES NPI Registry", lastRefresh: "Live", frequency: "Real-time", status: "live" },
  { name: "GATIS Specification", lastRefresh: "2026-02-27", frequency: "Annual", status: "fresh" },
  { name: "Leapfrog Safety Grades", lastRefresh: "2025-10-01", frequency: "Biannual", status: "fresh" },
  { name: "U.S. Census ACS", lastRefresh: "2025-09-01", frequency: "Annual (Sep)", status: "fresh" },
  { name: "MDHHS Vital Records", lastRefresh: "2025-06-01", frequency: "Annual", status: "fresh" },
];

const STATUS_CONFIG: Record<SourceStatus, { icon: typeof CheckCircle2; color: string; dotColor: string; label: string }> = {
  live: { icon: Zap, color: "text-michigan-teal", dotColor: "bg-michigan-teal", label: "Live" },
  fresh: { icon: CheckCircle2, color: "text-michigan-forest", dotColor: "bg-michigan-forest", label: "Fresh" },
  aging: { icon: Clock, color: "text-michigan-gold", dotColor: "bg-michigan-gold", label: "Aging" },
  stale: { icon: AlertCircle, color: "text-michigan-coral", dotColor: "bg-michigan-coral", label: "Stale" },
};

export default function DataFreshnessDashboard() {
  const freshnessScore = useMemo(() => {
    const good = DATA_SOURCES.filter((s) => s.status === "live" || s.status === "fresh").length;
    return Math.round((good / DATA_SOURCES.length) * 100);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { live: 0, fresh: 0, aging: 0, stale: 0 };
    DATA_SOURCES.forEach((s) => counts[s.status]++);
    return counts;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
          <Database className="h-5 w-5 text-michigan-teal" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Freshness</h2>
          <p className="text-sm text-muted-foreground">How current is every data source on this platform</p>
        </div>
      </div>

      {/* Overall score + breakdown */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="sm:col-span-2 border-michigan-teal/20 bg-michigan-teal/5">
          <CardContent className="py-6 text-center">
            <p className="text-5xl font-bold text-michigan-teal">{freshnessScore}%</p>
            <p className="text-sm text-muted-foreground mt-1">Data Freshness Score</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              {DATA_SOURCES.length} sources tracked · {statusCounts.live} live · {statusCounts.fresh} fresh
            </p>
          </CardContent>
        </Card>
        <div className="sm:col-span-3 grid grid-cols-2 gap-3">
          {(["live", "fresh", "aging", "stale"] as SourceStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-2 rounded-lg border border-border p-3">
                <div className={`h-2.5 w-2.5 rounded-full ${config.dotColor} ${status === "live" ? "animate-pulse" : ""}`} />
                <div>
                  <p className="text-lg font-bold text-foreground">{statusCounts[status]}</p>
                  <p className="text-[10px] text-muted-foreground">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source cards grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_SOURCES.map((source, i) => {
          const config = STATUS_CONFIG[source.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${config.dotColor} ${source.status === "live" ? "animate-pulse" : ""}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{source.name}</p>
                <p className="text-[10px] text-muted-foreground">{source.lastRefresh} · {source.frequency}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] shrink-0 ${config.color}`}>
                {config.label}
              </Badge>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Freshness status reflects expected refresh cadence vs. last known update. "Live" sources provide real-time or continuous data.
        Status is manually verified — not automatically monitored.
      </p>
    </motion.div>
  );
}
