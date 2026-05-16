// Maternal and infant health data
// Sources: CDC WONDER Natality, Michigan MDHHS, Rx Kids (U-M Poverty Solutions)

export interface MaternalHealthData {
  county: string;
  fips: string;
  lowBirthweightPct: number;
  pretermBirthPct: number;
  infantMortalityRate: number;
  prenatalCareFirstTrimesterPct: number;
  teenBirthRate: number;
  rxKidsActive: boolean;
  rxKidsExpanding: boolean;
  year: number;
  source: string;
}

export const MICHIGAN_MATERNAL_HEALTH: MaternalHealthData[] = [
  { county: "Genesee", fips: "26049", lowBirthweightPct: 11.8, pretermBirthPct: 13.2, infantMortalityRate: 9.4, prenatalCareFirstTrimesterPct: 68.2, teenBirthRate: 18.4, rxKidsActive: true, rxKidsExpanding: false, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS + Rx Kids 2024" },
  { county: "Wayne", fips: "26163", lowBirthweightPct: 13.4, pretermBirthPct: 14.8, infantMortalityRate: 11.2, prenatalCareFirstTrimesterPct: 64.4, teenBirthRate: 22.1, rxKidsActive: false, rxKidsExpanding: true, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Oakland", fips: "26125", lowBirthweightPct: 7.2, pretermBirthPct: 9.4, infantMortalityRate: 4.8, prenatalCareFirstTrimesterPct: 82.4, teenBirthRate: 8.2, rxKidsActive: false, rxKidsExpanding: false, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Washtenaw", fips: "26161", lowBirthweightPct: 7.8, pretermBirthPct: 9.8, infantMortalityRate: 4.2, prenatalCareFirstTrimesterPct: 84.2, teenBirthRate: 7.4, rxKidsActive: false, rxKidsExpanding: false, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Saginaw", fips: "26145", lowBirthweightPct: 12.1, pretermBirthPct: 13.8, infantMortalityRate: 10.4, prenatalCareFirstTrimesterPct: 66.8, teenBirthRate: 20.4, rxKidsActive: false, rxKidsExpanding: false, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
  { county: "Kent", fips: "26081", lowBirthweightPct: 8.4, pretermBirthPct: 10.2, infantMortalityRate: 5.8, prenatalCareFirstTrimesterPct: 78.4, teenBirthRate: 12.4, rxKidsActive: false, rxKidsExpanding: false, year: 2023, source: "CDC WONDER Natality 2023 + MI MDHHS" },
];

export const RX_KIDS_SUMMARY = {
  programName: "Rx Kids",
  launched: "January 2024",
  location: "Flint, Michigan (Genesee County)",
  operator: "Powered by Poverty Solutions, University of Michigan",
  enrollmentRate: 93,
  prenatalPayment: 1500,
  monthlyPayment: 500,
  familiesServed: 1400,
  totalPrescribed: 5000000,
  strings: "No strings attached \u2014 unconditional cash",
  expandingTo: ["Detroit", "Other Michigan cities"],
  source: "University of Michigan Poverty Solutions 2024 Impact Report",
};

export function getMaternalHealthByCounty(county: string): MaternalHealthData | null {
  return MICHIGAN_MATERNAL_HEALTH.find(m => m.county === county) ?? null;
}
