/**
 * Typed accessor for United For ALICE Michigan county hardship.
 *
 * Payload: alice-county.generated.json (official 2026 data sheet, data year 2024).
 * Coverage: all 83 counties plus a statewide rollup that equals the county sums.
 *
 * ALICE classifies ACS households against a constructed Household Survival
 * Budget. Counts come from the publisher; the below-threshold flag is MODELED.
 * Race/age/household-type hardship rates are not in the county sheet and are
 * not invented here.
 */
import raw from "./alice-county.generated.json";

export interface ALICEHistoryPoint {
  year: number;
  households: number;
  povertyHouseholds: number;
  aliceHouseholds: number;
  aboveAliceHouseholds: number;
  povertyPct: number;
  alicePct: number;
  belowAliceThresholdPct: number;
  thresholdUnder65: number;
  threshold65plus: number;
  acsEstimate: string;
}

export interface ALICECountyRecord {
  countyFips: string;
  countyName: string;
  year: number;
  households: number;
  povertyHouseholds: number;
  aliceHouseholds: number;
  aboveAliceHouseholds: number;
  povertyPct: number;
  alicePct: number;
  belowAliceThresholdPct: number;
  thresholdUnder65?: number;
  threshold65plus?: number;
  acsEstimate?: string;
  value_label: "MODELED";
  source: string;
  history?: ALICEHistoryPoint[];
}

/** @deprecated Use ALICECountyRecord. Kept so existing call sites compile. */
export interface ALICECountyData {
  county: string;
  fips: string;
  totalHouseholds: number;
  belowPovertyPct: number;
  alicePct: number;
  combinedHardshipPct: number;
  /** Official under-65 ALICE income threshold, not a family Survival Budget. */
  aliceThreshold_family4: number;
  /** Official 65+ ALICE income threshold, not a single-adult Survival Budget. */
  aliceThreshold_single: number;
  acsEstimate?: string;
  year: number;
  valueLabel: "MODELED";
  source: string;
}

interface StatewideRecord extends ALICECountyRecord {
  survivalBudgetSingleAdult: number;
  survivalBudgetFamilyOfFour: number;
  federalPovertyLevelSingleAdult: number;
  federalPovertyLevelFamilyOfFour: number;
  reportRoundingNote: string;
}

interface Payload {
  provenance: {
    source_name: string;
    source_url: string;
    data_sheet_url: string;
    report_url: string;
    methodology_url: string;
    publisher: string;
    data_year: number;
    report_year: number;
    ingested_at: string;
    ingest_script: string;
    michigan_county_registry_size: number;
    value_label: "MODELED";
    notes: string;
  };
  statewide: StatewideRecord;
  counties: ALICECountyRecord[];
}

const payload = raw as Payload;

export const ALICE_COUNTY_PROVENANCE = payload.provenance;
export const ALICE_COUNTY_RECORDS: readonly ALICECountyRecord[] =
  payload.counties;
export const ALICE_STATEWIDE_RECORD: StatewideRecord = payload.statewide;

function toLegacy(row: ALICECountyRecord): ALICECountyData {
  return {
    county: row.countyName,
    fips: row.countyFips,
    totalHouseholds: row.households,
    belowPovertyPct: row.povertyPct,
    alicePct: row.alicePct,
    combinedHardshipPct: row.belowAliceThresholdPct,
    aliceThreshold_family4: row.thresholdUnder65 ?? 0,
    aliceThreshold_single: row.threshold65plus ?? 0,
    acsEstimate: row.acsEstimate,
    year: row.year,
    valueLabel: "MODELED",
    source: row.source,
  };
}

export const MICHIGAN_ALICE: ALICECountyData[] =
  payload.counties.map(toLegacy);

export const MICHIGAN_ALICE_STATEWIDE: ALICECountyData = toLegacy(
  payload.statewide,
);

