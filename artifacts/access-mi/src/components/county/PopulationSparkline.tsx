import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCountyTrends } from "@/data/trendSeries";
import rawTrendData from "@/data/trendSeries.json";

interface Props {
  county: string;
}

// Compute peer tier from all-counties data at render time.
// Tier = sorted by 2024 pop, divided into thirds.
function computePeerContext(county: string): {
  tier: "low" | "mid" | "high";
  peerAvgPct: number;
} | null {
  const allCounties = rawTrendData.counties as Record<
    string,
    { population: { series: { vintage: number; value: number }[] } }
  >;

  const entries = Object.entries(allCounties)
    .map(([name, c]) => {
      const series = c.population.series;
      const v2024 = series.find((p) => p.vintage === 2024)?.value ?? 0;
      const v2020 = series.find((p) => p.vintage === 2020)?.value ?? 0;
      const pct = v2020 > 0 ? ((v2024 - v2020) / v2020) * 100 : 0;
      return { name, v2024, pct };
    })
    .sort((a, b) => a.v2024 - b.v2024);

  const n = entries.length;
  const third = Math.floor(n / 3);
  const idx = entries.findIndex((e) => e.name === county);
  if (idx < 0) return null;

  const tier: "low" | "mid" | "high" =
    idx < third ? "low" : idx < 2 * third ? "mid" : "high";

  const tierEntries =
    tier === "low"
      ? entries.slice(0, third)
      : tier === "mid"
        ? entries.slice(third, 2 * third)
        : entries.slice(2 * third);

  const peerAvgPct =
    tierEntries.reduce((s, e) => s + e.pct, 0) / tierEntries.length;

  return { tier, peerAvgPct };
}

export default function PopulationSparkline({ county }: Props) {
  const trends = getCountyTrends(county);
  if (!trends) return null;

  const { series, source } = trends.population;
  const first = series[0];
  const last = series[series.length - 1];
  const delta = last.value - first.value;
  const pct = first.value > 0 ? (delta / first.value) * 100 : 0;
  const improving = delta > 0;
  const sign = delta > 0 ? "+" : "";
  const pctSign = pct > 0 ? "+" : "";

  const peer = computePeerContext(county);
  const tierLabel =
    peer?.tier === "low"
      ? "smaller Michigan counties"
      : peer?.tier === "mid"
        ? "mid-size Michigan counties"
        : "larger Michigan counties";
  const peerRelative =
    peer == null
      ? null
      : pct > peer.peerAvgPct
        ? "above"
        : pct < peer.peerAvgPct
          ? "below"
          : "at";

  const chartData = series.map((p) => ({
    year: p.vintage,
    pop: p.value,
  }));

  return (
    <div className="space-y-2 mt-3" data-trend-population>
      {/* One-line summary */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          Population 2020–2024 · PEP Annual
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 gap-1 flex-shrink-0 ${
            improving
              ? "border-michigan-forest/30 text-michigan-forest-deep"
              : delta < 0
                ? "border-destructive/30 text-destructive"
                : "border-muted-foreground/30 text-muted-foreground"
          }`}
        >
          {improving ? (
            <TrendingUp className="h-2.5 w-2.5" />
          ) : delta < 0 ? (
            <TrendingDown className="h-2.5 w-2.5" />
          ) : (
            <Minus className="h-2.5 w-2.5" />
          )}
          {sign}
          {Math.abs(delta).toLocaleString()} since 2020
        </Badge>
      </div>

      {/* Sparkline */}
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis domain={["dataMin - 500", "dataMax + 500"]} hide />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                padding: "4px 8px",
              }}
              formatter={(v: number) => [v.toLocaleString(), "Population"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="pop"
              stroke={
                improving
                  ? "hsl(var(--michigan-forest))"
                  : "hsl(var(--destructive))"
              }
              strokeWidth={2}
              dot={{
                r: 2.5,
                fill: "hsl(var(--background))",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Peer comparison  -  div not p because Badge renders a div */}
      {peer && peerRelative && (
        <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-x-1">
          <span className="font-medium">
            {pctSign}
            {pct.toFixed(1)}%
          </span>
          <span>since 2020 ·</span>
          <span
            className={
              peerRelative === "above"
                ? "text-michigan-forest-deep"
                : peerRelative === "below"
                  ? "text-destructive"
                  : ""
            }
          >
            {peerRelative} peer avg ({peerSign(peer.peerAvgPct)}
            {peer.peerAvgPct.toFixed(1)}%, {tierLabel})
          </span>
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 border-amber-400/40 text-amber-700"
          >
            modeled
          </Badge>
        </div>
      )}

      {/* Source */}
      <p className="text-[10px] text-muted-foreground/70">
        Source: {source} [VERIFIED]
      </p>
    </div>
  );
}

function peerSign(v: number) {
  return v > 0 ? "+" : "";
}
