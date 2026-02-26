/**
 * ComparePlacesPage — Side-by-side county comparison with Census ACS data + radar chart.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, X, BarChart3, MapPin, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCensusACS, getCensusValue, formatDollars, formatCount } from "@/hooks/useCensusACS";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COMPARE_TABLES = ["B19013", "B17001", "B25064", "B25003", "B15003", "B23025", "B01001", "B02001"];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

interface CompareMetric {
  label: string;
  key: string;
  getValue: (data: any) => number | null;
  format: (v: number | null) => string;
  higherIsBetter: boolean;
  unit: string;
}

const METRICS: CompareMetric[] = [
  {
    label: "Median Income",
    key: "income",
    getValue: (d) => getCensusValue(d, "B19013", "B19013_001E"),
    format: (v) => v !== null ? `$${v.toLocaleString()}` : "N/A",
    higherIsBetter: true,
    unit: "$",
  },
  {
    label: "Poverty Rate",
    key: "poverty",
    getValue: (d) => {
      const below = getCensusValue(d, "B17001", "B17001_002E");
      const total = getCensusValue(d, "B17001", "B17001_001E");
      return below && total && total > 0 ? +((below / total) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: false,
    unit: "%",
  },
  {
    label: "Median Rent",
    key: "rent",
    getValue: (d) => getCensusValue(d, "B25064", "B25064_001E"),
    format: (v) => v !== null ? `$${v.toLocaleString()}` : "N/A",
    higherIsBetter: false,
    unit: "$",
  },
  {
    label: "Homeownership",
    key: "homeowner",
    getValue: (d) => {
      const own = getCensusValue(d, "B25003", "B25003_002E");
      const total = getCensusValue(d, "B25003", "B25003_001E");
      return own && total && total > 0 ? +((own / total) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: true,
    unit: "%",
  },
  {
    label: "Bachelor's Degree+",
    key: "bachelors",
    getValue: (d) => {
      const bach = getCensusValue(d, "B15003", "B15003_022E");
      const total = getCensusValue(d, "B15003", "B15003_001E");
      return bach && total && total > 0 ? +((bach / total) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: true,
    unit: "%",
  },
  {
    label: "Unemployment",
    key: "unemployment",
    getValue: (d) => {
      const unemp = getCensusValue(d, "B23025", "B23025_005E");
      const labor = getCensusValue(d, "B23025", "B23025_003E");
      return unemp && labor && labor > 0 ? +((unemp / labor) * 100).toFixed(1) : null;
    },
    format: (v) => v !== null ? `${v}%` : "N/A",
    higherIsBetter: false,
    unit: "%",
  },
  {
    label: "Population",
    key: "population",
    getValue: (d) => getCensusValue(d, "B01001", "B01001_001E"),
    format: (v) => v !== null ? v.toLocaleString() : "N/A",
    higherIsBetter: true,
    unit: "",
  },
];

function useCountyData(countyName: string) {
  const fips = MI_COUNTY_FIPS[countyName] || "";
  return useCensusACS({
    tables: COMPARE_TABLES,
    geoType: "county",
    geoFips: fips,
    enabled: !!fips,
  });
}

function CompareColumn({ county, onRemove, index }: { county: string; onRemove: () => void; index: number }) {
  const { data, isLoading } = useCountyData(county);
  const color = CHART_COLORS[index % CHART_COLORS.length];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-bold text-foreground">{county} County</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {METRICS.map((m) => <Skeleton key={m.key} className="h-8 w-full" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {METRICS.map((m) => {
            const val = m.getValue(data);
            return (
              <div key={m.key} className="flex justify-between items-center py-1.5 px-2 rounded bg-muted/30">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className="text-sm font-semibold text-foreground">{m.format(val)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ComparePlacesPage() {
  usePageMeta({
    title: "Compare Counties — Side-by-Side Census Data | Access Michigan",
    description: "Compare up to 4 Michigan counties with live Census ACS data. Radar charts, demographics, economics, and housing indicators.",
    path: "/compare",
  });

  const [selected, setSelected] = useState<string[]>(["Wayne", "Oakland"]);
  const [addCounty, setAddCounty] = useState<string>("");

  const countyNames = Object.keys(MI_COUNTY_FIPS).sort();
  const available = countyNames.filter((c) => !selected.includes(c));

  // Fetch data for all selected counties
  const queries = [
    useCountyData(selected[0] || ""),
    useCountyData(selected[1] || ""),
    useCountyData(selected[2] || ""),
    useCountyData(selected[3] || ""),
  ];

  const radarData = useMemo(() => {
    // Normalize metrics to 0-100 scale for radar
    const normalizeMetrics = ["income", "poverty", "rent", "homeowner", "bachelors", "unemployment"];
    const ranges: Record<string, { min: number; max: number }> = {};

    // First pass: get min/max
    for (const metric of METRICS.filter((m) => normalizeMetrics.includes(m.key))) {
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < selected.length; i++) {
        const val = queries[i]?.data ? metric.getValue(queries[i].data) : null;
        if (val !== null) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      }
      ranges[metric.key] = { min: isFinite(min) ? min : 0, max: isFinite(max) ? max : 100 };
    }

    return METRICS.filter((m) => normalizeMetrics.includes(m.key)).map((metric) => {
      const entry: Record<string, any> = { metric: metric.label };
      const { min, max } = ranges[metric.key] || { min: 0, max: 100 };
      const range = max - min || 1;

      for (let i = 0; i < selected.length; i++) {
        const val = queries[i]?.data ? metric.getValue(queries[i].data) : null;
        if (val !== null) {
          let normalized = ((val - min) / range) * 100;
          // Invert for lower-is-better metrics
          if (!metric.higherIsBetter) normalized = 100 - normalized;
          entry[selected[i]] = +normalized.toFixed(0);
        }
      }
      return entry;
    });
  }, [selected, queries.map((q) => q.data)]);

  const barData = useMemo(() => {
    const incomeMetric = METRICS.find((m) => m.key === "income")!;
    return selected.map((county, i) => ({
      name: county,
      income: queries[i]?.data ? incomeMetric.getValue(queries[i].data) || 0 : 0,
    }));
  }, [selected, queries.map((q) => q.data)]);

  const handleAdd = (county: string) => {
    if (county && selected.length < 4 && !selected.includes(county)) {
      setSelected([...selected, county]);
      setAddCounty("");
    }
  };

  const handleRemove = (index: number) => {
    if (selected.length > 1) {
      setSelected(selected.filter((_, i) => i !== index));
    }
  };

  const allLoading = queries.some((q, i) => i < selected.length && q.isLoading);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "Compare Counties" }]} />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-xs">Census ACS</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">Compare Counties</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Select 2–4 Michigan counties to compare demographics, economics, housing, and education indicators side-by-side.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* County Selector */}
        <div className="flex flex-wrap gap-2 items-center">
          {selected.map((county, i) => (
            <Badge key={county} variant="secondary" className="text-sm gap-1.5 py-1.5 px-3">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              {county}
              {selected.length > 1 && (
                <button onClick={() => handleRemove(i)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {selected.length < 4 && (
            <Select value={addCounty} onValueChange={handleAdd}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Add county..." />
              </SelectTrigger>
              <SelectContent>
                {available.map((c) => (
                  <SelectItem key={c} value={c}>{c} County</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Radar Chart */}
        {radarData.length > 0 && !allLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Radar</CardTitle>
              <p className="text-xs text-muted-foreground">Higher = better. Metrics normalized 0–100 for comparison.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  {selected.map((county, i) => (
                    <Radar
                      key={county}
                      name={county}
                      dataKey={county}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Income Bar Chart */}
        {barData.some((d) => d.income > 0) && !allLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Median Household Income</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Median Income"]} />
                  <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <rect key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Metric</th>
                    {selected.map((county, i) => (
                      <th key={county} className="text-right py-2 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          {county}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map((metric) => {
                    const values = selected.map((_, i) =>
                      queries[i]?.data ? metric.getValue(queries[i].data) : null
                    );
                    const validValues = values.filter((v): v is number => v !== null);
                    const best = validValues.length > 0
                      ? (metric.higherIsBetter ? Math.max(...validValues) : Math.min(...validValues))
                      : null;

                    return (
                      <tr key={metric.key} className="border-b border-border/50">
                        <td className="py-2.5 text-foreground font-medium">{metric.label}</td>
                        {values.map((val, i) => {
                          const isBest = val !== null && val === best && validValues.length > 1;
                          return (
                            <td key={i} className="py-2.5 text-right">
                              {queries[i]?.isLoading ? (
                                <Skeleton className="h-5 w-16 ml-auto" />
                              ) : (
                                <span className={`font-mono ${isBest ? "font-bold text-green-700 dark:text-green-400" : "text-foreground"}`}>
                                  {metric.format(val)}
                                  {isBest && <span className="ml-1 text-[9px]">★</span>}
                                </span>
                              )}
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

        <p className="text-[10px] text-muted-foreground text-center">
          Source: U.S. Census Bureau, ACS 5-Year Estimates (2022). ★ = best among compared. Higher is better for income, homeownership, education; lower is better for poverty, rent, unemployment.
        </p>
      </div>
    </Layout>
  );
}
