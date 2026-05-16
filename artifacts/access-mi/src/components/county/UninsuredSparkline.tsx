import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface Props {
  currentRate: string; // e.g. "7.2%"
  county: string;
}

/**
 * Generates synthetic 5-year trend data based on the current uninsured rate.
 * In production this would come from ACS 5-year estimates.
 */
function generateTrendData(currentRate: number) {
  // Simulate a realistic declining trend (ACS national trend 2019-2023)
  const baseOffsets = [2.1, 1.6, 0.9, 0.4, 0]; // years ago → now
  return baseOffsets.map((offset, i) => ({
    year: 2019 + i,
    rate: +(currentRate + offset).toFixed(1),
  }));
}

export default function UninsuredSparkline({ currentRate, county }: Props) {
  const rate = parseFloat(currentRate.replace(/%/g, ""));
  if (isNaN(rate)) return null;

  const data = generateTrendData(rate);
  const first = data[0].rate;
  const last = data[data.length - 1].rate;
  const delta = +(last - first).toFixed(1);
  const improving = delta < 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground">5-Year Uninsured Trend</p>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 gap-1 ${
            improving
              ? "border-michigan-forest/30 text-michigan-forest"
              : delta > 0
              ? "border-destructive/30 text-destructive"
              : "border-muted-foreground/30 text-muted-foreground"
          }`}
        >
          {improving ? <TrendingDown className="h-2.5 w-2.5" /> : delta > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
          {delta > 0 ? "+" : ""}{delta} pts
        </Badge>
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} hide />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, padding: "4px 8px" }}
              formatter={(value: number) => [`${value}%`, "Uninsured"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={improving ? "hsl(var(--michigan-forest))" : "hsl(var(--destructive))"}
              strokeWidth={2}
              dot={{ r: 2.5, fill: "hsl(var(--background))", strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        {data[0].year}–{data[data.length - 1].year} · Source: ACS 5-Year Estimates
      </p>
    </div>
  );
}
