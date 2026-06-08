import { Zap, TrendingUp, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEnergyData } from "@/hooks/useEnergyData";

function formatMonth(period: string) {
  const [y, m] = period.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} '${y.slice(2)}`;
}

export default function EnergyPriceTracker() {
  const { data, isLoading } = useEnergyData();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading energy prices...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const diff = data.latestMI !== null && data.latestUS !== null
    ? (data.latestMI - data.latestUS).toFixed(1)
    : null;
  const isAbove = diff !== null && parseFloat(diff) > 0;

  // Merge MI and US data for chart
  const chartData = data.michigan.map((mi, i) => ({
    month: formatMonth(mi.period),
    Michigan: mi.price,
    National: data.national[i]?.price ?? null,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5 text-michigan-gold" />
          Live Electricity Prices - Michigan vs. National
        </CardTitle>
        <CardDescription>
          Residential retail price (¢/kWh) · Last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {data.latestMI?.toFixed(1)}¢
            </p>
            <p className="text-xs text-muted-foreground">Michigan</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {data.latestUS?.toFixed(1)}¢
            </p>
            <p className="text-xs text-muted-foreground">National Avg</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {isAbove && <TrendingUp className="h-4 w-4 text-michigan-coral" />}
              <p className={`text-2xl font-bold ${isAbove ? "text-michigan-coral" : "text-michigan-forest"}`}>
                {isAbove ? "+" : ""}{diff}¢
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAbove ? "Above" : "Below"} National
            </p>
          </div>
        </div>

        {isAbove && (
          <Badge variant="outline" className="text-[10px] border-michigan-coral/30 text-michigan-coral">
            Michigan residential rates are {diff}¢/kWh above the national average
          </Badge>
        )}

        {/* Chart */}
        <div role="img" aria-label="Line chart showing Michigan vs national residential electricity prices over the last 12 months">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${v}¢`}
            />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toFixed(1)}¢/kWh`, name]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid hsl(214, 20%, 90%)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="Michigan"
              stroke="hsl(209, 86%, 31%)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="National"
              stroke="hsl(215, 19%, 65%)"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          Source:{" "}
          <a
            href="https://www.eia.gov/electricity/monthly/"
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            U.S. Energy Information Administration <ExternalLink className="h-2.5 w-2.5" />
          </a>{" "}
          - updated monthly
        </p>
      </CardContent>
    </Card>
  );
}
