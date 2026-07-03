/**
 * Opt-in classifier for the countywide trendSeries.json dataset.
 *
 * Deliberately kept out of src/data/trendSeries.ts so pages that read
 * trendSeries do not pay the classifier module cost on their render path;
 * only surfaces that actually badge trends import this file.
 */
import {
  getCountyTrends,
  isUninsuredPending,
  type CountyTrends,
  type PopulationTrend,
  type UninsuredPending,
  type UninsuredTrend,
} from "@/data/trendSeries";
import {
  summarize,
  type TrendDirection,
  type TrendPoint as ClassifierPoint,
  type TrendSummary,
} from "@/lib/trend";

/**
 * Direction of "improvement" for every metric surfaced by trendSeries.json.
 * Keep this in lockstep with pipelines/mi_state/src/mi_state/common/timeseries.py
 * MetricSpec.direction. Adding a new metric to the JSON MUST also add an entry
 * here or the classifier will treat it as neutral.
 */
export const TREND_METRIC_DIRECTION: Record<string, TrendDirection> = {
  population: "up_is_better",
  uninsuredRate: "down_is_better",
};

function pointsFromPopulation(t: PopulationTrend): ClassifierPoint[] {
  return t.series.map((p) => ({ vintage: p.vintage, value: p.value }));
}

function pointsFromUninsured(
  t: UninsuredTrend | UninsuredPending,
): ClassifierPoint[] {
  if (isUninsuredPending(t)) return [];
  return t.points.map((p) => ({ vintage: p.vintageYear, value: p.value }));
}

/**
 * Return an IMPROVING/STABLE/CONCERN/INSUFFICIENT summary for a metric on a
 * given county. Returns null if the metric is unknown or the county has no
 * observations.
 *
 * Purely client-side derivation - no changes to trendSeries.json required.
 */
export function deriveCountyTrend(
  county: string,
  metric: keyof CountyTrends,
): TrendSummary | null {
  const trends = getCountyTrends(county);
  if (!trends) return null;
  const direction = TREND_METRIC_DIRECTION[metric as string] ?? "neutral";
  let points: ClassifierPoint[];
  if (metric === "population") {
    points = pointsFromPopulation(trends.population);
  } else if (metric === "uninsuredRate") {
    points = pointsFromUninsured(trends.uninsuredRate);
  } else {
    return null;
  }
  if (points.length === 0) return null;
  return summarize(points, direction);
}
