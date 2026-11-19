import { useQuery } from "@tanstack/react-query";
import { SAIPE_COUNTY_RECORDS } from "@/data/saipe-county";
import { ACS5_YEAR } from "@/config/acsVintage";
import { parseAcsEstimate, parseAcsMoe } from "@/lib/censusValue";

export interface CountyEconomicData {
  county: string;
  fips: string;
  /** Rows with no usable median income are dropped, so this is always a number. */
  medianIncome: number;
  incomeInterval: readonly (number | null)[];
  povertyInterval: readonly (number | null)[];
  povertyRate: number | null;
  unemploymentRate: number | null;
  medianHomeValue: number | null;
  medianRent: number | null;
}

const ratePct = (num: number | null, den: number | null): number | null =>
  num === null || den === null || den === 0 ? null : Math.round((num / den) * 1000) / 10;

/** Parse one Census county row (columns: NAME, B19013, B17001_002, B17001_001,
 * B23025_005, B23025_003, B25077, B25064, income MOE, state, county). Exported for tests.
 * Returns null when median income is unusable. */
export function parseCountyEconomicRow(row: string[]): CountyEconomicData | null {
  if (row[9] !== "26" || !/^\d{3}$/.test(row[10])) return null;
  const income = parseAcsEstimate(row[1]).value;
  if (income === null) return null;
  const povertyPop = parseAcsEstimate(row[2]).value;
  const povertyUniverse = parseAcsEstimate(row[3]).value;
  const unemployed = parseAcsEstimate(row[4]).value;
  const laborForce = parseAcsEstimate(row[5]).value;
  const incomeMoe = parseAcsMoe(row[8]);
  return {
    county: (row[0] || "").replace(" County, Michigan", ""),
    fips: `${row[9]}${row[10]}`,
    medianIncome: income,
    incomeInterval: incomeMoe === null ? [] : [income - incomeMoe, income + incomeMoe],
    povertyInterval: [],
    povertyRate: ratePct(povertyPop, povertyUniverse),
    unemploymentRate: ratePct(unemployed, laborForce),
    medianHomeValue: parseAcsEstimate(row[6]).value,
    medianRent: parseAcsEstimate(row[7]).value,
  };
}

const FALLBACK: CountyEconomicData[] = SAIPE_COUNTY_RECORDS.flatMap((record) => {
  if (record.status !== "populated" || record.values.medianHouseholdIncome === null) return [];
  return [{
    county: record.countyName, fips: record.countyFips,
    medianIncome: record.values.medianHouseholdIncome, povertyRate: record.values.povertyPct,
    incomeInterval: record.confidence.medianHouseholdIncome, povertyInterval: record.confidence.povertyPct,
    unemploymentRate: null, medianHomeValue: null, medianRent: null,
  }];
}).sort((a, b) => b.medianIncome - a.medianIncome);

export interface EconomicDataResult {
  counties: CountyEconomicData[];
  isFallback: boolean;
}

export const ECONOMIC_ACS_URL = `https://api.census.gov/data/${ACS5_YEAR}/acs/acs5?get=NAME,B19013_001E,B17001_002E,B17001_001E,B23025_005E,B23025_003E,B25077_001E,B25064_001E,B19013_001M&for=county:*&in=state:26`;

export function useEconomicData() {
  return useQuery<EconomicDataResult>({
    queryKey: ["census-economic-mi"],
    queryFn: async () => {
      try {
        const res = await fetch(ECONOMIC_ACS_URL);
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return { counties: FALLBACK, isFallback: true };
        }
        const data = await res.json();
        const counties = (data.slice(1) as string[][])
          .map(parseCountyEconomicRow)
          .filter((d): d is CountyEconomicData => d !== null)
          .sort((a: CountyEconomicData, b: CountyEconomicData) => b.medianIncome - a.medianIncome);
        // An empty parse is a failure, not "Michigan has no counties".
        if (counties.length === 0) return { counties: FALLBACK, isFallback: true };
        return { counties, isFallback: false };
      } catch {
        return { counties: FALLBACK, isFallback: true };
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

