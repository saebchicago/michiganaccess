import { useQuery } from "@tanstack/react-query";
import { ACS5_YEAR } from "@/config/acsVintage";
import { parseAcsEstimate } from "@/lib/censusValue";

export interface CountyEconomicData {
  county: string;
  fips: string;
  /** Rows with no usable median income are dropped, so this is always a number. */
  medianIncome: number;
  /** Null when Census returned a sentinel or blank for the figure, its numerator or its denominator. */
  povertyRate: number | null;
  unemploymentRate: number | null;
  medianHomeValue: number | null;
  medianRent: number | null;
}

const ratePct = (num: number | null, den: number | null): number | null =>
  num === null || den === null || den === 0 ? null : Math.round((num / den) * 1000) / 10;

/** Parse one Census county row (columns: NAME, B19013, B17001_002, B01003,
 * B23025_005, B23025_003, B25077, B25064, state, county). Exported for tests.
 * Returns null when median income is unusable. */
export function parseCountyEconomicRow(row: string[]): CountyEconomicData | null {
  const income = parseAcsEstimate(row[1]).value;
  if (income === null || income <= 0) return null;
  const povertyPop = parseAcsEstimate(row[2]).value;
  const totalPop = parseAcsEstimate(row[3]).value;
  const unemployed = parseAcsEstimate(row[4]).value;
  const laborForce = parseAcsEstimate(row[5]).value;
  return {
    county: (row[0] || "").replace(" County, Michigan", ""),
    // Columns 8 and 9 are the state and county codes the API appends.
    fips: `${row[8]}${row[9]}`,
    medianIncome: income,
    povertyRate: ratePct(povertyPop, totalPop),
    unemploymentRate: ratePct(unemployed, laborForce),
    medianHomeValue: parseAcsEstimate(row[6]).value,
    medianRent: parseAcsEstimate(row[7]).value,
  };
}

const FALLBACK: CountyEconomicData[] = [
  { county: "Wayne", fips: "26163", medianIncome: 36433, povertyRate: 25.4, unemploymentRate: 8.2, medianHomeValue: 78200, medianRent: 892 },
  { county: "Oakland", fips: "26125", medianIncome: 82414, povertyRate: 8.1, unemploymentRate: 3.8, medianHomeValue: 268400, medianRent: 1182 },
  { county: "Macomb", fips: "26099", medianIncome: 62186, povertyRate: 10.8, unemploymentRate: 4.9, medianHomeValue: 188600, medianRent: 1005 },
  { county: "Kent", fips: "26081", medianIncome: 65821, povertyRate: 11.2, unemploymentRate: 4.1, medianHomeValue: 228500, medianRent: 1028 },
  { county: "Genesee", fips: "26049", medianIncome: 44721, povertyRate: 20.6, unemploymentRate: 7.1, medianHomeValue: 102300, medianRent: 812 },
  { county: "Washtenaw", fips: "26161", medianIncome: 77585, povertyRate: 13.2, unemploymentRate: 3.4, medianHomeValue: 302100, medianRent: 1245 },
  { county: "Ingham", fips: "26065", medianIncome: 54813, povertyRate: 18.1, unemploymentRate: 4.8, medianHomeValue: 162400, medianRent: 945 },
  { county: "Kalamazoo", fips: "26077", medianIncome: 56244, povertyRate: 15.4, unemploymentRate: 4.5, medianHomeValue: 175800, medianRent: 918 },
  { county: "Saginaw", fips: "26145", medianIncome: 44156, povertyRate: 19.8, unemploymentRate: 6.8, medianHomeValue: 92100, medianRent: 755 },
  { county: "Ottawa", fips: "26139", medianIncome: 75412, povertyRate: 6.8, unemploymentRate: 3.2, medianHomeValue: 258200, medianRent: 1065 },
  { county: "Muskegon", fips: "26121", medianIncome: 47823, povertyRate: 17.2, unemploymentRate: 6.1, medianHomeValue: 128500, medianRent: 815 },
  { county: "Berrien", fips: "26021", medianIncome: 48126, povertyRate: 16.5, unemploymentRate: 5.8, medianHomeValue: 142300, medianRent: 802 },
  { county: "Livingston", fips: "26093", medianIncome: 88612, povertyRate: 4.8, unemploymentRate: 2.9, medianHomeValue: 278600, medianRent: 1125 },
  { county: "Monroe", fips: "26115", medianIncome: 62458, povertyRate: 10.2, unemploymentRate: 4.6, medianHomeValue: 185400, medianRent: 895 },
  { county: "Jackson", fips: "26075", medianIncome: 51234, povertyRate: 14.8, unemploymentRate: 5.4, medianHomeValue: 138200, medianRent: 835 },
  { county: "Calhoun", fips: "26025", medianIncome: 46891, povertyRate: 17.8, unemploymentRate: 6.2, medianHomeValue: 118400, medianRent: 778 },
  { county: "Bay", fips: "26017", medianIncome: 48562, povertyRate: 15.6, unemploymentRate: 5.9, medianHomeValue: 112800, medianRent: 725 },
  { county: "Grand Traverse", fips: "26055", medianIncome: 63241, povertyRate: 9.4, unemploymentRate: 3.8, medianHomeValue: 268900, medianRent: 1085 },
  { county: "Marquette", fips: "26103", medianIncome: 49856, povertyRate: 16.2, unemploymentRate: 5.1, medianHomeValue: 168200, medianRent: 785 },
  { county: "Lake", fips: "26085", medianIncome: 32145, povertyRate: 28.6, unemploymentRate: 11.2, medianHomeValue: 78500, medianRent: 625 },
];

export interface EconomicDataResult {
  counties: CountyEconomicData[];
  /**
   * True when the live Census ACS call failed and the 20-county static
   * snapshot below is being served instead. Consumers must label this in
   * the UI - previously the fallback rendered as if it were live data.
   */
  isFallback: boolean;
}

export function useEconomicData() {
  return useQuery<EconomicDataResult>({
    queryKey: ["census-economic-mi"],
    queryFn: async () => {
      try {
        const url = `https://api.census.gov/data/${ACS5_YEAR}/acs/acs5?get=NAME,B19013_001E,B17001_002E,B01003_001E,B23025_005E,B23025_003E,B25077_001E,B25064_001E&for=county:*&in=state:26`;
        const res = await fetch(url);
        if (!res.ok) return { counties: FALLBACK, isFallback: true };
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

