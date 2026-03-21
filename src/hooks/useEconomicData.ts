import { useQuery } from "@tanstack/react-query";

export interface CountyEconomicData {
  county: string;
  fips: string;
  medianIncome: number;
  povertyRate: number;
  unemploymentRate: number;
  medianHomeValue: number;
  medianRent: number;
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

export function useEconomicData() {
  return useQuery<CountyEconomicData[]>({
    queryKey: ["census-economic-mi"],
    queryFn: async () => {
      try {
        const url = "https://api.census.gov/data/2023/acs/acs5?get=NAME,B19013_001E,B17001_002E,B01003_001E,B23025_005E,B23025_003E,B25077_001E,B25064_001E&for=county:*&in=state:26";
        const res = await fetch(url);
        if (!res.ok) return FALLBACK;
        const data = await res.json();
        return data
          .slice(1)
          .map((row: string[]) => {
            const totalPop = parseInt(row[3]) || 1;
            const povertyPop = parseInt(row[2]) || 0;
            const unemployed = parseInt(row[4]) || 0;
            const laborForce = parseInt(row[5]) || 1;
            return {
              county: (row[0] || "").replace(" County, Michigan", ""),
              fips: `26${row[8]}`,
              medianIncome: parseInt(row[1]) || 0,
              povertyRate: Math.round((povertyPop / totalPop) * 1000) / 10,
              unemploymentRate: Math.round((unemployed / laborForce) * 1000) / 10,
              medianHomeValue: parseInt(row[6]) || 0,
              medianRent: parseInt(row[7]) || 0,
            };
          })
          .filter((d: CountyEconomicData) => d.medianIncome > 0)
          .sort((a: CountyEconomicData, b: CountyEconomicData) => b.medianIncome - a.medianIncome);
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
