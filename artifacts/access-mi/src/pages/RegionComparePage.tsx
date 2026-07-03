import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BarChart3,
  Users,
  MapPin,
  ArrowLeft,
  Check,
  Download,
  Eye,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { MICHIGAN_REGIONS, type MichiganRegion } from "@/data/michigan-regions";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { useFacilities } from "@/hooks/useFacilities";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import { toast } from "@/hooks/use-toast";
import RegionRadarChart from "@/components/region/RegionRadarChart";

// State benchmarks: County Health Rankings & Roadmaps 2025 edition
// https://www.countyhealthrankings.org/health-data/michigan
const BENCHMARKS: Record<string, { state: string; us: string }> = {
  "Uninsured rate": { state: "5%", us: "8.0%" },
  "Food insecurity": { state: "13.3%", us: "13.5%" },
  "Primary care ratio": { state: "1,240:1", us: "1,310:1" },
};

const RESOURCE_TYPES = [
  "food",
  "housing",
  "transportation",
  "mental_health",
  "health",
  "legal",
  "education",
];

function getRegionStats(
  region: MichiganRegion,
  facilities: any[],
  resources: any[],
) {
  let totalPop = 0;
  const metricSums: Record<string, { sum: number; count: number }> = {};

  region.counties.forEach((c) => {
    const p = getCountyProfile(c);
    totalPop += p.population;
    p.healthHighlights.forEach((h) => {
      let num: number;
      if (h.label.includes("ratio")) {
        num = parseInt(h.value.split(":")[0].replace(/,/g, ""), 10);
      } else {
        num = parseFloat(h.value.replace(/%/g, ""));
      }
      if (!isNaN(num)) {
        if (!metricSums[h.label]) metricSums[h.label] = { sum: 0, count: 0 };
        metricSums[h.label].sum += num;
        metricSums[h.label].count += 1;
      }
    });
  });

  const metrics = Object.entries(metricSums).map(([label, { sum, count }]) => ({
    label,
    value: label.includes("ratio")
      ? `${Math.round(sum / count).toLocaleString()}:1`
      : `${(sum / count).toFixed(1)}%`,
    numericAvg: sum / count,
  }));

  const regionFacilities = facilities.filter((f) =>
    region.counties.includes(f.county),
  );
  const regionResources = resources.filter((r) =>
    region.counties.includes(r.county),
  );

  const resourceBreakdown: Record<string, number> = {};
  RESOURCE_TYPES.forEach((t) => {
    resourceBreakdown[t] = regionResources.filter(
      (r) => r.resource_type === t,
    ).length;
  });

  return {
    totalPop,
    metrics,
    facilityCount: regionFacilities.length,
    resourceCount: regionResources.length,
    resourceBreakdown,
  };
}

