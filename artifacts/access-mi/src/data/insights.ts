export interface InsightDataPoint {
  label: string;
  value: string;
  context: string;
}

export interface WeeklyInsight {
  week: number;  // arbitrary ordinal; rotation cycles over WEEKLY_INSIGHTS.length, not a fixed count
  text: string;
  source: string;
  href: string;
  dataPoints?: InsightDataPoint[];
  /** Counties this finding names directly (by county name, e.g. "Wayne").
   *  Omitted = statewide finding. Used for county-page cross-links. */
  counties?: string[];
}

export const WEEKLY_INSIGHTS: WeeklyInsight[] = [
  {
    week: 0,
    // Figures checked against hrsa-hpsa-county.generated.json and
    // alice-county.generated.json by src/data/__tests__/insights-claims.test.ts.
    // The earlier rural/urban claims (7x fewer PCPs, 1:3,200 vs 1:460, 42 mi,
    // 47 of 83) had no dataset or citation in the repo and were removed.
    text: "79 of Michigan's 83 counties contain at least one designated primary care Health Professional Shortage Area. Most shortage areas cover part of a county, not all of it.",
    source: "HRSA HPSA Primary Care detail file (dated 11/02/2026), county rollup by AccessMI (MODELED)",
    href: "/health-equity-atlas",
    dataPoints: [
      { label: "Counties with a primary care HPSA", value: "79 of 83", context: "designated status" },
      { label: "Counties without one", value: "4", context: "Antrim, Clinton, Livingston, Midland" },
    ],
  },
  {
    week: 1,
    text: "40% of Michigan households were below the ALICE Threshold in 2024: 13% in poverty and 26% above the poverty line but unable to afford basic costs.",
    source: "United For ALICE 2026 Report (2024 data)",
    href: "/equity",
    counties: ["Clare"],
    dataPoints: [
      { label: "Below ALICE Threshold", value: "39.7%", context: "statewide; published as 40%" },
      { label: "Survival budget", value: "$29,580", context: "single adult/yr" },
      { label: "Highest county", value: "Clare Co.", context: "55.4% below threshold" },
    ],
  },
  {
    week: 2,
    text: "Michigan set drinking water limits of 8 ppt for PFOA and 16 ppt for PFOS in August 2020. The state had identified 350 PFAS sites as of July 2026.",
    source: "EGLE / MPART (MCL page; site count published Aug 12, 2026)",
    href: "/environment",
    dataPoints: [
      { label: "MI PFOA limit", value: "8 ppt", context: "set Aug 2020" },
      { label: "MI PFOS limit", value: "16 ppt", context: "set Aug 2020" },
      { label: "PFAS sites identified", value: "350", context: "as of July 2026" },
    ],
  },
  {
    week: 5,
    text: "76 of Michigan's 83 counties contain at least one designated dental Health Professional Shortage Area. A designation can cover part of a county, a population group or a single facility.",
    source: "HRSA HPSA Dental Health detail file (dated 11/02/2026), county rollup by AccessMI (MODELED)",
    href: "/equity",
    dataPoints: [
      { label: "Counties with a dental HPSA", value: "76 of 83", context: "designated status" },
    ],
  },
  {
    week: 6,
    text: "Michigan's prison population fell from 51,554 in 2007 to 32,778, the lowest since 1991, and three-year recidivism reached 21.0%.",
    source: "Michigan Department of Corrections, July 2, 2025",
    href: "/reentry",
    dataPoints: [
      { label: "Prison population", value: "32,778", context: "lowest since 1991" },
      { label: "2007 level", value: "51,554", context: "MDOC" },
      { label: "3-year recidivism", value: "21.0%", context: "lowest on state record" },
    ],
  },
  {
    week: 12,
    text: "Rx Kids, a cash-prescription program for pregnant residents and new parents, has grown from one city in January 2024 to communities in 28 of Michigan's 83 counties.",
    source: "Rx Kids community coverage compiled by AccessMI from local announcements, mid-2026",
    href: "/early-childhood",
    counties: ["Genesee"],
    dataPoints: [
      { label: "Counties with a community", value: "28 of 83", context: "whole or part of the county" },
      { label: "Launched", value: "Jan 2024", context: "Flint, Genesee County" },
    ],
  },
  {
    week: 13,
    text: "Bicyclist deaths on Michigan roads rose 21% in 2024, to 29, and 21% again in 2025, to 35. Seat belt use reached 93.2% in 2025, the highest since 2019.",
    source: "Michigan State Police, Aug 26, 2025; Feb 10, 2026; Aug 6, 2026",
    href: "/transportation",
    dataPoints: [
      { label: "Bicyclist deaths, 2025", value: "35", context: "up 21% from 2024" },
      { label: "Bicyclist deaths, 2024", value: "29", context: "up 21% from 2023" },
      { label: "Seat belt use", value: "93.2%", context: "2025, highest since 2019" },
    ],
  },
];
