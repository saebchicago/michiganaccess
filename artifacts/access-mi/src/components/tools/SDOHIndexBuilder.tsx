import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Download, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_CROSS_DOMAIN, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";

interface SDOHDimension {
  key: string;
  label: string;
  description: string;
  extract: (county: string) => number;
}

const DIMENSIONS: SDOHDimension[] = [
  {
    key: "healthcare",
    label: "Healthcare Access",
    description: "Uninsured rate + PCP ratio (inverted)",
    extract: (c) => {
      const p = COUNTY_PROFILES[c];
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!p || !cd) return 50;
      const uninsured = parseFloat(p.healthHighlights[0]?.value || "6") ;
      const pcpStr = p.healthHighlights[1]?.value || "1500:1";
      const pcp = parseInt(pcpStr.replace(/[^0-9]/g, ""), 10) || 1500;
      // Higher uninsured = worse; higher PCP ratio = worse
      return Math.min(100, (uninsured / 12) * 50 + (pcp / 8000) * 50);
    },
  },
  {
    key: "economic",
    label: "Economic Stress",
    description: "Poverty rate + unemployment",
    extract: (c) => {
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!cd) return 50;
      return Math.min(100, (cd.povertyRate ?? 14) / 30 * 60 + (cd.unemploymentRate ?? 4) / 10 * 40);
    },
  },
  {
    key: "housing",
    label: "Housing Instability",
    description: "Rent burden + affordability gap",
    extract: (c) => {
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!cd) return 50;
      const rentBurden = cd.rentBurden ?? 47;
      const income = cd.medianIncome ?? 55000;
      const rent = cd.medianRent ?? 800;
      const ratio = (rent * 12) / income;
      return Math.min(100, (rentBurden / 60) * 50 + (ratio / 0.5) * 50);
    },
  },
  {
    key: "food",
    label: "Food Security",
    description: "Food insecurity rate + vehicle access",
    extract: (c) => {
      const p = COUNTY_PROFILES[c];
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!p || !cd) return 50;
      const food = parseFloat(p.healthHighlights[2]?.value || "13");
      const vehicle = cd.vehicleAccess ?? 92;
      return Math.min(100, (food / 22) * 60 + ((100 - vehicle) / 20) * 40);
    },
  },
  {
    key: "transportation",
    label: "Transportation",
    description: "Commute time + vehicle access gap",
    extract: (c) => {
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!cd) return 50;
      const commute = cd.commuteTime ?? 25;
      const vehicle = cd.vehicleAccess ?? 92;
      return Math.min(100, (commute / 40) * 50 + ((100 - vehicle) / 20) * 50);
    },
  },
  {
    key: "isolation",
    label: "Social Isolation",
    description: "HS grad rate (inverted) + rural indicator",
    extract: (c) => {
      const p = COUNTY_PROFILES[c];
      const cd = COUNTY_CROSS_DOMAIN[c];
      if (!p || !cd) return 50;
      const hsGap = 100 - (cd.hsGradRate ?? 82);
      const rural = p.countyType === "rural" ? 20 : p.countyType === "suburban" ? 10 : 0;
      return Math.min(100, (hsGap / 30) * 60 + rural * 2);
    },
  },
];

const DEFAULT_WEIGHTS = [17, 17, 17, 17, 16, 16]; // sums to 100
const QUINTILE_COLORS = [
  "bg-green-600",
  "bg-green-400",
  "bg-yellow-400",
  "bg-orange-500",
  "bg-red-600",
];
const QUINTILE_LABELS = ["Low Vulnerability", "Below Average", "Moderate", "Above Average", "High Vulnerability"];

function normalize(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => Math.round(100 / weights.length));
  return weights.map((w) => Math.round((w / sum) * 100));
}

