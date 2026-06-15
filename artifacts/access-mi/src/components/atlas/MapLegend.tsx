import { useMemo } from "react";
import { Link } from "react-router-dom";

interface Props {
  data: Record<string, number | null>;
  metric: string;
  unit?: string;
  colorScale?: "red-green" | "blue" | "orange";
}

export default function MapLegend({
  data,
  metric,
  unit = "%",
  colorScale = "red-green",
}: Props) {
  const { min, max, topCounties, bottomCounties, hasData } = useMemo(() => {
    const entries = (Object.entries(data) as [string, number | null][])
      .filter((e): e is [string, number] => e[1] != null && !isNaN(e[1]))
      .sort((a, b) => b[1] - a[1]);
    const values = entries.map(([_, v]) => v);
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        topCounties: [],
        bottomCounties: [],
        hasData: false,
      };
    }
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      topCounties: entries.slice(0, 5),
      bottomCounties: entries.slice(-5).reverse(),
      hasData: true,
    };
  }, [data]);

  const gradientColors =
    colorScale === "red-green"
      ? "#22c55e, #eab308, #ef4444"
      : colorScale === "blue"
        ? "#dbeafe, #3b82f6, #1e3a5f"
        : "#fff7ed, #f97316, #9a3412";

  if (!hasData) {
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-muted-foreground mb-1">{metric}</p>
        <p className="text-[9px] text-muted-foreground italic">
          Data unavailable for this layer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Gradient scale */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1">{metric}</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground tabular-nums">
            {min.toFixed(1)}
            {unit}
          </span>
          <div
            className="flex-1 h-3 rounded-full"
            style={{
              background: `linear-gradient(to right, ${gradientColors})`,
            }}
          />
          <span className="text-[9px] text-muted-foreground tabular-nums">
            {max.toFixed(1)}
            {unit}
          </span>
        </div>
      </div>

      {/* Top 5 */}
      <div>
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Highest
        </p>
        {topCounties.map(([county, val], i) => (
          <Link
            key={county}
            to={`/county/${county.toLowerCase().replace(/[\s.]+/g, "-")}`}
            className="flex items-center gap-2 py-0.5 text-[10px] hover:text-primary transition-colors"
          >
            <span className="text-muted-foreground w-4 text-right">
              {i + 1}
            </span>
            <span className="flex-1 text-foreground truncate">{county}</span>
            <span className="text-muted-foreground tabular-nums">
              {val.toFixed(1)}
              {unit}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom 5 */}
      <div>
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Lowest
        </p>
        {bottomCounties.map(([county, val]) => (
          <Link
            key={county}
            to={`/county/${county.toLowerCase().replace(/[\s.]+/g, "-")}`}
            className="flex items-center gap-2 py-0.5 text-[10px] hover:text-primary transition-colors"
          >
            <span className="w-4" />
            <span className="flex-1 text-foreground truncate">{county}</span>
            <span className="text-muted-foreground tabular-nums">
              {val.toFixed(1)}
              {unit}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
