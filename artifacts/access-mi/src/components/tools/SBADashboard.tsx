import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, DollarSign, Briefcase, Users, Award } from "lucide-react";
import { SBA_COUNTY_DATA, MI_SBA_TOTALS, type SBACountyData } from "@/data/sba-lending";

function formatCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export default function SBADashboard() {
  const [selected, setSelected] = useState<SBACountyData | null>(null);

  const top15 = useMemo(
    () => [...SBA_COUNTY_DATA].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 15),
    [],
  );

  const chartData = useMemo(
    () => top15.map(d => ({ county: d.county, amount: d.totalAmount / 1e6, loans: d.totalLoans })),
    [top15],
  );

  return (
    <div className="space-y-8">
      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Total SBA Lending", value: "$3.2B", sub: "FY2020-2024 est.", className: "text-emerald-600 dark:text-emerald-400" },
          { icon: Briefcase, label: "Total Loans", value: "12,500", sub: "7(a), 504, Micro", className: "text-primary" },
          { icon: Users, label: "Jobs Supported", value: "85K", sub: "Direct & indirect", className: "text-blue-600 dark:text-blue-400" },
          { icon: Award, label: "Equity Benchmark", value: "18%", sub: "Minority-owned avg", className: "text-amber-600 dark:text-amber-400" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.className}`} />
              <p className={`text-2xl font-bold ${stat.className}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart - top 15 counties by total lending amount */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 15 Counties by SBA Lending Volume</CardTitle>
          <p className="text-xs text-muted-foreground">Click a bar to view county detail.</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                <YAxis type="category" dataKey="county" tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}M`, "Total Lending"]} />
                <Bar
                  dataKey="amount"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(_data: any, index: number) => setSelected(top15[index])}
                >
                  {chartData.map((entry, i) => {
                    const county = top15[i];
                    const isBelowEquity = county && county.minorityOwned < MI_SBA_TOTALS.minorityOwnedAvg;
                    return (
                      <Cell
                        key={entry.county}
                        fill={selected?.county === entry.county ? "#059669" : isBelowEquity ? "#F59E0B" : "#3B82F6"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-500" /> Above equity avg</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500" /> Below 18% minority-owned</span>
          </div>
        </CardContent>
      </Card>

      {/* County detail card */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selected.county} County - SBA Detail</CardTitle>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Total Loans</p>
                <p className="font-bold">{selected.totalLoans.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Amount</p>
                <p className="font-bold">{formatCurrency(selected.totalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Avg Loan Size</p>
                <p className="font-bold">{formatCurrency(selected.avgLoanSize)}</p>
                <p className="text-[10px] text-muted-foreground">State avg: {formatCurrency(MI_SBA_TOTALS.avgLoanSize)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Jobs Supported</p>
                <p className="font-bold">{selected.jobsSupported.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Top Industry</p>
                <p className="font-bold">{selected.topIndustry}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Per Capita Lending</p>
                <p className="font-bold">${selected.perCapitaLending}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Minority-Owned</p>
                <p className="font-bold">
                  {selected.minorityOwned}%
                  {selected.minorityOwned < MI_SBA_TOTALS.minorityOwnedAvg && (
                    <Badge variant="outline" className="ml-1 text-[9px] text-amber-600 border-amber-400">Below Avg</Badge>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">State avg: {MI_SBA_TOTALS.minorityOwnedAvg}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Women / Veteran Owned</p>
                <p className="font-bold">{selected.womenOwned}% / {selected.veteranOwned}%</p>
                <p className="text-[10px] text-muted-foreground">State avg: {MI_SBA_TOTALS.womenOwnedAvg}% / {MI_SBA_TOTALS.veteranOwnedAvg}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <strong>Source:</strong> Modeled from SBA FOIA FY2020-2024 (data.sba.gov). Illustrative estimates.
          Actual county-level breakdowns may vary. See <a href="/methodology" className="text-primary hover:underline">Methodology</a>.
        </p>
      </div>
    </div>
  );
}
