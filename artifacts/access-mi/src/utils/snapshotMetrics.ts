import type { SnapshotMetric } from "@/components/shared/SnapshotCard";
import {
  getCountyProfile,
  COUNTY_PROFILES,
} from "@/data/michigan-county-profiles";
import { MICHIGAN_REGIONS } from "@/data/michigan-regions";
import {
  COUNTY_TRAFFIC_FATALITIES,
  FARS_SOURCE,
  FARS_VINTAGE,
  FARS_SUPPRESSION_THRESHOLD,
} from "@/data/county-traffic-fatalities";
import {
  COUNTY_SNAP_RETAILERS,
  SNAP_SOURCE,
  SNAP_VINTAGE,
} from "@/data/county-snap-retailers";

function parseRate(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function parseRatio(val: string): number {
  return parseInt(val.split(":")[0].replace(/[^0-9]/g, ""), 10) || 0;
}

// True when the source string carries a real numeric reading. A literal
// "-" or any other non-numeric placeholder collapses to NaN here, which
// lets the snapshot tile show "Data unavailable" instead of a false
// percentile derived from parseRate / parseRatio's 0 fallback.
function isNumericValue(val: string): boolean {
  return Number.isFinite(parseFloat(val.replace(/[^0-9.]/g, "")));
}

// Rank-based percentile against the 83-county MI distribution for the
// specific metric being measured.
//
// Direction convention: HIGHER percentile = BETTER outcome. For the
// "lower-is-better" metrics on this snapshot tile (uninsured rate, food
// insecurity, primary-care ratio), a county at the LOWEST value reads as
// 100th and a county at the HIGHEST value reads as 0th. The displayed
// percentile is the share of MI counties with a strictly worse outcome
// than this one.
//
// Replaces the previous hand-tuned linear maps (min/max constants per
// metric). Those maps reused the uninsured-rate ceiling (11.5%) for food
// insecurity, whose actual MI range is roughly 10-21%, so every
// food-insecurity reading above 11.5 clamped to 0. Same defect on the
// primary-care ratio (real max ~12k vs. hardcoded 5k ceiling).
function rankPercentile(
  value: number,
  distribution: number[],
  lowerIsBetter: boolean,
): number {
  if (!Number.isFinite(value) || distribution.length === 0) return 0;
  let worseCount = 0;
  for (const v of distribution) {
    if (lowerIsBetter ? v > value : v < value) worseCount++;
  }
  return Math.round((worseCount / distribution.length) * 100);
}

// Pre-computed distributions across all 83-county profiles, once at
// module load. Each array holds the parsed numeric value for every
// county whose source string is a real reading (not "-" / "Data
// unavailable"). The "value > 0" filter mirrors what isNumericValue
// admits and what the percentile call sites would have used.
function collectDistribution(
  pick: (county: ReturnType<typeof getCountyProfile>) => number | null,
): number[] {
  const out: number[] = [];
  for (const profile of Object.values(COUNTY_PROFILES)) {
    const v = pick(profile);
    if (v !== null && Number.isFinite(v) && v > 0) out.push(v);
  }
  return out;
}

const UNINSURED_DISTRIBUTION = collectDistribution((p) => {
  const v = p.healthHighlights[0]?.value;
  return v && isNumericValue(v) ? parseRate(v) : null;
});

const PC_RATIO_DISTRIBUTION = collectDistribution((p) => {
  const v = p.healthHighlights[1]?.value;
  return v && isNumericValue(v) ? parseRatio(v) : null;
});

const FOOD_INSECURITY_DISTRIBUTION = collectDistribution((p) => {
  const v = p.healthHighlights[2]?.value;
  return v && isNumericValue(v) ? parseRate(v) : null;
});

function uninsuredPercentile(rate: number): number {
  return rankPercentile(rate, UNINSURED_DISTRIBUTION, true);
}

function ratioPercentile(ratio: number): number {
  return rankPercentile(ratio, PC_RATIO_DISTRIBUTION, true);
}

function foodInsecurityPercentile(rate: number): number {
  return rankPercentile(rate, FOOD_INSECURITY_DISTRIBUTION, true);
}

export const __TEST_ONLY__ = {
  rankPercentile,
  UNINSURED_DISTRIBUTION,
  PC_RATIO_DISTRIBUTION,
  FOOD_INSECURITY_DISTRIBUTION,
  uninsuredPercentile,
  ratioPercentile,
  foodInsecurityPercentile,
};

export function buildStateSnapshotMetrics(): SnapshotMetric[] {
  // Aggregate all county profiles
  const counties = Object.values(COUNTY_PROFILES);
  const uninsuredRates = counties.map((c) =>
    parseRate(c.healthHighlights[0]?.value || "0"),
  );
  const avgUninsured = +(
    uninsuredRates.reduce((a, b) => a + b, 0) / uninsuredRates.length
  ).toFixed(1);

  return [
    {
      id: "uninsured",
      label: "Uninsured Rate",
      value: `${avgUninsured}%`,
      percentile: 50,
      geoResolution: "county",
      source: "County Health Rankings 2025 (SAHIE 2022)",
      vintage: "SAHIE 2022",
    },
    // PENDING re-enable: insurance-coverage tile needs a primary source.
    // Previously rendered "96.0%" with an unsourced 2020-2025 trend. Removed
    // 2026-06; re-add only when wired to a verified series (SAHIE statewide or
    // ACS table B27001) with a real source + vintage. Scaffold kept here so
    // the structure is obvious when re-enabling.
    // {
    //   id: "insurance-coverage",
    //   label: "Insurance Coverage",
    //   value: <SOURCED VALUE>,
    //   unit: "%",
    //   geoResolution: "state",
    //   source: <PRIMARY SOURCE LABEL>,
    //   vintage: <VINTAGE LABEL>,
    // },
    {
      id: "life-expectancy",
      label: "Life Expectancy",
      value: "76.8",
      unit: "yrs",
      geoResolution: "state",
      source: "CDC NCHS Stats of the States",
      vintage: "2022",
    },
    {
      id: "telehealth",
      label: "Telehealth (past 4 weeks)",
      value: "19.1",
      unit: "%",
      geoResolution: "state",
      source: "CDC Household Pulse Survey",
      vintage: "Wave 48 (Aug 2022) - survey ended",
    },
  ];
}

export function buildRegionSnapshotMetrics(regionId: string): SnapshotMetric[] {
  const region = MICHIGAN_REGIONS.find((r) => r.id === regionId);
  if (!region) return [];

  let totalPop = 0;
  let sumUninsured = 0,
    sumRatio = 0,
    sumFood = 0,
    count = 0;

  region.counties.forEach((c) => {
    const p = getCountyProfile(c);
    totalPop += p.population;
    const unins = parseRate(p.healthHighlights[0]?.value || "0");
    const ratio = parseRatio(p.healthHighlights[1]?.value || "0");
    const food = parseRate(p.healthHighlights[2]?.value || "0");
    if (unins > 0) {
      sumUninsured += unins;
      sumRatio += ratio;
      sumFood += food;
      count++;
    }
  });

  if (count === 0) return [];
  const avgU = +(sumUninsured / count).toFixed(1);
  const avgR = Math.round(sumRatio / count);
  const avgF = +(sumFood / count).toFixed(1);

  return [
    {
      id: "uninsured",
      label: "Avg Uninsured Rate",
      value: `${avgU}%`,
      percentile: uninsuredPercentile(avgU),
      geoResolution: "county",
    },
    {
      id: "pc-ratio",
      label: "Primary Care Ratio",
      value: `${avgR.toLocaleString()}:1`,
      percentile: ratioPercentile(avgR),
      geoResolution: "county",
    },
    {
      id: "food-insecurity",
      label: "Food Insecurity",
      value: `${avgF}%`,
      percentile: foodInsecurityPercentile(avgF),
      geoResolution: "county",
    },
    {
      id: "population",
      label: "Population",
      value: totalPop.toLocaleString(),
      geoResolution: "county",
    },
  ];
}

export function buildCountySnapshotMetrics(county: string): SnapshotMetric[] {
  const p = getCountyProfile(county);
  const metrics: SnapshotMetric[] = [];

  const hh = p.healthHighlights;
  if (hh[0]) {
    const numeric = isNumericValue(hh[0].value);
    metrics.push({
      id: "uninsured",
      label: "Uninsured Rate",
      value: numeric ? hh[0].value : "Data unavailable",
      percentile: numeric
        ? uninsuredPercentile(parseRate(hh[0].value))
        : undefined,
      geoResolution: "county",
      countyName: county,
    });
  }
  if (hh[1]) {
    const numeric = isNumericValue(hh[1].value);
    metrics.push({
      id: "pc-ratio",
      label: "Primary Care Ratio",
      value: numeric ? hh[1].value : "Data unavailable",
      percentile: numeric
        ? ratioPercentile(parseRatio(hh[1].value))
        : undefined,
      geoResolution: "county",
      countyName: county,
    });
  }
  if (hh[2]) {
    const numeric = isNumericValue(hh[2].value);
    metrics.push({
      id: "food-insecurity",
      label: "Food Insecurity",
      value: numeric ? hh[2].value : "Data unavailable",
      percentile: numeric
        ? foodInsecurityPercentile(parseRate(hh[2].value))
        : undefined,
      geoResolution: "county",
      countyName: county,
    });
  }
  metrics.push({
    id: "population",
    label: "Population",
    value: p.population.toLocaleString(),
    geoResolution: "county",
    countyName: county,
  });

  // Traffic fatalities (NHTSA FARS, 5-year window). Counties with fewer
  // than FARS_SUPPRESSION_THRESHOLD events over the window render the raw
  // count and explicitly label the rate as suppressed, rather than
  // showing a noisy per-100k figure derived from small numerators.
  const fars = COUNTY_TRAFFIC_FATALITIES[county];
  if (fars) {
    if (fars.suppressed || fars.ratePer100k === null) {
      metrics.push({
        id: "traffic-fatalities",
        label: "Traffic Fatalities (5-yr)",
        value: `${fars.fiveYearCount}`,
        unit: "in 5 yrs (rate suppressed)",
        geoResolution: "county",
        countyName: county,
        source: FARS_SOURCE,
        vintage: `${FARS_VINTAGE} - too few events for a stable rate`,
      });
    } else {
      metrics.push({
        id: "traffic-fatalities",
        label: "Traffic Fatalities (5-yr avg)",
        value: fars.ratePer100k.toFixed(1),
        unit: "per 100k/yr",
        geoResolution: "county",
        countyName: county,
        source: FARS_SOURCE,
        vintage: `${FARS_VINTAGE} (avg of 5 case yrs)`,
      });
    }
  }

  // SNAP-authorized food retailers (USDA-FNS, current snapshot). Count of
  // currently authorized retailers per 10,000 residents. No suppression:
  // this is a count of businesses, not a rare event. Counties with zero
  // retailers render 0 rather than blank.
  const snap = COUNTY_SNAP_RETAILERS[county];
  if (snap) {
    metrics.push({
      id: "snap-retailers",
      label: "SNAP Retailers (per 10k)",
      value: snap.ratePer10k.toFixed(2),
      unit: "per 10k residents",
      geoResolution: "county",
      countyName: county,
      source: SNAP_SOURCE,
      vintage: `${SNAP_VINTAGE} (current authorizations)`,
    });
  }

  return metrics;
}

/** Re-exported for tests and methodology copy. */
export const FARS_SUPPRESSION_THRESHOLD_DISPLAY = FARS_SUPPRESSION_THRESHOLD;
