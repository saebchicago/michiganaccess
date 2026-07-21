import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TREND_COLORS,
  type TrendClassification,
  type TrendDirection,
  type TrendPoint,
  classify,
} from "@/lib/trend";

export interface TrendChartProps {
  data: readonly TrendPoint[];
  direction: TrendDirection;
  unit?: string;
  height?: number;
  classification?: TrendClassification;
  overrideColor?: string;
  ariaLabel?: string;
}

function formatValue(value: number, unit: string): string {
  const display = Number.isInteger(value)
    ? value.toLocaleString()
    : value.toFixed(1);
  return unit ? `${display}${unit}` : display;
}

export function TrendChart({
  data,
  direction,
  unit = "",
  height = 100,
  classification,
  overrideColor,
  ariaLabel,
}: TrendChartProps) {
  const label = classification ?? classify(data, direction);
  const color = overrideColor ?? TREND_COLORS[label];
  const gradientId = `trend-grad-${label}-${color.replace(/[^\w]/g, "")}`;

  return (
    <div aria-label={ariaLabel} role={ariaLabel ? "img" : undefined}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data as TrendPoint[]}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="vintage"
            tick={{ fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip
            formatter={(v: number) => [formatValue(v, unit), "Value"]}
            labelFormatter={(v: number) => `Year ${v}`}
            contentStyle={{
              borderRadius: 8,
              fontSize: 11,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