const BY_FIPS = new Map<string, ALICECountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, ALICECountyRecord>(
  payload.counties.map((c) => [c.countyName.toLowerCase(), c]),
);

export function normalizeAliceCountyName(county: string): string {
  const trimmed = county.trim();
  if (!trimmed) return trimmed;
  if (/^michigan/i.test(trimmed) || /^statewide$/i.test(trimmed)) {
    return "Michigan (Statewide)";
  }
  return trimmed.replace(/\s+County$/i, "").trim();
}

export function getALICERecordByCountyName(
  county: string,
): ALICECountyRecord | null {
  const name = normalizeAliceCountyName(county);
  if (name === "Michigan (Statewide)") return payload.statewide;
  return BY_NAME.get(name.toLowerCase()) ?? null;
}

export function getALICERecordByFips(fips: string): ALICECountyRecord | null {
  if (fips === "26000") return payload.statewide;
  return BY_FIPS.get(fips) ?? null;
}

export function getALICEByCounty(county: string): ALICECountyData | null {
  const rec = getALICERecordByCountyName(county);
  return rec ? toLegacy(rec) : null;
}

export const ALICE_COUNTY_COVERAGE = payload.counties.length;

export interface ALICESurvivalBudget {
  countyType: "urban" | "rural";
  housingMonthly: number;
  foodMonthly: number;
  transportationMonthly: number;
  healthcareMonthly: number;
  childcare1ChildMonthly: number;
  techMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  topOccupations: Array<{
    title: string;
    medianHourly: number;
    annualFullTime: number;
    gapFromThreshold: number;
  }>;
  source: string;
}

/**
 * Illustrative urban/rural occupation-gap cards. Not county official.
 * Statewide Survival Budgets live on ALICE_STATEWIDE_RECORD.
 */
export const ALICE_SURVIVAL_BUDGETS: ALICESurvivalBudget[] = [
  {
    countyType: "urban",
    housingMonthly: 1240,
    foodMonthly: 580,
    transportationMonthly: 420,
    healthcareMonthly: 280,
    childcare1ChildMonthly: 1180,
    techMonthly: 85,
    totalMonthly: 3785,
    totalAnnual: 45420,
    topOccupations: [
      {
        title: "Home Health Aide",
        medianHourly: 14.2,
        annualFullTime: 29536,
        gapFromThreshold: -15884,
      },
      {
        title: "Retail Cashier",
        medianHourly: 13.8,
        annualFullTime: 28704,
        gapFromThreshold: -16716,
      },
      {
        title: "Childcare Worker",
        medianHourly: 13.4,
        annualFullTime: 27872,
        gapFromThreshold: -17548,
      },
      {
        title: "CNA",
        medianHourly: 16.4,
        annualFullTime: 34112,
        gapFromThreshold: -11308,
      },
    ],
    source:
      "Illustrative urban/rural occupation gap card. Statewide Survival Budgets: United For ALICE 2026 Report (2024 data) $29,580 single adult / $78,216 family of four.",
  },
  {
    countyType: "rural",
    housingMonthly: 820,
    foodMonthly: 520,
    transportationMonthly: 680,
    healthcareMonthly: 340,
    childcare1ChildMonthly: 840,
    techMonthly: 95,
    totalMonthly: 3295,
    totalAnnual: 39540,
    topOccupations: [
      {
        title: "Agricultural Worker",
        medianHourly: 14.8,
        annualFullTime: 30784,
        gapFromThreshold: -8756,
      },
      {
        title: "Home Health Aide",
        medianHourly: 13.6,
        annualFullTime: 28288,
        gapFromThreshold: -11252,
      },
      {
        title: "Truck Driver (local)",
        medianHourly: 21.4,
        annualFullTime: 44512,
        gapFromThreshold: 4972,
      },
    ],
    source:
      "Illustrative urban/rural occupation gap card. Statewide Survival Budgets: United For ALICE 2026 Report (2024 data) $29,580 single adult / $78,216 family of four.",
  },
];
