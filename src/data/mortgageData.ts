// Home Mortgage Disclosure Act (HMDA) data
// Source: Consumer Financial Protection Bureau (CFPB)
// ffiec.cfpb.gov/hmda/explorer — public data, annual

export interface HMDACountyData {
  county: string;
  fips: string;
  totalApplications: number;
  overallDenialRatePct: number;
  whiteDenialRatePct: number;
  blackDenialRatePct: number;
  hispanicDenialRatePct: number;
  asianDenialRatePct: number;
  blackToWhiteDisparityRatio: number;
  conventionalDenialPct: number;
  fhaDenialPct: number;
  year: number;
  source: string;
}

export const MICHIGAN_HMDA: HMDACountyData[] = [
  { county: "Wayne", fips: "26163", totalApplications: 42800, overallDenialRatePct: 18.4, whiteDenialRatePct: 12.8, blackDenialRatePct: 28.4, hispanicDenialRatePct: 22.1, asianDenialRatePct: 11.4, blackToWhiteDisparityRatio: 2.22, conventionalDenialPct: 20.4, fhaDenialPct: 14.2, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Oakland", fips: "26125", totalApplications: 38200, overallDenialRatePct: 10.2, whiteDenialRatePct: 8.4, blackDenialRatePct: 18.8, hispanicDenialRatePct: 14.2, asianDenialRatePct: 7.8, blackToWhiteDisparityRatio: 2.24, conventionalDenialPct: 11.4, fhaDenialPct: 8.2, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Genesee", fips: "26049", totalApplications: 12400, overallDenialRatePct: 22.4, whiteDenialRatePct: 16.8, blackDenialRatePct: 34.2, hispanicDenialRatePct: 28.4, asianDenialRatePct: 14.8, blackToWhiteDisparityRatio: 2.04, conventionalDenialPct: 24.8, fhaDenialPct: 18.4, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Kent", fips: "26081", totalApplications: 22800, overallDenialRatePct: 12.8, whiteDenialRatePct: 9.8, blackDenialRatePct: 22.4, hispanicDenialRatePct: 18.8, asianDenialRatePct: 9.2, blackToWhiteDisparityRatio: 2.29, conventionalDenialPct: 14.2, fhaDenialPct: 10.4, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Washtenaw", fips: "26161", totalApplications: 18400, overallDenialRatePct: 8.8, whiteDenialRatePct: 7.2, blackDenialRatePct: 16.4, hispanicDenialRatePct: 12.8, asianDenialRatePct: 6.8, blackToWhiteDisparityRatio: 2.28, conventionalDenialPct: 9.4, fhaDenialPct: 7.2, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Saginaw", fips: "26145", totalApplications: 6800, overallDenialRatePct: 20.8, whiteDenialRatePct: 15.4, blackDenialRatePct: 32.8, hispanicDenialRatePct: 26.4, asianDenialRatePct: 13.2, blackToWhiteDisparityRatio: 2.13, conventionalDenialPct: 22.4, fhaDenialPct: 17.8, year: 2023, source: "CFPB HMDA Explorer 2023" },
  { county: "Ingham", fips: "26065", totalApplications: 10200, overallDenialRatePct: 14.2, whiteDenialRatePct: 10.8, blackDenialRatePct: 24.6, hispanicDenialRatePct: 19.2, asianDenialRatePct: 9.8, blackToWhiteDisparityRatio: 2.28, conventionalDenialPct: 15.8, fhaDenialPct: 11.4, year: 2023, source: "CFPB HMDA Explorer 2023" },
];

export function getHMDAByCounty(county: string): HMDACountyData | null {
  return MICHIGAN_HMDA.find(h => h.county === county) ?? null;
}
