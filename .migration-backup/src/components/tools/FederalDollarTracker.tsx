import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, BarChart3, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEDERAL_INVESTMENTS, TOTAL_FEDERAL_INVESTMENT } from "@/data/federal-investment";
import type { FederalInvestment } from "@/data/federal-investment";

function formatDollars(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function DetailPanel({ item }: { item: FederalInvestment }) {
  const pcts = {
    sba: ((item.sbaBusinessLoans / item.totalFederal) * 100).toFixed(1),
    disaster: ((item.sbaDisasterLoans / item.totalFederal) * 100).toFixed(1),
    fema: ((item.femaAssistance / item.totalFederal) * 100).toFixed(1),
  };
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
        <p className="font-semibold text-foreground">{item.county} County Breakdown</p>
        <p className="text-muted-foreground">Population: {item.population.toLocaleString()}</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-[10px] text-muted-foreground">SBA Business Loans</span>
            <p className="font-medium" style={{ color: "#1e3a5f" }}>{formatDollars(item.sbaBusinessLoans)} ({pcts.sba}%)</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">SBA Disaster Loans</span>
            <p className="font-medium" style={{ color: "#d97706" }}>{formatDollars(item.sbaDisasterLoans)} ({pcts.disaster}%)</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">FEMA Assistance (est.)</span>
            <p className="font-medium" style={{ color: "#0d9488" }}>{formatDollars(item.femaAssistance)} ({pcts.fema}%)</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Per Capita</span>
            <p className="font-medium text-foreground">${item.perCapita.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FederalDollarTracker() {
  const [perCapita, setPerCapita] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const sorted = [...FEDERAL_INVESTMENTS].sort((a, b) =>
      perCapita ? b.perCapita - a.perCapita : b.totalFederal - a.totalFederal,
    );
    return sorted.map((c) => ({
      county: c.county,
      "SBA Business": perCapita ? Math.round(c.sbaBusinessLoans / c.population) : c.sbaBusinessLoans,
      "SBA Disaster": perCapita ? Math.round(c.sbaDisasterLoans / c.population) : c.sbaDisasterLoans,
      "FEMA (est.)": perCapita ? Math.round(c.femaAssistance / c.population) : c.femaAssistance,
    }));
  }, [perCapita]);

  const selectedItem = useMemo(
    () => (selectedCounty ? FEDERAL_INVESTMENTS.find((c) => c.county === selectedCounty) : null),
    [selectedCounty],
  );

  const headlineTotal = formatDollars(TOTAL_FEDERAL_INVESTMENT);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-5">
          {/* Headline */}
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" /> Federal Dollar Tracker
            </p>
            <p className="text-2xl font-bold text-foreground">{headlineTotal}</p>
            <p className="text-xs text-muted-foreground">
              in federal investment across Michigan (SBA + FEMA combined)
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPerCapita(false)}
              className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
                !perCapita
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Total $
            </button>
            <button
              onClick={() => setPerCapita(true)}
              className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
                perCapita
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Per Capita
            </button>
          </div>

          {/* Stacked Bar Chart */}
          <div className="w-full" style={{ height: Math.max(400, FEDERAL_INVESTMENTS.length * 32) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                onClick={(state) => {
                  if (state?.activeLabel) {
                    setSelectedCounty(
                      state.activeLabel === selectedCounty ? null : state.activeLabel,
                    );
                  }
                }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => formatDollars(v)}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="county"
                  width={100}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number) => formatDollars(value)}
                  contentStyle={{ fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="SBA Business" stackId="a" fill="#1e3a5f" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.county}
                      cursor="pointer"
                      opacity={selectedCounty && selectedCounty !== entry.county ? 0.4 : 1}
                    />
                  ))}
                </Bar>
                <Bar dataKey="SBA Disaster" stackId="a" fill="#d97706">
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.county}
                      cursor="pointer"
                      opacity={selectedCounty && selectedCounty !== entry.county ? 0.4 : 1}
                    />
                  ))}
                </Bar>
                <Bar dataKey="FEMA (est.)" stackId="a" fill="#0d9488" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.county}
                      cursor="pointer"
                      opacity={selectedCounty && selectedCounty !== entry.county ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* County detail */}
          {selectedItem && <DetailPanel item={selectedItem} />}

          {/* Source */}
          <div className="flex items-start gap-1 text-left">
            <Info className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              Compiled from SBA FOIA loan data and FEMA OpenFEMA. FEMA assistance is estimated as disaster declaration count multiplied by average per-declaration assistance. Illustrative estimates.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
