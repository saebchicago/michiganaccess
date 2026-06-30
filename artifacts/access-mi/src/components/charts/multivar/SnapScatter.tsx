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
import {
  ALL_REGION_LEGEND,
  buildCountyPoints,
  regionColor,
} from "./snapCountyValues";

interface SnapScatterProps {
  xMetric: SnapMetricDef;
  yMetric: SnapMetricDef;
  /** When true, color each point by Prosperity Region. */
  colorByRegion?: boolean;
  /** Show state benchmark crosshair (one vertical + one horizontal ref line). */
  showBenchmarks?: boolean;
  xBenchmarks?: BenchmarkBundle | null;
  yBenchmarks?: BenchmarkBundle | null;
}

function formatTooltipValue(v: unknown, metric: SnapMetricDef): string {
  if (typeof v !== "number") return "-";
  const formatted = metric.isRate
    ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : v.toLocaleString();
  return `${formatted} ${metric.unit}`;
}

export function SnapScatter({
  xMetric,
  yMetric,
  colorByRegion = false,
  showBenchmarks = false,
  xBenchmarks,
  yBenchmarks,
}: SnapScatterProps) {
  const points = buildCountyPoints([xMetric.id, yMetric.id])
    .filter(
      (p) => p.values[xMetric.id] !== null && p.values[yMetric.id] !== null,
    )
    .map((p) => ({
      county: p.county,
      x: p.values[xMetric.id] as number,
      y: p.values[yMetric.id] as number,
      regionNumber: p.regionNumber,
      regionShortName: p.regionShortName,
      population: p.population,
    }));

  const grouped = colorByRegion
    ? ALL_REGION_LEGEND.map((r) => ({
        ...r,
        data: points.filter((p) => p.regionNumber === r.number),
      })).filter((g) => g.data.length > 0)
    : [
        {
          number: 0,
          shortName: "All counties",
          color: "hsl(var(--color-teal-bright))",
          data: points,
        },
      ];

  const xState =
    xBenchmarks?.state.state === "present" ? xBenchmarks.state.value : null;
  const yState =
    yBenchmarks?.state.state === "present" ? yBenchmarks.state.value : null;

  return (
    <div className="space-y-3">
      <div className="h-[440px] w-full">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 12, right: 24, left: 24, bottom: 56 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name={xMetric.shortLabel}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(v: number) =>
                xMetric.isRate
                  ? v.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : v.toLocaleString()
              }
              label={{
                value: xMetric.label,
                position: "insideBottom",
                offset: -28,
                fontSize: 11,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yMetric.shortLabel}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(v: number) =>
                yMetric.isRate
                  ? v.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : v.toLocaleString()
              }
              label={{
                value: yMetric.label,
                angle: -90,
                position: "insideLeft",
                offset: 8,
                fontSize: 11,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === xMetric.shortLabel)
                  return [
                    formatTooltipValue(value, xMetric),
                    xMetric.shortLabel,
                  ];
                if (name === yMetric.shortLabel)
                  return [
                    formatTooltipValue(value, yMetric),
                    yMetric.shortLabel,
                  ];
                return [String(value), String(name)];
              }}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as
                  | { county?: string; regionShortName?: string | null }
                  | undefined;
                if (!p) return "";
                return p.regionShortName
                  ? `${p.county} - ${p.regionShortName}`
                  : `${p.county}`;
              }}
            />
            {showBenchmarks && xState !== null ? (
              <ReferenceLine
                x={xState}
                stroke="hsl(var(--color-amber))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "MI",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(var(--color-amber))",
                }}
              />
            ) : null}
            {showBenchmarks && yState !== null ? (
              <ReferenceLine
                y={yState}
                stroke="hsl(var(--color-amber))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "MI",
                  position: "insideTopLeft",
                  fontSize: 10,
                  fill: "hsl(var(--color-amber))",
                }}
              />
            ) : null}
            {grouped.map((g) => (
              <Scatter
                key={g.number}
                name={g.shortName}
                data={g.data}
                fill={g.color}
                fillOpacity={0.85}
                stroke="hsl(var(--card))"
                strokeWidth={1}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {colorByRegion ? (
        <ul className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
          {ALL_REGION_LEGEND.map((r) => (
            <li
              key={r.number}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5"
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: r.color }}
              />
              {r.shortName}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
