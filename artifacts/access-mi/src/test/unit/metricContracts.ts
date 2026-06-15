// Plausible numeric ranges for each verified atlas metric.
// Tests in source-contracts.test.ts enforce these bounds against real data.
// Sources for range derivation noted inline.

export interface MetricContract {
  name: string;
  source_org: string;
  min: number;
  max: number;
  unit: string;
  allow_null: boolean;
}

export const METRIC_CONTRACTS: Record<string, MetricContract> = {
  // ALICE combined hardship % — United Way ALICE Michigan 2025 (2023 data)
  // State avg 41%; range observed 25-60% across MI counties
  alice_combined_hardship_pct: {
    name: "ALICE combined hardship %",
    source_org: "United Way ALICE",
    min: 10,
    max: 80,
    unit: "%",
    allow_null: false,
  },

  // Energy burden (low-income) — ACEEE LEAD Tool 2023 / DOE
  // Low-income households pay 3-17% of income on energy in MI
  energy_low_income_burden_pct: {
    name: "Low-income energy burden %",
    source_org: "ACEEE",
    min: 2,
    max: 25,
    unit: "%",
    allow_null: false,
  },

  // Food access: low-access tract % — USDA FARA 2019
  // Ranges from ~5% (suburban) to 100% (fully rural)
  food_low_access_pct: {
    name: "Low-access census tract %",
    source_org: "USDA",
    min: 0,
    max: 100,
    unit: "%",
    allow_null: false,
  },

  // Broadband: % locations covered at 25/3 Mbps — FCC BDC 2024
  // UP counties as low as ~38%; metro counties near 98%
  broadband_pct_25_3_covered: {
    name: "Broadband coverage at 25/3 Mbps %",
    source_org: "FCC",
    min: 0,
    max: 100,
    unit: "%",
    allow_null: false,
  },

  // Infant mortality rate per 1,000 live births — MDHHS Vital Stats
  // Michigan statewide: ~6.3/1K; county range 2-25; suppressed when <6 events
  infant_mortality_per_1k: {
    name: "Infant mortality rate per 1,000 births",
    source_org: "MDHHS",
    min: 2,
    max: 25,
    unit: "per 1,000",
    allow_null: true,
  },

  // NRI composite risk score — FEMA NRI 2023
  // Scores are index values 0-100 (percentile within the US)
  fema_nri_composite_risk: {
    name: "FEMA NRI composite risk score",
    source_org: "FEMA",
    min: 0,
    max: 100,
    unit: "index",
    allow_null: false,
  },
};
