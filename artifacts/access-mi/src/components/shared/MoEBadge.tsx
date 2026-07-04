/**
 * MoEBadge - Shows a data quality warning when the MOE-to-estimate ratio
 * exceeds the "flagged" reliability threshold (see src/lib/reliability.ts,
 * the single source of truth for the ratio math and thresholds - this
 * badge renders the "flagged" tier; the ReliableValue wrapper in the same
 * lib directory handles the "suppressed" tier by hiding the value).
 */
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getReliability } from "@/lib/reliability";

interface MoEBadgeProps {
  estimate: number | null;
  moe: number | null;
  className?: string;
}

/** Returns MoE as a percentage of the estimate, or null if insufficient data.
 * @deprecated use getReliability from @/lib/reliability, which also
 * distinguishes "unavailable" (missing MOE) from "reliable" (present and
 * low). Kept for existing call sites during migration. */
export function getMoEPercent(estimate: number | null, moe: number | null): number | null {
  if (estimate === null || moe === null || estimate === 0) return null;
  return Math.abs(moe / estimate) * 100;
}

export default function MoEBadge({ estimate, moe, className = "" }: MoEBadgeProps) {
  const { status, ratio } = getReliability(estimate, moe);
  if (status !== "flagged" && status !== "suppressed") return null;
  const pct = ratio !== null ? ratio * 100 : null;

  const level = status === "suppressed" ? "Unreliable" : "High Margin of Error";
  const color =
    status === "suppressed"
      ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
      : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold cursor-help ${color} ${className}`}
          >
            <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
            {level}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs">
          <p className="font-medium mb-1">
            {pct !== null ? `Margin of Error: ±${Math.round(pct)}%` : "Margin of Error unavailable"}
          </p>
          <p className="text-muted-foreground">
            {status === "suppressed"
              ? "This estimate is statistically unreliable due to small sample size. Use with extreme caution."
              : "This estimate has a high margin of error (>30%). Consider county-level data for more reliable figures."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
