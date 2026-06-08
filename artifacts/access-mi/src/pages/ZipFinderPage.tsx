import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Download, Filter, X, Plus, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import DataProvenance from "@/components/shared/DataProvenance";
import { ZIP_QUICKSTATS } from "@/data/zip-quickstats";
import { IRS_ZIP_DATA } from "@/data/irs-zip-income";
import { MICHIGAN_EJSCREEN } from "@/data/ejscreen";
import { MICHIGAN_GEOCARE } from "@/data/geocare";
import { MICHIGAN_SAFMR } from "@/data/hudSafmr";
import { ZIP_TO_COUNTY } from "@/data/michiganZips";

// ── Metric Definitions ──────────────────────────────────────────────────────

interface MetricDef {
  key: string;
  label: string;
  unit: string;
  getter: (zip: string) => number | null;
  source: string;
}

const METRICS: MetricDef[] = [
  {
    key: "uninsured",
    label: "Uninsured Rate",
    unit: "%",
    getter: () => null, // CDC PLACES is async - not available statically; we use quickstats proxy
    source: "CDC PLACES 2024",
  },
  {
    key: "eitc",
    label: "EITC Rate",
    unit: "%",
    getter: (zip) => IRS_ZIP_DATA[zip]?.eitcPct ?? null,
    source: "IRS SOI 2021",
  },
  {
    key: "median_income",
    label: "Median Income",
    unit: "$",
    getter: (zip) => ZIP_QUICKSTATS[zip]?.medianIncome ?? null,
    source: "Census ACS 2022",
  },
  {
    key: "ej_index",
    label: "EJ Index",
    unit: "",
    getter: (zip) => MICHIGAN_EJSCREEN[zip]?.ej_index ?? null,
    source: "EPA EJSCREEN v2.3",
  },
  {
    key: "safmr_2br",
    label: "SAFMR 2BR",
    unit: "$",
    getter: (zip) => MICHIGAN_SAFMR[zip]?.safmr_2br ?? null,
    source: "HUD SAFMR FY2024",
  },
  {
    key: "fqhc_penetration",
    label: "FQHC Penetration",
    unit: "%",
    getter: (zip) => {
      const g = MICHIGAN_GEOCARE[zip];
      if (!g || g.is_suppressed) return null;
      return Math.round(g.hcp_penetration_rate * 100);
    },
    source: "HRSA GeoCare 2023",
  },
  {
    key: "grad_rate",
    label: "Graduation Rate",
    unit: "%",
    getter: (zip) => ZIP_QUICKSTATS[zip]?.gradRate ?? null,
    source: "MI School Data",
  },
];

type Operator = "above" | "below";

interface FilterCondition {
  id: number;
  metricKey: string;
  operator: Operator;
  value: string;
}

// ── All known ZIPs (union of all data sources) ───────────────────────────

const ALL_ZIPS = Array.from(
  new Set([
    ...Object.keys(ZIP_QUICKSTATS),
    ...Object.keys(IRS_ZIP_DATA),
    ...Object.keys(MICHIGAN_EJSCREEN),
    ...Object.keys(MICHIGAN_GEOCARE),
    ...Object.keys(MICHIGAN_SAFMR),
  ])
).sort();

let nextId = 1;

