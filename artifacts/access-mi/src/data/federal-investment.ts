/**
 * Federal investment data by county — SBA business loans, SBA disaster loans,
 * and estimated FEMA assistance.
 * Sources: SBA FOIA loan data, FEMA OpenFEMA disaster declarations.
 * Values are illustrative estimates compiled from public data.
 */

export interface FederalInvestment {
  county: string;
  sbaBusinessLoans: number;
  sbaDisasterLoans: number;
  femaAssistance: number;
  totalFederal: number;
  perCapita: number;
  population: number;
}

// Average FEMA assistance per disaster declaration (estimated from OpenFEMA)
const AVG_FEMA_PER_DECLARATION = 8_500_000;

interface RawCounty {
  county: string;
  population: number;
  sbaBusinessLoans: number;
  sbaDisasterLoans: number;
  disasterCount: number;
}

const RAW: RawCounty[] = [
  { county: "Wayne",       population: 1_793_561, sbaBusinessLoans: 574_000_000, sbaDisasterLoans: 148_000_000, disasterCount: 25 },
  { county: "Oakland",     population: 1_274_395, sbaBusinessLoans: 739_000_000, sbaDisasterLoans: 92_000_000,  disasterCount: 20 },
  { county: "Macomb",      population: 881_217,   sbaBusinessLoans: 361_000_000, sbaDisasterLoans: 78_000_000,  disasterCount: 19 },
  { county: "Kent",        population: 657_974,   sbaBusinessLoans: 322_000_000, sbaDisasterLoans: 54_000_000,  disasterCount: 16 },
  { county: "Genesee",     population: 406_892,   sbaBusinessLoans: 114_000_000, sbaDisasterLoans: 62_000_000,  disasterCount: 22 },
  { county: "Washtenaw",   population: 372_258,   sbaBusinessLoans: 231_000_000, sbaDisasterLoans: 28_000_000,  disasterCount: 12 },
  { county: "Ingham",      population: 284_900,   sbaBusinessLoans: 111_000_000, sbaDisasterLoans: 32_000_000,  disasterCount: 14 },
  { county: "Ottawa",      population: 296_200,   sbaBusinessLoans: 151_000_000, sbaDisasterLoans: 18_000_000,  disasterCount: 10 },
  { county: "Kalamazoo",   population: 265_066,   sbaBusinessLoans: 98_000_000,  sbaDisasterLoans: 24_000_000,  disasterCount: 13 },
  { county: "Saginaw",     population: 190_539,   sbaBusinessLoans: 49_500_000,  sbaDisasterLoans: 38_000_000,  disasterCount: 18 },
  { county: "Muskegon",    population: 175_824,   sbaBusinessLoans: 42_200_000,  sbaDisasterLoans: 21_000_000,  disasterCount: 14 },
  { county: "Berrien",     population: 154_316,   sbaBusinessLoans: 44_700_000,  sbaDisasterLoans: 16_000_000,  disasterCount: 12 },
  { county: "Grand Traverse", population: 99_478, sbaBusinessLoans: 43_800_000,  sbaDisasterLoans: 8_200_000,   disasterCount: 8 },
  { county: "Livingston",  population: 193_866,   sbaBusinessLoans: 102_700_000, sbaDisasterLoans: 12_400_000,  disasterCount: 10 },
  { county: "Midland",     population: 83_156,    sbaBusinessLoans: 33_200_000,  sbaDisasterLoans: 19_500_000,  disasterCount: 15 },
];

function buildInvestment(raw: RawCounty): FederalInvestment {
  const femaAssistance = raw.disasterCount * AVG_FEMA_PER_DECLARATION;
  const totalFederal = raw.sbaBusinessLoans + raw.sbaDisasterLoans + femaAssistance;
  const perCapita = Math.round(totalFederal / raw.population);
  return {
    county: raw.county,
    sbaBusinessLoans: raw.sbaBusinessLoans,
    sbaDisasterLoans: raw.sbaDisasterLoans,
    femaAssistance,
    totalFederal,
    perCapita,
    population: raw.population,
  };
}

export const FEDERAL_INVESTMENTS: FederalInvestment[] = RAW.map(buildInvestment);

export const TOTAL_FEDERAL_INVESTMENT = FEDERAL_INVESTMENTS.reduce((s, c) => s + c.totalFederal, 0);

export function getFederalInvestment(county: string): FederalInvestment | undefined {
  return FEDERAL_INVESTMENTS.find(
    (c) => c.county.toLowerCase() === county.toLowerCase(),
  );
}
