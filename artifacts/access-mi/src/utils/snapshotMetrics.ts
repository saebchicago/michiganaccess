import type { SnapshotMetric } from "@/components/shared/SnapshotCard";
import {
  getCountyProfile,
  COUNTY_PROFILES,
} from "@/data/michigan-county-profiles";
import { MICHIGAN_REGIONS } from "@/data/michigan-regions";

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

/** Percentile: lower uninsured = better, so invert. For ratio, lower = better */
function uninsuredPercentile(rate: number): number {
  // MI range roughly 3.9–11.2%. Map to 0–100 where lower = higher percentile
  const min = 3.5,
    max = 11.5;
  return Math.round(
    Math.max(0, Math.min(100, ((max - rate) / (max - min)) * 100)),
  );
}

function ratioPercentile(ratio: number): number {
  // MI range roughly 620–9330. Lower = better
  const min = 600,
    max = 5000;
  return Math.round(
    Math.max(0, Math.min(100, ((max - ratio) / (max - min)) * 100)),
  );
}

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
    },
    {
      id: "insurance-coverage",
      label: "Insurance Coverage",
      value: "96.0",
      unit: "%",
      trend: [93.2, 93.8, 94.5, 95.1, 95.6, 96.0],
      years: [2020, 2021, 2022, 2023, 2024, 2025],
    },
    {
      id: "life-expectancy",
      label: "Life Expectancy",
      value: "77.4",
      unit: "yrs",
    },
    {
      id: "telehealth",
      label: "Telehealth Adoption",
      value: "48",
      unit: "%",
      trend: [12, 38, 32, 35, 42, 48],
      years: [2020, 2021, 2022, 2023, 2024, 2025],
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
    },
    {
      id: "pc-ratio",
      label: "Primary Care Ratio",
      value: `${avgR.toLocaleString()}:1`,
      percentile: ratioPercentile(avgR),
    },
    {
      id: "food-insecurity",
      label: "Food Insecurity",
      value: `${avgF}%`,
      percentile: uninsuredPercentile(avgF),
    },
    {
      id: "population",
      label: "Population",
      value: totalPop.toLocaleString(),
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
    });
  }
  if (hh[2]) {
    const numeric = isNumericValue(hh[2].value);
    metrics.push({
      id: "food-insecurity",
      label: "Food Insecurity",
      value: numeric ? hh[2].value : "Data unavailable",
      percentile: numeric
        ? uninsuredPercentile(parseRate(hh[2].value))
        : undefined,
    });
  }
  metrics.push({
    id: "population",
    label: "Population",
    value: p.population.toLocaleString(),
  });

  return metrics;
}
