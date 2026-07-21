/**
 * Trend classification for AccessMI time-series.
 *
 * Mirrors pipelines/mi_state/src/mi_state/common/timeseries.py so the
 * Python data plane and the React UI use identical vocabulary and
 * thresholds. Any change here MUST be reflected there.
 *
 * Vocabulary:
 *   IMPROVING     - beyond STABLE_BAND_PCT toward the publisher's better direction
 *   STABLE        - within +/-STABLE_BAND_PCT relative change
 *   CONCERN       - beyond STABLE_BAND_PCT in the worse direction
 *   INSUFFICIENT  - fewer than MIN_VINTAGES observed points
 *
 * CONCERN never maps to red downstream. Signal without alarm.
 */

export type TrendDirection = "down_is_better" | "up_is_better" | "neutral";

export type TrendClassification =
  | "IMPROVING"
  | "STABLE"
  | "CONCERN"
  | "INSUFFICIENT";

export const STABLE_BAND_PCT = 2.0;
export const MIN_VINTAGES = 3;

export interface TrendPoint {
  vintage: number;
  value: number | null;
}

export interface TrendSummary {
  classification: TrendClassification;
  slopePerYear: number | null;
  firstVintage: number | null;
  lastVintage: number | null;
  firstValue: number | null;
  lastValue: number | null;
  firstToLastAbs: number | null;
  firstToLastPct: number | null;
}

function observed(
  points: readonly TrendPoint[],
): Array<{ vintage: number; value: number }> {
  return points
    .filter(
      (p): p is { vintage: number; value: number } =>
        p.value !== null && Number.isFinite(p.value),
    )
    .slice()
    .sort((a, b) => a.vintage - b.vintage);
}

export function classify(
  points: readonly TrendPoint[],
  direction: TrendDirection,
): TrendClassification {
  const obs = observed(points);
  if (obs.length < MIN_VINTAGES) return "INSUFFICIENT";
  const first = obs[0].value;
  const last = obs[obs.length - 1].value;
  if (first === 0) return "STABLE";
  const pct = ((last - first) / first) * 100.0;
  if (Math.abs(pct) < STABLE_BAND_PCT) return "STABLE";
  if (direction === "neutral") return "STABLE";
  const improved = direction === "down_is_better" ? pct < 0 : pct > 0;
  return improved ? "IMPROVING" : "CONCERN";
}

export function slopePerYear(points: readonly TrendPoint[]): number | null {
  const obs = observed(points);
  if (obs.length < 2) return null;
  const n = obs.length;
  const xMean = obs.reduce((s, p) => s + p.vintage, 0) / n;
  const yMean = obs.reduce((s, p) => s + p.value, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of obs) {
    num += (p.vintage - xMean) * (p.value - yMean);
    den += (p.vintage - xMean) ** 2;
  }
  return den === 0 ? null : num / den;
}

export function summarize(
  points: readonly TrendPoint[],
  direction: TrendDirection,
): TrendSummary {
  const obs = observed(points);
  const classification = classify(points, direction);
  const slope = slopePerYear(points);
  if (obs.length === 0) {
    return {
      classification,
      slopePerYear: slope,
      firstVintage: null,
      lastVintage: null,
      firstValue: null,
      lastValue: null,
      firstToLastAbs: null,
      firstToLastPct: null,
    };
  }
  const first = obs[0];
  const last = obs[obs.length - 1];
  const firstToLastAbs = last.value - first.value;
  const firstToLastPct =
    first.value === 0 ? null : (firstToLastAbs / first.value) * 100.0;
  return {
    classification,
    slopePerYear: slope,
    firstVintage: first.vintage,
    lastVintage: last.vintage,
    firstValue: first.value,
    lastValue: last.value,
    firstToLastAbs,
    firstToLastPct,
  };
}

// Token-based so trend colors match the rest of the site and follow the
// light / dark / high-contrast themes (see src/lib/chartTheme.ts).
export const TREND_COLORS: Record<TrendClassification, string> = {
  IMPROVING: "hsl(var(--forest-green))",
  STABLE: "hsl(var(--muted-foreground))",
  CONCERN: "hsl(var(--color-amber))",
  INSUFFICIENT: "hsl(var(--border))",
};

export const TREND_LABELS: Record<TrendClassification, string> = {
  IMPROVING: "Improving",
  STABLE: "Stable",
  CONCERN: "Watch",
  INSUFFICIENT: "Not enough data",
};
