import { ArrowUp, ArrowDown, Minus } from "lucide-react";

/**
 * Standardised comparative-metric pill.
 *
 * Renders a scannable pill with:
 *  • Green bg for positive civic outcomes
 *  • Red/amber bg for negative outcomes
 *  • Neutral muted bg when within ±2 % of benchmark
 *  • Directional arrow icon (↑ / ↓)
 *  • Tabular-nums for aligned digits
 *
 * @param value        The local value (ZIP / county)
 * @param benchmark    The comparison baseline (county avg, state avg)
 * @param higherIsBetter  true → higher value = green; false → lower = green
 * @param label        Short label shown after "vs" (e.g. "County", "MI Avg")
 * @param showAbsolute Optional — show the absolute diff instead of %
 * @param precision    Decimal places for the diff (default 1)
 */
export interface DeltaChipProps {
  value: number | null;
  benchmark: number;
  higherIsBetter: boolean;
  label: string;
  showAbsolute?: boolean;
  precision?: number;
}

export default function DeltaChip({
  value,
  benchmark,
  higherIsBetter,
  label,
  showAbsolute = false,
  precision = 1,
}: DeltaChipProps) {
  if (value === null || benchmark === 0) return null;

  const diff = value - benchmark;
  const isBetter = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = Math.abs(diff) < benchmark * 0.02;

  const formatted = showAbsolute
    ? `${diff > 0 ? "+" : ""}${diff.toFixed(precision)}`
    : `${diff > 0 ? "+" : ""}${((diff / benchmark) * 100).toFixed(precision)}%`;

  /* ── Semantic colour mapping ────────────────────────── */
  const pillClasses = isNeutral
    ? "text-muted-foreground bg-muted"
    : isBetter
    ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";

  const Icon = isNeutral ? Minus : isBetter ? ArrowUp : ArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium leading-tight px-2 py-0.5 rounded-full whitespace-normal ${pillClasses}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="tabular-nums">{formatted}</span>
      <span className="opacity-75">vs {label}</span>
    </span>
  );
}
