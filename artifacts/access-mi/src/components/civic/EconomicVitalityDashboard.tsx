import { useState, useMemo } from "react";
import { DollarSign, Loader2, ArrowUpDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEconomicData, ECONOMIC_ACS_URL } from "@/hooks/useEconomicData";
import { SAIPE_PROVENANCE, saipeVintageLabel } from "@/data/saipe-county";
import { ACS5_LABEL } from "@/config/acsVintage";

type SortKey = "medianIncome" | "povertyRate" | "unemploymentRate" | "medianHomeValue" | "medianRent";

const UNAVAILABLE = "Data unavailable";
const fmt = (n: number | null) => n === null ? UNAVAILABLE : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const fmtRate = (n: number | null) => n === null ? UNAVAILABLE : `${n}%`;
/** Nulls sort last in either direction. */
const cmp = (a: number | null, b: number | null, asc: boolean) =>
  a === null ? (b === null ? 0 : 1) : b === null ? -1 : asc ? a - b : b - a;

export default function EconomicVitalityDashboard() {
  const { data: result, isLoading } = useEconomicData();
  const data = result?.counties;
  const isFallback = result?.isFallback ?? false;
  const source = isFallback ? saipeVintageLabel() : ACS5_LABEL;
  const sourceUrl = isFallback ? SAIPE_PROVENANCE.download_url ?? SAIPE_PROVENANCE.source_url : ECONOMIC_ACS_URL;
  const [sortKey, setSortKey] = useState<SortKey>("medianIncome");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => cmp(a[sortKey], b[sortKey], sortAsc));
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const top10 = useMemo(() => (data || []).slice(0, 10).map((d) => ({ county: d.county, income: d.medianIncome })), [data]);
  const bottom10 = useMemo(() => [...(data || [])].sort((a, b) => a.medianIncome - b.medianIncome).slice(0, 10).map((d) => ({ county: d.county, income: d.medianIncome })), [data]);


  const handleCSV = () => {
    if (!sorted.length) return;
    const header = ["County", "County FIPS", "Median household income USD", "Income lower 90%", "Income upper 90%",
      "Poverty percent", "Poverty lower 90%", "Poverty upper 90%", "Unemployment percent", "Median home value USD",
      "Median gross rent USD", "Source and period", "Estimate type", "Primary source URL", "Missing values"];
    const rows = sorted.map((d) => [d.county, d.fips, d.medianIncome, d.incomeInterval[0], d.incomeInterval[1],
      d.povertyRate, d.povertyInterval[0], d.povertyInterval[1], d.unemploymentRate, d.medianHomeValue, d.medianRent,
      source, isFallback ? "MODELED" : "ACS survey estimate", sourceUrl, "Blank means unavailable"]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
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
                <DollarSign className="h-5 w-5 text-michigan-gold-deep" /> Economic Vitality by County
              </CardTitle>
              <CardDescription>Income, poverty, employment, and housing costs across Michigan</CardDescription>
              {isFallback && (
                <p className="mt-1 text-xs text-muted-foreground">
                  The live ACS request was unavailable. Income and poverty come from Census {source} (MODELED).
                  This release does not cover unemployment, home value or rent.{" "}
                  <a className="underline" href="/data/michigan-county-income-poverty.json">Download estimates and intervals (JSON)</a>.
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCSV}>
              <Download className="mr-1 h-3 w-3" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Counties are ordered by point estimate. Their 90% uncertainty intervals can overlap.
            Published income intervals appear below each estimate and in the CSV.
          </p>

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
                    <td className="py-2 text-right tabular-nums">
                      {fmt(d.medianIncome)}
                      {d.incomeInterval.length === 2 && d.incomeInterval.every((v) => v !== null) && (
                        <span className="block text-xs text-muted-foreground">
                          90% interval: {d.incomeInterval.map((v) => "$" + v?.toLocaleString()).join(" to ")}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={d.povertyRate !== null && d.povertyRate > 18 ? "text-michigan-coral-deep font-semibold" : ""}>{fmtRate(d.povertyRate)}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={d.unemploymentRate !== null && d.unemploymentRate > 7 ? "text-michigan-coral-deep font-semibold" : ""}>{fmtRate(d.unemploymentRate)}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmt(d.medianHomeValue)}</td>
                    <td className="py-2 text-right tabular-nums">{d.medianRent === null ? UNAVAILABLE : `$${d.medianRent}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Showing {Math.min(sorted.length, 25)} of {sorted.length} available counties. Download the CSV for all rows.
            {" "}<a className="underline" href={sourceUrl}>U.S. Census Bureau, {source}</a>. Empty CSV fields indicate unavailable values.
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
