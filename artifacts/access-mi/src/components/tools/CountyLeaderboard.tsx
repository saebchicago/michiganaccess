import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Medal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTY_PROFILES,
  type CountyProfile,
} from "@/data/michigan-county-profiles";
import { COUNTY_CROSS_DOMAIN } from "@/data/cross-domain-indicators";

type MetricKey = "uninsured" | "pcp" | "chronic" | "economic";
type FilterKey = "all" | "urban" | "rural";

interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  /** Return null when no per-county value exists; do NOT fall back to state averages. */
  extract: (county: string) => number | null;
}

const METRICS: MetricDef[] = [
  {
    key: "uninsured",
    label: "Uninsured Rate",
    unit: "%",
    higherIsBetter: false,
    extract: (c) => {
      const raw = COUNTY_PROFILES[c]?.healthHighlights[0]?.value;
      if (!raw) return null;
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : null;
    },
  },
  {
    key: "pcp",
    label: "PCP Access",
    unit: ":1",
    higherIsBetter: false,
    extract: (c) => {
      const raw = COUNTY_PROFILES[c]?.healthHighlights[1]?.value;
      if (!raw) return null;
      const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    },
  },
  {
    key: "chronic",
    label: "Food Insecurity",
    unit: "%",
    higherIsBetter: false,
    extract: (c) => {
      const raw = COUNTY_PROFILES[c]?.healthHighlights[2]?.value;
      if (!raw) return null;
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : null;
    },
  },
  {
    key: "economic",
    label: "Economic Stress",
    unit: "%",
    higherIsBetter: false,
    extract: (c) => COUNTY_CROSS_DOMAIN[c]?.povertyRate ?? null,
  },
];

const MEDAL_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export default function CountyLeaderboard() {
  const [metric, setMetric] = useState<MetricKey>("uninsured");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);

  const metricDef = METRICS.find((m) => m.key === metric)!;

  const { ranked, pending } = useMemo(() => {
    let counties = Object.keys(COUNTY_PROFILES);
    if (filter === "urban")
      counties = counties.filter(
        (c) =>
          COUNTY_PROFILES[c].countyType === "urban" ||
          COUNTY_PROFILES[c].countyType === "suburban",
      );
    if (filter === "rural")
      counties = counties.filter(
        (c) => COUNTY_PROFILES[c].countyType === "rural",
      );

    const scored = counties.map((county) => ({
      county,
      value: metricDef.extract(county),
      profile: COUNTY_PROFILES[county],
    }));

    const withValue = scored.filter(
      (r): r is { county: string; value: number; profile: CountyProfile } =>
        r.value !== null,
    );
    const missing = scored.filter((r) => r.value === null);

    withValue.sort((a, b) =>
      metricDef.higherIsBetter ? b.value - a.value : a.value - b.value,
    );

    return { ranked: withValue, pending: missing };
  }, [metric, filter, metricDef]);

  const maxVal = ranked.length ? Math.max(...ranked.map((r) => r.value)) : 0;
  const minVal = ranked.length ? Math.min(...ranked.map((r) => r.value)) : 0;
  const range = maxVal - minVal || 1;

  const exportCSV = () => {
    const header = [
      "Rank",
      "County",
      "Type",
      "Population",
      `${metricDef.label} (${metricDef.unit})`,
    ].join(",");
    const rows = [
      ...ranked.map((r, i) =>
        [
          i + 1,
          r.county,
          r.profile.countyType,
          r.profile.population,
          r.value,
        ].join(","),
      ),
      ...pending.map((r) =>
        [
          "",
          r.county,
          r.profile.countyType,
          r.profile.population,
          "data pending",
        ].join(","),
      ),
    ];
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `county-leaderboard-${metric}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const barColor = (idx: number, total: number) => {
    if (idx < 3) return "bg-green-500";
    if (idx >= total - 5) return "bg-red-500";
    if (idx < total * 0.25) return "bg-green-400";
    if (idx < total * 0.5) return "bg-yellow-400";
    if (idx < total * 0.75) return "bg-orange-400";
    return "bg-orange-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              County Leaderboard
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Ranked by {metricDef.label} among {ranked.length} counties with
              current data.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
              Metric
            </label>
            <Select
              value={metric}
              onValueChange={(v) => {
                setMetric(v as MetricKey);
                setExpandedCounty(null);
              }}
            >
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
              Filter
            </label>
            <div className="flex gap-1">
              {(["all", "urban", "rural"] as FilterKey[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  className="h-8 text-xs capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f === "all"
                    ? "All Counties"
                    : f === "urban"
                      ? "Urban/Suburban"
                      : "Rural"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-0.5 max-h-[520px] overflow-y-auto pr-1">
          {ranked.map((r, idx) => {
            const isExpanded = expandedCounty === r.county;
            const isTop3 = idx < 3;
            const isBottom5 = idx >= ranked.length - 5;
            const barPct = metricDef.higherIsBetter
              ? ((r.value - minVal) / range) * 100
              : ((maxVal - r.value) / range) * 100;

            return (
              <div key={r.county}>
                <motion.button
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left"
                  onClick={() =>
                    setExpandedCounty(isExpanded ? null : r.county)
                  }
                  layout
                >
                  <span className="w-6 text-right shrink-0">
                    {isTop3 ? (
                      <Medal
                        className={`h-4 w-4 inline ${MEDAL_COLORS[idx]}`}
                      />
                    ) : isBottom5 ? (
                      <AlertTriangle className="h-3.5 w-3.5 inline text-red-400" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {idx + 1}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-medium w-28 shrink-0 truncate">
                    {r.county}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                    <motion.div
                      className={`h-full rounded ${barColor(idx, ranked.length)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, barPct)}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.004 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-16 text-right tabular-nums">
                    {metricDef.key === "pcp"
                      ? `${r.value.toLocaleString()}:1`
                      : metricDef.unit === "%"
                        ? `${r.value}%`
                        : r.value.toFixed(1)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mr-2 mb-2 p-3 rounded-lg bg-muted/30 border border-border/50 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground">
                            Population:
                          </span>{" "}
                          <span className="font-medium">
                            {r.profile.population.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>{" "}
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 capitalize ml-1"
                          >
                            {r.profile.countyType}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Uninsured:
                          </span>{" "}
                          <span className="font-medium">
                            {r.profile.healthHighlights[0]?.value}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            PCP Ratio:
                          </span>{" "}
                          <span className="font-medium">
                            {r.profile.healthHighlights[1]?.value}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Food Insecurity:
                          </span>{" "}
                          <span className="font-medium">
                            {r.profile.healthHighlights[2]?.value}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Poverty:
                          </span>{" "}
                          <span className="font-medium">
                            {COUNTY_CROSS_DOMAIN[r.county]?.povertyRate ??
                              "N/A"}
                            %
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Cities:</span>{" "}
                          <span className="font-medium">
                            {r.profile.majorCities.slice(0, 3).join(", ")}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {pending.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Data pending ({pending.length})
              </p>
              {pending.map((r) => (
                <div
                  key={r.county}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded text-left opacity-70"
                >
                  <span className="w-6" />
                  <span className="text-xs font-medium w-28 shrink-0 truncate">
                    {r.county}
                  </span>
                  <div className="flex-1 h-4 bg-muted/40 rounded" />
                  <span className="text-[10px] italic text-muted-foreground w-16 text-right">
                    pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Data: County Health Rankings & Roadmaps, 2025 edition (uninsured
          rate, primary care access, food insecurity); ACS 5-Year 2022
          (poverty rate).
        </p>
      </CardContent>
    </Card>
  );
}
