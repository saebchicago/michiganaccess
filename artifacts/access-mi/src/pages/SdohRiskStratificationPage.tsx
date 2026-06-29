import { Fragment, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, RotateCcw, Download, Info, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import DataProvenance from "@/components/shared/DataProvenance";
import {
  SDOH_DIMENSIONS,
  DEFAULT_SDOH_WEIGHTS,
  rankCountiesBySdohRisk,
  stateAverageRisk,
  type RiskTier,
} from "@/utils/sdohRiskModel";
import { countyToSlug } from "@/utils/countyUtils";
import { toast } from "sonner";

const SDOH_WEIGHTS_KEY = "accessmi_sdoh_risk_weights_v1";

const TIER_STYLES: Record<RiskTier, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Moderate: "bg-yellow-500 text-slate-900",
  Low: "bg-green-600 text-white",
};

function loadWeights(): number[] {
  try {
    const raw = localStorage.getItem(SDOH_WEIGHTS_KEY);
    if (!raw) return [...DEFAULT_SDOH_WEIGHTS];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) && parsed.length === 6 ? parsed : [...DEFAULT_SDOH_WEIGHTS];
  } catch {
    return [...DEFAULT_SDOH_WEIGHTS];
  }
}

export default function SdohRiskStratificationPage() {
  usePageMeta({
    title: "SDOH Risk Stratification",
    description:
      "County-level SDOH composite risk index with adjustable dimension weights and integrity labels on every input.",
    path: "/sdoh-risk",
  });

  const [weights, setWeights] = useState<number[]>(loadWeights);
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);

  const rankings = useMemo(() => rankCountiesBySdohRisk(weights), [weights]);
  const stateAvg = useMemo(() => stateAverageRisk(weights), [weights]);

  const handleWeightChange = useCallback((index: number, value: number[]) => {
    setWeights((prev) => {
      const next = [...prev];
      next[index] = value[0];
      return next;
    });
  }, []);

  const handleSaveWeights = () => {
    localStorage.setItem(SDOH_WEIGHTS_KEY, JSON.stringify(weights));
    toast.success("Weight model saved locally");
  };

  const handleReset = () => {
    setWeights([...DEFAULT_SDOH_WEIGHTS]);
    localStorage.removeItem(SDOH_WEIGHTS_KEY);
    toast.success("Reset to default weights");
  };

  const handleExport = () => {
    const header = "county,composite,tier," + SDOH_DIMENSIONS.map((d) => d.key).join(",");
    const rows = rankings.map(
      (r) =>
        `${r.county},${r.composite},${r.tier},${SDOH_DIMENSIONS.map((d) => r.dimensions[d.key]).join(",")}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sdoh-risk-stratification.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Health", href: "/health" },
          { label: "SDOH Risk Stratification" },
        ]}
      />

      <section className="bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-950 py-12 md:py-16 text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-emerald-300" />
              <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">
                UC3 Phase 1
              </Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">SDOH Risk Stratification</h1>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              Build a custom county risk index from six SDOH dimensions. Adjust weights,
              save your model locally, and export ranked counties with provenance labels.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              County-level proxy index until tract-level composites are fully seeded.
              State average composite: <strong>{stateAvg}</strong> (MODELED).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Dimension weights</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleSaveWeights}>
                  Save model
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleExport}>
                  <Download className="h-3 w-3" /> CSV
                </Button>
              </div>
            </div>
            {SDOH_DIMENSIONS.map((dim, i) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{dim.label}</span>
                  <span className="text-muted-foreground">{weights[i]}%</span>
                </div>
                <Slider
                  value={[weights[i]]}
                  min={0}
                  max={40}
                  step={1}
                  onValueChange={(v) => handleWeightChange(i, v)}
                  aria-label={`${dim.label} weight`}
                />
                <p className="text-[10px] text-muted-foreground">{dim.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <h2 className="text-sm font-bold mb-4">County risk rankings ({rankings.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="py-2 px-2 text-left">Rank</th>
                    <th className="py-2 px-2 text-left">County</th>
                    <th className="py-2 px-2 text-right">Composite</th>
                    <th className="py-2 px-2 text-center">Tier</th>
                    <th className="py-2 px-2 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 25).map((r, idx) => (
                    <Fragment key={r.county}>
                      <tr className="border-b border-border/30 hover:bg-muted/30">
                        <td className="py-2 px-2 font-mono text-xs">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <Link
                            to={`/county/${countyToSlug(r.county)}`}
                            className="text-primary hover:underline text-xs"
                          >
                            {r.county}
                          </Link>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-xs">{r.composite}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${TIER_STYLES[r.tier]}`}>
                            {r.tier}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() =>
                              setExpandedCounty(expandedCounty === r.county ? null : r.county)
                            }
                          >
                            {expandedCounty === r.county ? "Hide" : "Show"}
                          </Button>
                        </td>
                      </tr>
                      {expandedCounty === r.county && (
                        <tr className="bg-muted/20">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="grid gap-2 sm:grid-cols-3">
                              {SDOH_DIMENSIONS.map((dim) => (
                                <div key={dim.key} className="text-xs">
                                  <span className="font-semibold">{dim.label}: </span>
                                  <span className="font-mono">{r.dimensions[dim.key]}</span>
                                  <IntegrityBadge
                                    label={dim.integrityLabel}
                                    source={dim.source}
                                    vintage={dim.vintage}
                                  />
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/health-equity-atlas">
              Health Equity Atlas <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cohort-builder">Cohort Builder</Link>
          </Button>
        </div>

        <DataProvenance
          source="ACS 5-Year, BLS LAUS, County Health Rankings, NCES"
          updated="2024"
          methodologyHref="/methodology/environmental"
        />
      </div>
    </Layout>
  );
}