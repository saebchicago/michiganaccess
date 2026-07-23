// Maternal and infant health data
// Sources: CDC WONDER Natality, Michigan MDHHS
// Rx Kids coverage and outcomes moved to src/data/rx-kids.ts, which is the
// single source of truth for that program (see RxKidsCallout.tsx).

export interface MaternalHealthData {
  county: string;
  fips: string;
  lowBirthweightPct: number;
  pretermBirthPct: number;
  infantMortalityRate: number;
  prenatalCareFirstTrimesterPct: number;
  teenBirthRate: number;
  year: number;
  source: string;
}

export const MICHIGAN_MATERNAL_HEALTH: MaternalHealthData[] = [
  { county: "Genesee", fips: "26049", lowBirthweightPct: 11.8, pretermBirthPct: 13.2, infantMortalityRate: 9.4, prenatalCareFirstTrimesterPct: 68.2, teenBirthRate: 18.4, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Wayne", fips: "26163", lowBirthweightPct: 13.4, pretermBirthPct: 14.8, infantMortalityRate: 11.2, prenatalCareFirstTrimesterPct: 64.4, teenBirthRate: 22.1, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Oakland", fips: "26125", lowBirthweightPct: 7.2, pretermBirthPct: 9.4, infantMortalityRate: 4.8, prenatalCareFirstTrimesterPct: 82.4, teenBirthRate: 8.2, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Washtenaw", fips: "26161", lowBirthweightPct: 7.8, pretermBirthPct: 9.8, infantMortalityRate: 4.2, prenatalCareFirstTrimesterPct: 84.2, teenBirthRate: 7.4, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Saginaw", fips: "26145", lowBirthweightPct: 12.1, pretermBirthPct: 13.8, infantMortalityRate: 10.4, prenatalCareFirstTrimesterPct: 66.8, teenBirthRate: 20.4, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Kent", fips: "26081", lowBirthweightPct: 8.4, pretermBirthPct: 10.2, infantMortalityRate: 5.8, prenatalCareFirstTrimesterPct: 78.4, teenBirthRate: 12.4, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
];

export function getMaternalHealthByCounty(county: string): MaternalHealthData | null {
  return MICHIGAN_MATERNAL_HEALTH.find(m => m.county === county) ?? null;
}
