import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { SnapMetricDef } from "@/data/snapGranularityRegistry";
import type { BenchmarkBundle } from "@/utils/foodAccess/buildBenchmarks";
import { buildCountyPoints } from "./snapCountyValues";

interface SnapSmallMultiplesProps {
  /** X-axis metric, shared across all facets. */
  xMetric: SnapMetricDef;
  /** Y-axis metrics, one per facet. Display order is top-left to
   * bottom-right, row-major. */
  yMetrics: SnapMetricDef[];
  /** When true, render state benchmark ref lines on each facet (only
   * when that facet's y-metric has a present benchmark). */
  showBenchmarks?: boolean;
  benchmarks?: Record<string, BenchmarkBundle | null>;
}

function fmtAxis(metric: SnapMetricDef, v: number): string {
  return metric.isRate
    ? v.toLocaleString(undefined, { maximumFractionDigits: 1 })
    : v.toLocaleString();
}

/**
 * Faceted scatter grid: one chart per Y-metric, all sharing the X-axis.
 * Lighter chart-chrome (smaller axes, no axis labels, no per-facet
 * tooltip frame styling) - the chrome lives in the surrounding shell
 * panel, not in each facet.
 */
export function SnapSmallMultiples({
  xMetric,
  yMetrics,
  showBenchmarks = false,
  benchmarks,
}: SnapSmallMultiplesProps) {
  const metricIds = [xMetric.id, ...yMetrics.map((m) => m.id)];
  const points = buildCountyPoints(metricIds);

  const columns = yMetrics.length <= 2 ? 2 : 3;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {yMetrics.map((yMetric) => {
        const facetData = points
          .filter(
            (p) =>
              p.values[xMetric.id] !== null && p.values[yMetric.id] !== null,
          )
          .map((p) => ({
            county: p.county,
            x: p.values[xMetric.id] as number,
            y: p.values[yMetric.id] as number,
          }));

        const yBench =
          benchmarks?.[yMetric.id]?.state.state === "present"
            ? (benchmarks?.[yMetric.id]?.state.value ?? null)
            : null;
        const xBench =
          benchmarks?.[xMetric.id]?.state.state === "present"
            ? (benchmarks?.[xMetric.id]?.state.value ?? null)
            : null;

        return (
          <figure
            key={yMetric.id}
            className="rounded-md border border-border/60 bg-card p-3"
          >
            <figcaption className="text-xs font-medium text-foreground mb-1">
              {yMetric.shortLabel}{" "}
              <span className="text-muted-foreground font-normal">
                vs {xMetric.shortLabel}
              </span>
            </figcaption>
            <div className="h-[180px] w-full">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 6, right: 6, left: 0, bottom: 6 }}>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.35}
                  />
                  <XAxis
                    type="number"
                    dataKey="x"
                    tick={{
                      fontSize: 9,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(v: number) => fmtAxis(xMetric, v)}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    tick={{
                      fontSize: 9,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(v: number) => fmtAxis(yMetric, v)}
                    width={48}
                  />
                  <ZAxis range={[24, 24]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      color: "hsl(var(--card-foreground))",
                      fontSize: 11,
                    }}
                    formatter={(value, name) => {
                      if (name === "x")
                        return [
                          `${fmtAxis(xMetric, value as number)} ${xMetric.unit}`,
                          xMetric.shortLabel,
                        ];
                      return [
                        `${fmtAxis(yMetric, value as number)} ${yMetric.unit}`,
                        yMetric.shortLabel,
                      ];
                    }}
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload as
                        | { county?: string }
                        | undefined;
                      return p?.county ?? "";
                    }}
                  />
                  {showBenchmarks && xBench !== null ? (
                    <ReferenceLine
                      x={xBench}
                      stroke="hsl(var(--color-amber))"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                  ) : null}
                  {showBenchmarks && yBench !== null ? (
                    <ReferenceLine
                      y={yBench}
                      stroke="hsl(var(--color-amber))"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                  ) : null}
                  <Scatter
                    data={facetData}
                    fill="hsl(var(--color-teal-bright))"
                    fillOpacity={0.85}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </figure>
        );
      })}
    </div>
  );
}