function exportCSV(
  compareData: {
    region: MichiganRegion;
    stats: ReturnType<typeof getRegionStats>;
  }[],
  allMetricLabels: string[],
  isExecutive: boolean,
) {
  const rows: string[][] = [];
  rows.push([
    "Metric",
    ...compareData.map((d) => d.region.name),
    "MI Avg",
    "US Avg",
  ]);
  rows.push([
    "Population",
    ...compareData.map((d) => d.stats.totalPop.toString()),
  ]);
  rows.push([
    "Counties",
    ...compareData.map((d) => d.region.counties.length.toString()),
  ]);
  rows.push([
    "Facilities",
    ...compareData.map((d) => d.stats.facilityCount.toString()),
  ]);
  rows.push([
    "Resources",
    ...compareData.map((d) => d.stats.resourceCount.toString()),
  ]);

  const benchmarks: Record<string, { state: string; us: string }> = {
    "Uninsured rate": { state: "5%", us: "8.0%" },
    "Food insecurity": { state: "13.3%", us: "13.5%" },
    "Primary care ratio": { state: "1,240:1", us: "1,310:1" },
  };
  allMetricLabels.forEach((label) => {
    const bench = benchmarks[label];
    rows.push([
      label,
      ...compareData.map((d) => {
        const m = d.stats.metrics.find((x) => x.label === label);
        return m?.value ?? "-";
      }),
      bench?.state ?? "",
      bench?.us ?? "",
    ]);
  });

  // Executive metrics
  if (isExecutive) {
    rows.push([]);
    rows.push(["--- Executive Metrics ---"]);
    rows.push([
      "Facilities per 100K Pop",
      ...compareData.map((d) =>
        d.stats.totalPop > 0
          ? ((d.stats.facilityCount / d.stats.totalPop) * 100000).toFixed(1)
          : "-",
      ),
      "",
      "",
    ]);
    rows.push([
      "Resources per 100K Pop",
      ...compareData.map((d) =>
        d.stats.totalPop > 0
          ? ((d.stats.resourceCount / d.stats.totalPop) * 100000).toFixed(1)
          : "-",
      ),
      "",
      "",
    ]);
    allMetricLabels.forEach((label) => {
      const bench = benchmarks[label];
      if (!bench) return;
      const benchVal = parseFloat(bench.state.replace(/[^0-9.]/g, ""));
      rows.push([
        `${label} vs MI Avg (pts)`,
        ...compareData.map((d) => {
          const m = d.stats.metrics.find((x) => x.label === label);
          return m ? (m.numericAvg - benchVal).toFixed(1) : "-";
        }),
        "0",
        "",
      ]);
    });
  }

  rows.push([]);
  rows.push(["Resource Type", ...compareData.map((d) => d.region.name)]);
  RESOURCE_TYPES.forEach((type) => {
    rows.push([
      type.replace(/_/g, " "),
      ...compareData.map((d) =>
        (d.stats.resourceBreakdown[type] || 0).toString(),
      ),
    ]);
  });

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `michigan_regional_${isExecutive ? "executive_" : ""}comparison_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast({
    title: "CSV downloaded",
    description: `${isExecutive ? "Executive" : "Standard"} comparison data exported.`,
  });
}

export default function RegionComparePage() {
  usePageMeta({
    title: "Regional Comparison Dashboard - Michigan Health Access",
    description:
      "Compare health metrics, access gaps, and resources across Michigan regions side-by-side.",
    path: "/regions/compare",
  });

  const [selected, setSelected] = useState<string[]>(["southeast", "west"]);
  const [isExecutive, setIsExecutive] = useState(false);
  const { data: facilities = [] } = useFacilities(undefined, undefined);
  const { data: resources = [] } = useCommunityResources(undefined, undefined);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev,
    );
  };

  const compareData = useMemo(() => {
    return selected.map((id) => {
      const region = MICHIGAN_REGIONS.find((r) => r.id === id)!;
      return { region, stats: getRegionStats(region, facilities, resources) };
    });
  }, [selected, facilities, resources]);

  const allMetricLabels = useMemo(() => {
    const labels = new Set<string>();
    compareData.forEach((d) =>
      d.stats.metrics.forEach((m) => labels.add(m.label)),
    );
    return Array.from(labels);
  }, [compareData]);

  return (
    <Layout>
      <Breadcrumbs
        items={[{ label: "Regions", href: "/regions" }, { label: "Compare" }]}
      />

      <section className="bg-gradient-to-br from-primary/8 via-primary/3 to-background py-10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="outline" className="mb-3 text-xs">
              Benchmarking Tool
            </Badge>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">
              Compare regions.
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Up to 4 at once. Health, resources, access - side by side.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Region selector */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Select Regions to Compare
          </h2>
          <div className="flex flex-wrap gap-2">
            {MICHIGAN_REGIONS.map((r) => (
              <Button
                key={r.id}
                variant={selected.includes(r.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggle(r.id)}
                className="gap-1.5"
                disabled={!selected.includes(r.id) && selected.length >= 4}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: r.color }}
                />
                {r.name}
                {selected.includes(r.id) && <Check className="h-3 w-3" />}
              </Button>
            ))}
          </div>
          {selected.length < 2 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Select at least 2 regions to compare.
            </p>
          )}
        </section>

        {compareData.length >= 2 && (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <label
                  className="text-xs font-medium text-foreground cursor-pointer"
                  htmlFor="exec-toggle"
                >
                  Executive View
                </label>
                <Switch
                  id="exec-toggle"
                  checked={isExecutive}
                  onCheckedChange={setIsExecutive}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportCSV(compareData, allMetricLabels, isExecutive)
                }
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download {isExecutive ? "Executive " : ""}CSV Report
              </Button>
            </div>

            {/* Overview cards */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">
                Overview
              </h2>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${compareData.length}, minmax(0, 1fr))`,
                }}
              >
                {compareData.map(({ region, stats }) => (
                  <Card
                    key={region.id}
                    className="border-t-4"
                    style={{ borderTopColor: region.color }}
                  >
                    <CardContent className="py-4 space-y-2">
                      <Link
                        to={`/region/${region.id}`}
                        className="text-sm font-bold text-foreground hover:underline"
                      >
                        {region.name}
                      </Link>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> Pop.{" "}
                          {stats.totalPop.toLocaleString()}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{" "}
                          {region.counties.length} counties
                        </p>
                        <p>
                          {stats.facilityCount} facilities ·{" "}
                          {stats.resourceCount} resources
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Health metrics comparison */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Health Metrics Comparison
              </h2>
              <Card>
                <CardContent className="py-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left font-medium text-muted-foreground text-xs">
                            Metric
                          </th>
                          {compareData.map(({ region }) => (
                            <th
                              key={region.id}
                              className="py-3 text-center font-medium text-xs"
                              style={{ color: region.color }}
                            >
                              {region.name}
                            </th>
                          ))}
                          <th className="py-3 text-center font-medium text-muted-foreground text-xs">
                            MI Avg
                          </th>
                          <th className="py-3 text-center font-medium text-muted-foreground text-xs">
                            US Avg
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMetricLabels.map((label) => {
                          const bench = BENCHMARKS[label];
                          return (
                            <tr key={label} className="border-b last:border-0">
                              <td className="py-2.5 text-xs text-foreground font-medium">
                                {label}
                              </td>
                              {compareData.map(({ region, stats }) => {
                                const m = stats.metrics.find(
                                  (x) => x.label === label,
                                );
                                const benchVal = bench
                                  ? parseFloat(
                                      bench.state.replace(/[^0-9.]/g, ""),
                                    )
                                  : null;
                                const worse =
                                  m && benchVal
                                    ? m.numericAvg > benchVal
                                    : false;
                                return (
                                  <td
                                    key={region.id}
                                    className="py-2.5 text-center"
                                  >
                                    <span
                                      className={`text-xs font-semibold ${worse ? "text-destructive" : "text-foreground"}`}
                                    >
                                      {m?.value ?? "-"}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="py-2.5 text-center text-xs text-muted-foreground">
                                {bench?.state ?? "-"}
                              </td>
                              <td className="py-2.5 text-center text-xs text-muted-foreground">
                                {bench?.us ?? "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Executive Metrics */}
            {isExecutive && (
              <section>
                <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Executive Benchmarks
                </h2>
                <Card>
                  <CardContent className="py-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left font-medium text-muted-foreground text-xs">
                              Metric
                            </th>
                            {compareData.map(({ region }) => (
                              <th
                                key={region.id}
                                className="py-3 text-center font-medium text-xs"
                                style={{ color: region.color }}
                              >
                                {region.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2.5 text-xs text-foreground font-medium">
                              Facilities per 100K
                            </td>
                            {compareData.map(({ region, stats }) => (
                              <td
                                key={region.id}
                                className="py-2.5 text-center text-xs font-semibold text-foreground"
                              >
                                {stats.totalPop > 0
                                  ? (
                                      (stats.facilityCount / stats.totalPop) *
                                      100000
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-2.5 text-xs text-foreground font-medium">
                              Resources per 100K
                            </td>
                            {compareData.map(({ region, stats }) => (
                              <td
                                key={region.id}
                                className="py-2.5 text-center text-xs font-semibold text-foreground"
                              >
                                {stats.totalPop > 0
                                  ? (
                                      (stats.resourceCount / stats.totalPop) *
                                      100000
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                            ))}
                          </tr>
                          {allMetricLabels.map((label) => {
                            const bench = BENCHMARKS[label];
                            if (!bench) return null;
                            const benchVal = parseFloat(
                              bench.state.replace(/[^0-9.]/g, ""),
                            );
                            return (
                              <tr
                                key={label}
                                className="border-b last:border-0"
                              >
                                <td className="py-2.5 text-xs text-foreground font-medium">
                                  {label} gap vs MI
                                </td>
                                {compareData.map(({ region, stats }) => {
                                  const m = stats.metrics.find(
                                    (x) => x.label === label,
                                  );
                                  const diff = m
                                    ? m.numericAvg - benchVal
                                    : null;
                                  return (
                                    <td
                                      key={region.id}
                                      className="py-2.5 text-center"
                                    >
                                      <span
                                        className={`text-xs font-semibold ${diff && diff > 0 ? "text-destructive" : "text-michigan-forest-deep"}`}
                                      >
                                        {diff !== null
                                          ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)} pts`
                                          : "-"}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Resource distribution comparison */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">
                Resource Distribution
              </h2>
              <Card>
                <CardContent className="py-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left font-medium text-muted-foreground text-xs">
                            Resource Type
                          </th>
                          {compareData.map(({ region }) => (
                            <th
                              key={region.id}
                              className="py-3 text-center font-medium text-xs"
                              style={{ color: region.color }}
                            >
                              {region.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {RESOURCE_TYPES.map((type) => {
                          const max = Math.max(
                            ...compareData.map(
                              (d) => d.stats.resourceBreakdown[type] || 0,
                            ),
                          );
                          return (
                            <tr key={type} className="border-b last:border-0">
                              <td className="py-2.5 text-xs text-foreground font-medium capitalize">
                                {type.replace(/_/g, " ")}
                              </td>
                              {compareData.map(({ region, stats }) => {
                                const count =
                                  stats.resourceBreakdown[type] || 0;
                                const isMax = count === max && count > 0;
                                return (
                                  <td
                                    key={region.id}
                                    className="py-2.5 text-center"
                                  >
                                    <span
                                      className={`text-xs font-semibold ${isMax ? "text-michigan-forest-deep" : count === 0 ? "text-muted-foreground" : "text-foreground"}`}
                                    >
                                      {count}
                                    </span>
                                    {isMax && count > 0 && (
                                      <span className="text-[9px] text-michigan-forest-deep ml-1">
                                        ★
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        <tr className="border-t-2">
                          <td className="py-2.5 text-xs font-bold text-foreground">
                            Total
                          </td>
                          {compareData.map(({ region, stats }) => (
                            <td
                              key={region.id}
                              className="py-2.5 text-center text-xs font-bold text-foreground"
                            >
                              {stats.resourceCount}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Radar Chart */}
            <section>
              <RegionRadarChart
                regions={compareData.map(({ region, stats }) => {
                  const ur = stats.metrics.find(
                    (m) => m.label === "Uninsured rate",
                  );
                  const fi = stats.metrics.find(
                    (m) => m.label === "Food insecurity",
                  );
                  const pcr = stats.metrics.find(
                    (m) => m.label === "Primary care ratio",
                  );
                  return {
                    regionName: region.name,
                    color: region.color,
                    uninsuredRate: ur?.numericAvg ?? 5,
                    foodInsecurity: fi?.numericAvg ?? 13.3,
                    primaryCareRatio: pcr?.numericAvg ?? 1240,
                    facilitiesPer100k:
                      stats.totalPop > 0
                        ? (stats.facilityCount / stats.totalPop) * 100000
                        : 0,
                    resourcesPer100k:
                      stats.totalPop > 0
                        ? (stats.resourceCount / stats.totalPop) * 100000
                        : 0,
                  };
                })}
              />
            </section>

            <p className="text-[10px] text-muted-foreground text-center">
              Data sourced from MDHHS, HRSA, and community resource partners.
              Metrics represent county-level averages within each region.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
