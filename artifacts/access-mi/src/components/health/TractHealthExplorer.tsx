import { useState } from "react";
import { BarChart3, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTractHealthData, TRACT_MEASURES } from "@/hooks/useTractHealthData";

const COUNTIES: { name: string; fips: string }[] = [
  { name: "Wayne", fips: "26163" },
  { name: "Oakland", fips: "26125" },
  { name: "Macomb", fips: "26099" },
  { name: "Kent", fips: "26081" },
  { name: "Genesee", fips: "26049" },
  { name: "Washtenaw", fips: "26161" },
  { name: "Ingham", fips: "26065" },
  { name: "Kalamazoo", fips: "26077" },
  { name: "Saginaw", fips: "26145" },
  { name: "Muskegon", fips: "26121" },
  { name: "Ottawa", fips: "26139" },
  { name: "Berrien", fips: "26021" },
  { name: "Calhoun", fips: "26025" },
  { name: "Jackson", fips: "26075" },
  { name: "Livingston", fips: "26093" },
  { name: "Monroe", fips: "26115" },
  { name: "Bay", fips: "26017" },
  { name: "Allegan", fips: "26005" },
  { name: "Eaton", fips: "26045" },
  { name: "Midland", fips: "26111" },
];

function barColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio > 0.8) return "hsl(0, 80%, 55%)";
  if (ratio > 0.5) return "hsl(27, 87%, 55%)";
  return "hsl(145, 45%, 42%)";
}

export default function TractHealthExplorer() {
  const [countyFips, setCountyFips] = useState("26163");
  const [measureId, setMeasureId] = useState("DIABETES");
  const { data, isLoading } = useTractHealthData(countyFips, measureId);

  const countyName = COUNTIES.find((c) => c.fips === countyFips)?.name || "Wayne";
  const measureLabel = TRACT_MEASURES.find((m) => m.id === measureId)?.label || "Diabetes";

  const chartData = (data || []).slice(0, 25).map((d, i) => ({
    tract: `Tract ${i + 1}`,
    value: d.data_value,
    fullName: d.locationname,
    pop: d.totalpopulation,
  }));

  const max = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 0;
  const min = chartData.length > 0 ? Math.min(...chartData.map((d) => d.value)) : 0;
  const gap = (max - min).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Neighborhood-Level Health Data
        </CardTitle>
        <CardDescription>
          Census tract variation within a single county - county averages hide massive disparities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Select value={countyFips} onValueChange={setCountyFips}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c.fips} value={c.fips}>{c.name} County</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={measureId} onValueChange={setMeasureId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {TRACT_MEASURES.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading tract data...</span>
          </div>
        )}

        {!isLoading && chartData.length > 0 && (
          <>
            {/* Insight callout */}
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-michigan-coral-deep shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                In <strong>{countyName} County</strong>, {measureLabel.toLowerCase()} prevalence ranges from{" "}
                <strong>{min.toFixed(1)}%</strong> to <strong>{max.toFixed(1)}%</strong> across census tracts - a{" "}
                <strong>{gap} percentage point gap</strong> within the same county.
              </p>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={Math.min(chartData.length * 28 + 40, 600)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} domain={[0, "dataMax + 2"]} />
                <YAxis dataKey="tract" type="category" width={60} tick={{ fontSize: 9 }} />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(1)}%`, measureLabel]}
                  labelFormatter={(label: string, payload: any[]) => {
                    const d = payload?.[0]?.payload;
                    return d ? `${d.fullName} (pop: ${d.pop || "-"})` : label;
                  }}
                  contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid hsl(214, 20%, 90%)" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.value, max)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {!isLoading && chartData.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tract-level data available for this county/metric combination. Try a different selection.
          </p>
        )}

        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          Source:{" "}
          <a
            href="https://www.cdc.gov/places/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            CDC PLACES 2025, Census Tract Level <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