export default function SDOHIndexBuilder() {
  const [weights, setWeights] = useState<number[]>([...DEFAULT_WEIGHTS]);
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);

  const normalizedWeights = useMemo(() => normalize(weights), [weights]);

  const handleWeightChange = useCallback(
    (index: number, val: number[]) => {
      const next = [...weights];
      next[index] = val[0];
      setWeights(next);
    },
    [weights],
  );

  const rankings = useMemo(() => {
    const counties = Object.keys(COUNTY_PROFILES);
    const scored = counties.map((county) => {
      const scores = DIMENSIONS.map((d) => d.extract(county));
      const composite = scores.reduce((sum, s, i) => sum + s * (normalizedWeights[i] / 100), 0);
      return { county, composite: Math.round(composite * 10) / 10, scores };
    });
    scored.sort((a, b) => b.composite - a.composite);
    return scored;
  }, [normalizedWeights]);

  const maxScore = rankings[0]?.composite || 100;

  const getQuintile = (rank: number, total: number) => {
    const pct = rank / total;
    if (pct <= 0.2) return 4;
    if (pct <= 0.4) return 3;
    if (pct <= 0.6) return 2;
    if (pct <= 0.8) return 1;
    return 0;
  };

  const exportCSV = () => {
    const header = ["Rank", "County", "Composite Score", ...DIMENSIONS.map((d) => d.label)].join(",");
    const rows = rankings.map((r, i) => [i + 1, r.county, r.composite, ...r.scores.map((s) => s.toFixed(1))].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sdoh-vulnerability-index.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              SDOH Vulnerability Index Builder
              <Badge variant="outline" className="text-[10px]">Interactive</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust dimension weights to build a custom vulnerability index for all 83 counties.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setWeights([...DEFAULT_WEIGHTS])}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Sliders */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((dim, i) => (
            <div key={dim.key} className="space-y-1.5 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{dim.label}</span>
                <span className="text-xs font-bold text-primary tabular-nums">{normalizedWeights[i]}%</span>
              </div>
              <Slider
                value={[weights[i]]}
                onValueChange={(v) => handleWeightChange(i, v)}
                aria-label={`${dim.label} weight`}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">{dim.description}</p>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">County Rankings</h3>
            <div className="flex gap-2 flex-wrap">
              {QUINTILE_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-sm ${QUINTILE_COLORS[i]}`} />
                  <span className="text-[9px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-0.5 max-h-[500px] overflow-y-auto pr-1">
            {rankings.map((r, idx) => {
              const quintile = getQuintile(idx + 1, rankings.length);
              const isExpanded = expandedCounty === r.county;
              return (
                <div key={r.county}>
                  <motion.button
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setExpandedCounty(isExpanded ? null : r.county)}
                    layout
                  >
                    <span className="text-[10px] text-muted-foreground w-6 text-right tabular-nums">{idx + 1}</span>
                    <span className="text-xs font-medium flex-1 min-w-0 truncate">{r.county}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <motion.div
                        className={`h-full rounded ${QUINTILE_COLORS[quintile]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.composite / maxScore) * 100}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.005 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-10 text-right tabular-nums">
                      {r.composite}
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
                        <div className="ml-8 mr-2 mb-2 p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
                          {DIMENSIONS.map((dim, di) => (
                            <div key={dim.key} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-28 shrink-0">{dim.label}</span>
                              <div className="flex-1 h-2.5 bg-muted rounded overflow-hidden">
                                <div
                                  className="h-full rounded bg-primary/70"
                                  style={{ width: `${r.scores[di]}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono w-8 text-right">{r.scores[di].toFixed(0)}</span>
                            </div>
                          ))}
                          <p className="text-[10px] text-muted-foreground pt-1">
                            Pop: {(COUNTY_PROFILES[r.county]?.population || 0).toLocaleString()} |
                            Type: {COUNTY_PROFILES[r.county]?.countyType || "unknown"}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Illustrative composite</strong> - 2022-2024 public data estimates. Dimension scores derived from ACS, BLS, USDA, and County Health Rankings data.
            Weights auto-normalize to 100%. This tool is for exploratory analysis; it does not represent an official index.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
