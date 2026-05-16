import { useState, useMemo } from "react";
import { DollarSign, Loader2, ExternalLink, ArrowUpDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEconomicData, type CountyEconomicData } from "@/hooks/useEconomicData";

type SortKey = "medianIncome" | "povertyRate" | "unemploymentRate" | "medianHomeValue" | "medianRent";

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

export default function EconomicVitalityDashboard() {
  const { data, isLoading } = useEconomicData();
  const [sortKey, setSortKey] = useState<SortKey>("medianIncome");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const top10 = useMemo(() => (data || []).slice(0, 10).map((d) => ({ county: d.county, income: d.medianIncome })), [data]);
  const bottom10 = useMemo(() => [...(data || [])].sort((a, b) => a.medianIncome - b.medianIncome).slice(0, 10).map((d) => ({ county: d.county, income: d.medianIncome })), [data]);

  const handleCSV = () => {
    if (!sorted.length) return;
    const header = "County,Median Income,Poverty Rate,Unemployment Rate,Median Home Value,Median Rent\n";
    const rows = sorted.map((d) => `${d.county},${d.medianIncome},${d.povertyRate},${d.unemploymentRate},${d.medianHomeValue},${d.medianRent}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "michigan-economic-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card><CardContent className="py-12 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading Census data...</span>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-michigan-gold" /> Economic Vitality by County
              </CardTitle>
              <CardDescription>Income, poverty, employment, and housing costs across Michigan</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCSV}>
              <Download className="mr-1 h-3 w-3" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Income gap highlight */}
          {data && data.length > 1 && (
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 mb-4">
              <p className="text-xs text-foreground">
                <strong>Income gap:</strong> The wealthiest county ({data[0].county}: {fmt(data[0].medianIncome)}) has{" "}
                {((data[0].medianIncome / (data[data.length - 1]?.medianIncome || 1))).toFixed(1)}× the median income of the poorest ({data[data.length - 1]?.county}: {fmt(data[data.length - 1]?.medianIncome || 0)})
              </p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">County</th>
                  {([
                    ["medianIncome", "Median Income"],
                    ["povertyRate", "Poverty %"],
                    ["unemploymentRate", "Unemp. %"],
                    ["medianHomeValue", "Home Value"],
                    ["medianRent", "Rent"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="pb-2 text-right">
                      <button onClick={() => toggleSort(key)} className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
                        {label} <ArrowUpDown className="h-2.5 w-2.5" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 25).map((d) => (
                  <tr key={d.fips} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium text-foreground">{d.county}</td>
                    <td className="py-2 text-right tabular-nums">{fmt(d.medianIncome)}</td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={d.povertyRate > 18 ? "text-michigan-coral font-semibold" : ""}>{d.povertyRate}%</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={d.unemploymentRate > 7 ? "text-michigan-coral font-semibold" : ""}>{d.unemploymentRate}%</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmt(d.medianHomeValue)}</td>
                    <td className="py-2 text-right tabular-nums">${d.medianRent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Showing top 25 by {sortKey === "medianIncome" ? "income" : sortKey}. Download CSV for all counties.
            Source: U.S. Census Bureau, American Community Survey 2023.
          </p>
        </CardContent>
      </Card>

      {/* Income comparison chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Highest Median Income Counties</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={top10} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="county" type="category" width={85} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Median Income"]} />
                <Bar dataKey="income" radius={[0, 4, 4, 0]} fill="hsl(145, 45%, 42%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lowest Median Income Counties</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bottom10} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="county" type="category" width={85} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Median Income"]} />
                <Bar dataKey="income" radius={[0, 4, 4, 0]} fill="hsl(0, 80%, 55%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
