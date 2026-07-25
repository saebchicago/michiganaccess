/**
 * Statewide benchmark figures, in ONE place.
 *
 * Before this module existed the same benchmarks were retyped per page and had
 * drifted into contradiction: CountyPage's BENCHMARKS said Michigan uninsured
 * = 5% and food insecurity = 13.3% (sourced, CHR 2025), while BriefPage prose
 * asserted "the state average of 6.2%" and "the state average (13.5%)" - the
 * 13.5 being the US figure, not Michigan's. Worse, BriefPage's branch
 * thresholds (`> 8`, `> 14`) didn't match the averages its sentences quoted,
 * so a county at 7% uninsured was described as "manageable" while sitting
 * above the claimed 6.2% average.
 *
 * Rule: pages render these values and derive their comparison branches from
 * the same number they quote. Do not retype benchmark literals in page copy.
 */

export const BENCHMARK_SOURCE =
  "County Health Rankings & Roadmaps, 2025 edition";

export interface Benchmark {
  /** Display string, e.g. "5%" or "1,240:1". */
  state: string;
  us: string;
  /** Numeric value parsed from `state`, for threshold comparisons. */
  stateValue: number;
  usValue: number;
}

export const MI_BENCHMARKS: Record<string, Benchmark> = {
  "Uninsured rate": { state: "5%", us: "8.0%", stateValue: 5, usValue: 8.0 },
  "Food insecurity": {
    state: "13.3%",
    us: "13.5%",
    stateValue: 13.3,
    usValue: 13.5,
  },
  "Primary care ratio": {
    state: "1,240:1",
    us: "1,310:1",
    stateValue: 1240,
    usValue: 1310,
  },
};