export default function ZipFinderPage() {
  usePageMeta({
    title: "ZIP Finder - Multi-Criteria Filter",
    description: "Find Michigan ZIP codes by filtering on health, economic, and environmental metrics.",
    path: "/zip-finder",
  });

  const [conditions, setConditions] = useState<FilterCondition[]>([
    { id: nextId++, metricKey: "eitc", operator: "above", value: "25" },
  ]);

  const addCondition = useCallback(() => {
    if (conditions.length >= 4) return;
    setConditions((prev) => [...prev, { id: nextId++, metricKey: "ej_index", operator: "above", value: "50" }]);
  }, [conditions.length]);

  const removeCondition = useCallback((id: number) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCondition = useCallback((id: number, field: keyof FilterCondition, val: string) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  }, []);

  const results = useMemo(() => {
    return ALL_ZIPS.filter((zip) => {
      return conditions.every((cond) => {
        const metric = METRICS.find((m) => m.key === cond.metricKey);
        if (!metric) return true;
        const val = metric.getter(zip);
        if (val == null) return false;
        const threshold = parseFloat(cond.value);
        if (isNaN(threshold)) return true;
        return cond.operator === "above" ? val >= threshold : val <= threshold;
      });
    });
  }, [conditions]);

  const downloadCsv = useCallback(() => {
    const headers = ["ZIP", "City", "County", ...METRICS.map((m) => m.label)];
    const rows = results.map((zip) => {
      const lookup = ZIP_TO_COUNTY[zip] ?? ZIP_QUICKSTATS[zip];
      const city = (lookup as { city?: string })?.city ?? "";
      const county = (lookup as { county?: string })?.county ?? "";
      return [zip, city, county, ...METRICS.map((m) => m.getter(zip)?.toString() ?? "")].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `michigan-zip-finder-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Data & Insights", href: "/data-and-insights" },
        { label: "ZIP Finder" },
      ]} />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">Multi-Criteria</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-2">ZIP Finder</h1>
            <p className="text-muted-foreground">
              Filter Michigan ZIP codes by combining up to 4 conditions. Find communities matching specific health, economic, and environmental thresholds.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        {/* Filter Conditions */}
        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" /> Filter Conditions
            </h2>
            <div className="space-y-3">
              {conditions.map((cond) => (
                <div key={cond.id} className="flex flex-wrap items-center gap-2">
                  <select
                    className="text-sm border rounded-md px-3 py-1.5 bg-background"
                    value={cond.metricKey}
                    onChange={(e) => updateCondition(cond.id, "metricKey", e.target.value)}
                  >
                    {METRICS.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    className="text-sm border rounded-md px-3 py-1.5 bg-background"
                    value={cond.operator}
                    onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                  >
                    <option value="above">above</option>
                    <option value="below">below</option>
                  </select>
                  <input
                    type="number"
                    className="text-sm border rounded-md px-3 py-1.5 w-24 bg-background tabular-nums"
                    value={cond.value}
                    onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {METRICS.find((m) => m.key === cond.metricKey)?.unit}
                  </span>
                  {conditions.length > 1 && (
                    <button onClick={() => removeCondition(cond.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {conditions.length < 4 && (
              <Button variant="outline" size="sm" onClick={addCondition} className="gap-1">
                <Plus className="h-3 w-3" /> Add Condition
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            {results.length} matching ZIP{results.length !== 1 ? "s" : ""}
          </h2>
          <Button variant="outline" size="sm" onClick={downloadCsv} disabled={results.length === 0} className="gap-1">
            <Download className="h-3 w-3" /> Download CSV
          </Button>
        </div>

        {results.length > 0 ? (
          <Card>
            <CardContent className="py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left font-semibold text-xs">ZIP</th>
                      <th className="py-2 px-2 text-left font-semibold text-xs">City</th>
                      <th className="py-2 px-2 text-left font-semibold text-xs">County</th>
                      {conditions.map((c) => {
                        const m = METRICS.find((x) => x.key === c.metricKey);
                        return <th key={c.id} className="py-2 px-2 text-right font-semibold text-xs">{m?.label}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 50).map((zip) => {
                      const lookup = ZIP_TO_COUNTY[zip] ?? ZIP_QUICKSTATS[zip];
                      const city = (lookup as { city?: string })?.city ?? "";
                      const county = (lookup as { county?: string })?.county ?? "";
                      return (
                        <tr key={zip} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-1.5 px-2">
                            <Link to={`/zip/${zip}`} className="text-primary hover:underline font-mono flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {zip}
                            </Link>
                          </td>
                          <td className="py-1.5 px-2 text-xs">{city}</td>
                          <td className="py-1.5 px-2 text-xs">{county}</td>
                          {conditions.map((c) => {
                            const metric = METRICS.find((x) => x.key === c.metricKey);
                            const val = metric?.getter(zip);
                            return (
                              <td key={c.id} className="py-1.5 px-2 text-right font-mono text-xs tabular-nums">
                                {val != null ? (metric?.unit === "$" ? `$${val.toLocaleString()}` : `${val}${metric?.unit}`) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {results.length > 50 && (
                <p className="text-[10px] text-muted-foreground py-2 text-center">
                  Showing first 50 of {results.length} results. Download CSV for all.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No ZIPs match all conditions. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        <DataProvenance
          source="IRS SOI 2021, Census ACS 2022, EPA EJSCREEN v2.3, HUD SAFMR FY2024, HRSA GeoCare 2023"
          updated="2025"
          methodologyHref="/methodology"
        />
      </div>
    </Layout>
  );
}
