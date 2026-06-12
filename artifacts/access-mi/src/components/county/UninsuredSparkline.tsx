import { TrendingDown, TrendingUp, Minus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCountyTrends, isUninsuredPending } from "@/data/trendSeries";

interface Props {
  county: string;
  // Legacy prop kept for callers that still pass it  -  not used for data
  currentRate?: string;
}

export default function UninsuredSparkline({ county }: Props) {
  const trends = getCountyTrends(county);
  if (!trends) return null;

  const u = trends.uninsuredRate;

  if (isUninsuredPending(u)) {
    return (
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">
          Uninsured Rate Trend
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>
            Trend data from ACS 5-year estimates will appear after the next CI
            refresh with a Census API key.
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/70">
          Source: {u.source} [VERIFIED]
        </p>
      </div>
    );
  }

  // Two-point display  -  NOT a continuous time series
  const [p1, p2] = u.points;
  const delta = +(p2.value - p1.value).toFixed(1);
  const improving = delta < 0;
  const sign = delta > 0 ? "+" : "";

  return (
    <div className="space-y-2" data-trend-uninsured>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          Uninsured Rate  -  Vintage Comparison
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 gap-1 flex-shrink-0 ${
            improving
              ? "border-michigan-forest/30 text-michigan-forest"
              : delta > 0
                ? "border-destructive/30 text-destructive"
                : "border-muted-foreground/30 text-muted-foreground"
          }`}
        >
          {improving ? (
            <TrendingDown className="h-2.5 w-2.5" />
          ) : delta > 0 ? (
            <TrendingUp className="h-2.5 w-2.5" />
          ) : (
            <Minus className="h-2.5 w-2.5" />
          )}
          {sign}
          {delta}pp
        </Badge>
      </div>

      {/* Two-point dumbbell  -  reference line styled as comparison, not trend */}
      <div className="flex items-center gap-2">
        {/* Point 1 */}
        <div className="flex flex-col items-center min-w-[56px]">
          <span className="text-base font-bold text-foreground leading-none">
            {p1.value}%
          </span>
          <span className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">
            {p1.vintageLabel}
          </span>
        </div>

        {/* Connecting reference line with arrow */}
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <div
            className={`h-px flex-1 border-t border-dashed ${
              improving ? "border-michigan-forest/40" : "border-destructive/40"
            }`}
          />
          <span
            className={`text-[10px] font-semibold flex-shrink-0 ${
              improving
                ? "text-michigan-forest"
                : delta > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {sign}
            {delta}pp
          </span>
          <div
            className={`h-px flex-1 border-t border-dashed ${
              improving ? "border-michigan-forest/40" : "border-destructive/40"
            }`}
          />
        </div>

        {/* Point 2 */}
        <div className="flex flex-col items-center min-w-[56px]">
          <span className="text-base font-bold text-foreground leading-none">
            {p2.value}%
          </span>
          <span className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">
            {p2.vintageLabel}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Source: {u.source} [VERIFIED] ·{" "}
        <span className="italic">
          Non-overlapping ACS 5-yr windows ({u.overlapGapYears}-yr gap)
        </span>
      </p>
    </div>
  );
}
