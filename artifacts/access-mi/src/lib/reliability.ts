/**
 * ACS margin-of-error (MOE) reliability classification.
 *
 * Census ACS 5-year estimates carry a published margin of error at 90%
 * confidence. A large MOE relative to the estimate means the point value
 * is not a precise reading - rendering it as if precise misrepresents the
 * data. This utility is the single source of truth for the ratio math and
 * the three severity tiers, so every consumer (badges, suppression
 * wrappers, tests) agrees on the same thresholds.
 *
 * Reuses the FARS small-cell suppression precedent
 * (src/data/county-traffic-fatalities.ts: FARS_SUPPRESSION_THRESHOLD +
 * per-record `suppressed` flag, rendered via snapshotMetrics.ts by
 * flipping to a raw value + caveat copy) rather than inventing a parallel
 * suppression system.
 *
 * Tiers:
 *   reliable   - MOE-to-estimate ratio <= 0.30
 *   flagged    - ratio > 0.30 and <= 0.50: render the value with a
 *                "Low reliability" indicator
 *   suppressed - ratio > 0.50, OR estimate is zero with a nonzero MOE:
 *                do not render the point value. Render "Estimate
 *                suppressed: unreliable at this geography" with the
 *                source still attributed.
 *   unavailable - MOE is missing (null/undefined). Never treated as
 *                reliable by default - render the value with an "MOE
 *                unavailable" note.
 */

export type ReliabilityStatus =
  | "reliable"
  | "flagged"
  | "suppressed"
  | "unavailable";

export interface ReliabilityResult {
  status: ReliabilityStatus;
  /** MOE as a fraction of the estimate (e.g. 0.42 for a 42% ratio), or
   * null when the ratio cannot be computed (missing MOE, or estimate is
   * null). */
  ratio: number | null;
}

export const RELIABILITY_FLAG_THRESHOLD = 0.3;
export const RELIABILITY_SUPPRESS_THRESHOLD = 0.5;

/**
 * Classify an ACS estimate/MOE pair. `estimate` and `moe` are the raw
 * Census values (same unit - both counts, or both percentages, etc.).
 *
 * `moe == null` (missing MOE) always resolves to "unavailable", never
 * "reliable" - a missing margin of error is not evidence of precision.
 */
export function getReliability(
  estimate: number | null,
  moe: number | null,
): ReliabilityResult {
  if (moe === null || moe === undefined) {
    return { status: "unavailable", ratio: null };
  }
  if (estimate === null || estimate === undefined) {
    return { status: "unavailable", ratio: null };
  }
  if (estimate === 0) {
    // A zero estimate with a nonzero MOE means the true value could be
    // anywhere within the MOE band - the "0" is not a precise reading.
    return moe > 0
      ? { status: "suppressed", ratio: null }
      : { status: "reliable", ratio: 0 };
  }

  const ratio = Math.abs(moe / estimate);
  if (ratio > RELIABILITY_SUPPRESS_THRESHOLD) {
    return { status: "suppressed", ratio };
  }
  if (ratio > RELIABILITY_FLAG_THRESHOLD) {
    return { status: "flagged", ratio };
  }
  return { status: "reliable", ratio };
}

/** True when the figure should render its point value at all (reliable,
 * flagged, or unavailable-but-shown-with-a-note) - false only when
 * suppressed. */
export function isRenderable(result: ReliabilityResult): boolean {
  return result.status !== "suppressed";
}

/**
 * MOE for a ratio num/den where num is NOT a subset of den (Census ACS
 * General Handbook, ratio formula):
 *   MOE = (1/den) * sqrt(numMoe^2 + (num/den)^2 * denMoe^2)
 * Returns the MOE of the ratio as a fraction (multiply by 100 for points).
 * Any null input returns null: a missing margin is never treated as zero.
 */
export function ratioOnlyMoe(
  num: number | null,
  numMoe: number | null,
  den: number | null,
  denMoe: number | null,
): number | null {
  if (num === null || numMoe === null || den === null || denMoe === null) return null;
  if (den === 0) return null;
  const r = num / den;
  return Math.sqrt(numMoe ** 2 + r ** 2 * denMoe ** 2) / den;
}

/**
 * MOE for a proportion p = num/den where num is a subset of den (Census ACS
 * General Handbook, proportion formula):
 *   MOE = (1/den) * sqrt(numMoe^2 - p^2 * denMoe^2)
 * When the radicand is negative the handbook prescribes the ratio formula
 * (same expression with + in place of -), which this function falls back to.
 * Returns a fraction; null when any input is null or den is 0.
 */
export function ratioMoe(
  num: number | null,
  numMoe: number | null,
  den: number | null,
  denMoe: number | null,
): number | null {
  if (num === null || numMoe === null || den === null || denMoe === null) return null;
  if (den === 0) return null;
  const p = num / den;
  const radicand = numMoe ** 2 - p ** 2 * denMoe ** 2;
  if (radicand < 0) return ratioOnlyMoe(num, numMoe, den, denMoe);
  return Math.sqrt(radicand) / den;
}
