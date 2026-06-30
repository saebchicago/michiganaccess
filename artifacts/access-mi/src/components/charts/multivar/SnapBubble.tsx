import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { SnapMetricDef } from "@/data/snapGranularityRegistry";
import {
  ALL_REGION_LEGEND,
  buildCountyPoints,
  regionColor,
} from "./snapCountyValues";

interface SnapBubbleProps {
  xMetric: SnapMetricDef;
  yMetric: SnapMetricDef;
  /** The metric whose value drives the bubble area. */
  sizeMetric: SnapMetricDef;
  /** When true, color each bubble by Prosperity Region. Default true for
   * three-variable visualization where color contributes signal. */
  colorByRegion?: boolean;
}

function fmt(v: unknown, metric: SnapMetricDef): string {
  if (typeof v !== "number") return "-";
  const f = metric.isRate
    ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : v.toLocaleString();
  return `${f} ${metric.unit}`;
}

export function SnapBubble({
  xMetric,
  yMetric,
  sizeMetric,
  colorByRegion = true,
}: SnapBubbleProps) {
  const points = buildCountyPoints([xMetric.id, yMetric.id, sizeMetric.id])
    .filter(
      (p) =>
        p.values[xMetric.id] !== null &&
        p.values[yMetric.id] !== null &&
        p.values[sizeMetric.id] !== null,
    )
    .map((p) => ({
      county: p.county,
      x: p.values[xMetric.id] as number,
      y: p.values[yMetric.id] as number,
      z: p.values[sizeMetric.id] as number,
      regionNumber: p.regionNumber,
      regionShortName: p.regionShortName,
    }));

  // Compute sensible bubble area range so the largest county is readable
  // and the smallest isn't invisible. We use sqrt-of-z scaled to a 12-1200
  // px^2 footprint, then let recharts handle the ZAxis range mapping.
  const zMin = Math.min(...points.map((p) => p.z));
  const zMax = Math.max(...points.map((p) => p.z));

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
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
            <ZAxis
              type="number"
              dataKey="z"
              range={[40, 1100]}
              name={sizeMetric.shortLabel}
              domain={[zMin, zMax]}
            />
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
                  return [fmt(value, xMetric), xMetric.shortLabel];
                if (name === yMetric.shortLabel)
                  return [fmt(value, yMetric), yMetric.shortLabel];
                if (name === sizeMetric.shortLabel)
                  return [fmt(value, sizeMetric), sizeMetric.shortLabel];
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
            {grouped.map((g) => (
              <Scatter
                key={g.number}
                name={g.shortName}
                data={g.data}
                fill={g.color}
                fillOpacity={0.75}
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
      <p className="text-xs text-muted-foreground">
        Bubble area is proportional to <strong>{sizeMetric.shortLabel}</strong>.
      </p>
    </div>
  );
}
