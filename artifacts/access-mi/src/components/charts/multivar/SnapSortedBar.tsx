import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CoverageStateBadge } from "@/components/shared/CoverageStateBadge";
import type { SnapMetricDef } from "@/data/snapGranularityRegistry";
import type { BenchmarkBundle } from "@/utils/foodAccess/buildBenchmarks";
import { buildCountyPoints, regionColor } from "./snapCountyValues";

interface SnapSortedBarProps {
  metric: SnapMetricDef;
  /** When true, paint each bar by Prosperity Region color. Off by default;
   * the user toggles it on from the dashboard shell. */
  colorByRegion?: boolean;
  /** When true, render reference lines for state and visible regional
   * benchmarks. */
  showBenchmarks?: boolean;
  /** When true, render a slashed/grayed bar for any county whose coverage
   * state is not "present". */
  showGapOverlay?: boolean;
  benchmarks?: BenchmarkBundle | null;
  /** Maximum number of counties to render. Default: all 83. */
  topN?: number;
}

interface BarPoint {
  county: string;
  value: number | null;
  regionNumber: number | null;
  coverageState: string;
}

function formatValue(v: number, isRate: boolean): string {
  if (isRate) {
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return v.toLocaleString();
}

export function SnapSortedBar({
  metric,
  colorByRegion = false,
  showBenchmarks = false,
  showGapOverlay = false,
  benchmarks,
  topN,
}: SnapSortedBarProps) {
  const points = buildCountyPoints([metric.id]);

  const data: BarPoint[] = points
    .map((p) => ({
      county: p.county,
      value: p.values[metric.id],
      regionNumber: p.regionNumber,
      coverageState: p.coverageStates[metric.id],
    }))
    .filter((d) => d.value !== null || showGapOverlay)
    .sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));

  const visible = typeof topN === "number" ? data.slice(0, topN) : data;

  const stateValue =
    benchmarks?.state.state === "present" ? benchmarks.state.value : null;

  return (
    <div className="space-y-2">
      <div className="h-[420px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={visible}
            margin={{ top: 8, right: 16, left: 12, bottom: 90 }}
          >
            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="county"
              interval={0}
              angle={-58}
              textAnchor="end"
              height={84}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(v: number) =>
                metric.isRate
                  ? v.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : v.toLocaleString()
              }
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent) / 0.08)" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
              formatter={(value: number | string) => {
                if (typeof value !== "number") return ["-", metric.shortLabel];
                return [
                  `${formatValue(value, metric.isRate)} ${metric.unit}`,
                  metric.shortLabel,
                ];
              }}
            />
            {showBenchmarks && stateValue !== null ? (
              <ReferenceLine
                y={stateValue}
                stroke="hsl(var(--color-amber))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `MI (${formatValue(stateValue, metric.isRate)})`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(var(--color-amber))",
                }}
              />
            ) : null}
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {visible.map((d, i) => {
                const isMissing = d.value === null;
                const color = isMissing
                  ? "hsl(var(--muted-foreground) / 0.3)"
                  : colorByRegion
                    ? regionColor(d.regionNumber)
                    : "hsl(var(--color-teal-bright))";
                return (
                  <Cell
                    key={i}
                    fill={color}
                    stroke={isMissing ? "hsl(var(--muted-foreground))" : "none"}
                    strokeWidth={isMissing ? 1 : 0}
                    strokeDasharray={isMissing ? "3 2" : undefined}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {showGapOverlay ? (
        <div className="flex items-center gap-3 px-2 text-xs text-muted-foreground">
          <CoverageStateBadge state="present" />
          <CoverageStateBadge state="not-ingested" />
          <span>Counties without a value render as a slashed/grayed bar.</span>
        </div>
      ) : null}
    </div>
  );
}
