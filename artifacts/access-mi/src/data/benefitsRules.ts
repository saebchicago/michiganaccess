/**
 * Sourced single source of truth for benefits-program eligibility rules.
 *
 * Every threshold here carries an effective year and a primary-source
 * URL. Nothing else in the codebase should hardcode a percent-of-FPL
 * multiplier or a benefits dollar amount.
 *
 * The screener treats all thresholds as PRELIMINARY ESTIMATES. The
 * actual determination is always made by the program (MI Bridges or
 * the federal agency). UI surfaces the language "may qualify"; never
 * "you qualify".
 */

/**
 * 2026 HHS Federal Poverty Guidelines, 48 contiguous states + DC.
 *
 * Source: HHS ASPE poverty guidelines, effective January 2026.
 * URL: https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 *
 * Households with more than 8 persons add FPL_INCREMENT per person.
 */
export const FPL_2026_ANNUAL: Record<number, number> = {
  1: 15960,
  2: 21640,
  3: 27320,
  4: 33000,
  5: 38680,
  6: 44360,
  7: 50040,
  8: 55720,
};

export const FPL_INCREMENT = 5680;

export const FPL_EFFECTIVE_YEAR = 2026;
export const FPL_SOURCE_URL =
  "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines";
export const FPL_SOURCE_NAME = "HHS ASPE 2026 Poverty Guidelines";

/**
 * Returns the annual FPL for a given household size, computed from the
 * verified table for sizes 1-8 and extrapolated linearly for larger
 * households per the HHS rule ("for households with more than 8
 * persons, add $5,680 for each additional person").
 */
export function fplAnnual(householdSize: number): number {
  if (householdSize < 1) return FPL_2026_ANNUAL[1];
  if (householdSize <= 8) return FPL_2026_ANNUAL[householdSize];
  return FPL_2026_ANNUAL[8] + (householdSize - 8) * FPL_INCREMENT;
}

/** Monthly FPL (annual / 12). */
export function fplMonthly(householdSize: number): number {
  return fplAnnual(householdSize) / 12;
}

/**
 * Threshold expressed as a multiplier of FPL. Annual income at the
 * given multiplier for a given household size.
 */
export function thresholdAtFplMultiplier(
  householdSize: number,
  multiplier: number,
): number {
  return Math.round(fplAnnual(householdSize) * multiplier);
}

export type Provenance = "VERIFIED" | "MODELED" | "PROJECTED";

export type ApplicantCondition =
  | "pregnant"
  | "child_under_19"
  | "child_under_5"
  | "age_65_plus"
  | "disability"
  | "medicare_enrolled";

/**
 * One program rule. Thresholds are expressed as a multiplier of FPL
 * (the screener computes the absolute number against fplAnnual at
 * runtime). Absolute-dollar limits like asset tests or maximum
 * allotments are intentionally NOT stored here; the screener does not
 * evaluate them. Display them only with explicit owner confirmation.
 */
export interface BenefitsProgram {
  id: string;
  name: string;
  /** Plain-language one-liner used on the screener result card. */
  summary: string;
  /** Income test expressed as a multiplier of HHS poverty guidelines. */
  fplMultiplier: number;
  /** Human label for the income test, e.g. "138% FPL (MAGI)". */
  ruleLabel: string;
  /** Eligibility predicates layered on top of the income test. */
  requiredAny?: ApplicantCondition[];
  /** Effective year of the rule we are citing. */
  effectiveYear: number;
  /** Primary-source URL. */
  sourceUrl: string;
  /** Source title shown in the citation. */
  sourceName: string;
  provenance: Provenance;
  /** Where in this app to learn more (optional). */
  learnMoreHref?: string;
}

/**
 * MI Bridges is the only official Michigan portal for applying to
 * SNAP, Medicaid / Healthy Michigan Plan, State Emergency Relief, and
 * other MDHHS programs. Lookalike domains (mibridges.net / .info /
 * .live / .me) are NOT official and must never be linked. The
 * canonical URL below is the only one allowed in this codebase.
 */
export const OFFICIAL_MI_BRIDGES_URL = "https://newmibridges.michigan.gov";

/** SSA online benefits portal (Medicare / SSI). */
export const OFFICIAL_SSA_URL = "https://www.ssa.gov/benefits";

/** Michigan WIC enrollment portal. */
export const OFFICIAL_WIC_URL =
  "https://www.michigan.gov/mdhhs/assistance-programs/wic";

/** Federal CMS Medicare savings programs page. */
export const OFFICIAL_MSP_URL =
  "https://www.medicare.gov/basics/costs/help/medicare-savings-programs";

/**
 * Federal Reserve Bank of Atlanta CLIFF Dashboard. The Phase 4 "Will a
 * raise help?" explainer links here for the actual cliff modelling.
 */
export const ATLANTA_FED_CLIFF_URL =
  "https://www.atlantafed.org/economic-mobility-and-resilience/advancing-careers-for-low-income-families/cliff-tool";

export const ATLANTA_FED_POLICY_RULES_URL =
  "https://www.atlantafed.org/economic-mobility-and-resilience/advancing-careers-for-low-income-families/policy-rules-database";

/**
 * Programs the screener evaluates. Income tests are percent-of-FPL
 * only; the screener does not check asset limits, look-back periods,
 * categorical caveats, or state options. Every positive result routes
 * the user to the official portal to file the actual application.
 */
export const BENEFITS_PROGRAMS: BenefitsProgram[] = [
  {
    id: "healthy_michigan_plan",
    name: "Healthy Michigan Plan",
    summary:
      "Medicaid expansion coverage for adults 19-64. Free or low-cost health care.",
    fplMultiplier: 1.38,
    ruleLabel: "138% FPL (MAGI, includes 5% disregard)",
    effectiveYear: 2026,
    sourceUrl:
      "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
    sourceName: "Michigan MDHHS - Health Care Programs Eligibility",
    provenance: "VERIFIED",
    learnMoreHref: "/find-care",
  },
  {
    id: "snap",
    name: "SNAP (Food Assistance, Bridge Card)",
    summary:
      "Monthly food assistance loaded to a Bridge Card and accepted at most grocery stores.",
    fplMultiplier: 1.3,
    ruleLabel: "130% FPL gross income test (federal baseline)",
    effectiveYear: 2026,
    sourceUrl: "https://www.fns.usda.gov/snap/allotment/cola/fy26",
    sourceName: "USDA FNS - FY2026 SNAP Cost-of-Living Adjustments",
    provenance: "VERIFIED",
    learnMoreHref: "/financial-help",
  },
  {
    id: "wic",
    name: "WIC",
    summary:
      "Nutrition support for pregnant or postpartum people and children under 5.",
    fplMultiplier: 1.85,
    ruleLabel: "185% FPL",
    requiredAny: ["pregnant", "child_under_5"],
    effectiveYear: 2026,
    sourceUrl:
      "https://www.fns.usda.gov/wic/income-eligibility-guidelines-2025-26",
    sourceName: "USDA FNS - WIC Income Eligibility Guidelines",
    provenance: "VERIFIED",
    learnMoreHref: "/financial-help",
  },
  {
    id: "michild",
    name: "MIChild (CHIP)",
    summary:
      "Health coverage for uninsured children under 19 in households over the Medicaid limit.",
    fplMultiplier: 2.12,
    ruleLabel: "212% FPL (children)",
    requiredAny: ["child_under_19"],
    effectiveYear: 2026,
    sourceUrl:
      "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
    sourceName: "Michigan MDHHS - Children's Health Coverage",
    provenance: "VERIFIED",
    learnMoreHref: "/find-care",
  },
  {
    id: "liheap_heating",
    name: "LIHEAP Heating Assistance",
    summary:
      "Help with the annual heating bill. Filed through Michigan's Home Heating Credit (Treasury) or State Emergency Relief (MDHHS).",
    fplMultiplier: 1.1,
    ruleLabel: "110% FPL (Michigan FY2026 plan)",
    effectiveYear: 2026,
    sourceUrl:
      "https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom/2025/08/07/public-notice-proposed-liheap-state-plan-for-fy-2026",
    sourceName: "Michigan MDHHS - FY2026 LIHEAP State Plan",
    provenance: "VERIFIED",
    learnMoreHref: "/financial-help",
  },
  {
    id: "ser_energy_crisis",
    name: "State Emergency Relief (energy crisis)",
    summary:
      "One-time emergency help when heating, electricity, or gas is at risk of shutoff. Filed with MDHHS through MI Bridges.",
    fplMultiplier: 1.5,
    ruleLabel: "150% FPL (Michigan FY2026 crisis assistance plan)",
    effectiveYear: 2026,
    sourceUrl:
      "https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom/2025/08/07/public-notice-proposed-liheap-state-plan-for-fy-2026",
    sourceName: "Michigan MDHHS - FY2026 LIHEAP State Plan",
    provenance: "VERIFIED",
    learnMoreHref: "/financial-help",
  },
  {
    id: "msp_qmb",
    name: "Medicare Savings - QMB",
    summary:
      "Pays Medicare Part A and Part B premiums plus most cost-sharing. Apply through Michigan Medicaid.",
    fplMultiplier: 1.0,
    ruleLabel: "100% FPL (Qualified Medicare Beneficiary)",
    requiredAny: ["medicare_enrolled", "age_65_plus", "disability"],
    effectiveYear: 2026,
    sourceUrl:
      "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
    sourceName: "CMS - Medicare Savings Programs (2026)",
    provenance: "VERIFIED",
  },
  {
    id: "msp_slmb",
    name: "Medicare Savings - SLMB",
    summary:
      "Pays the Medicare Part B premium for people just above the QMB income limit.",
    fplMultiplier: 1.2,
    ruleLabel: "120% FPL (Specified Low-Income Medicare Beneficiary)",
    requiredAny: ["medicare_enrolled", "age_65_plus", "disability"],
    effectiveYear: 2026,
    sourceUrl:
      "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
    sourceName: "CMS - Medicare Savings Programs (2026)",
    provenance: "VERIFIED",
  },
  {
    id: "msp_qi",
    name: "Medicare Savings - QI",
    summary:
      "Pays the Medicare Part B premium for people just above the SLMB income limit.",
    fplMultiplier: 1.35,
    ruleLabel: "135% FPL (Qualifying Individual)",
    requiredAny: ["medicare_enrolled", "age_65_plus", "disability"],
    effectiveYear: 2026,
    sourceUrl:
      "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
    sourceName: "CMS - Medicare Savings Programs (2026)",
    provenance: "VERIFIED",
  },
  {
    id: "ssi",
    name: "Supplemental Security Income (SSI)",
    summary:
      "Federal cash assistance for low-income adults age 65+ or with a qualifying disability, and for low-income disabled children.",
    fplMultiplier: 0.74,
    ruleLabel:
      "Roughly 74% FPL for individuals (modelled from the 2026 federal benefit rate)",
    requiredAny: ["age_65_plus", "disability"],
    effectiveYear: 2026,
    sourceUrl: "https://www.ssa.gov/oact/cola/SSI.html",
    sourceName: "SSA - 2026 SSI Federal Payment Amounts",
    provenance: "MODELED",
  },
];

/**
 * Glossary used by the screener and the life-stage map. Every acronym
 * surfaced in UI text must appear here so it can be expanded inline
 * (mobile tap target, desktop hover).
 */
export const BENEFITS_GLOSSARY: Record<string, string> = {
  FPL: "Federal Poverty Level. Annual income guidelines set by the U.S. Department of Health and Human Services. Many programs set their income limit at a percentage of FPL.",
  MAGI: "Modified Adjusted Gross Income. The income-counting method used for Medicaid, the Marketplace, and several other programs. Often higher than gross income for households with certain deductions.",
  MSP: "Medicare Savings Programs. State-administered programs that help pay Medicare premiums and cost-sharing. Apply through Michigan Medicaid.",
  CHIP: "Children's Health Insurance Program. In Michigan, the children's health coverage program is called MIChild.",
  HMP: "Healthy Michigan Plan. Michigan's Medicaid expansion program for adults 19-64.",
  LIHEAP:
    "Low Income Home Energy Assistance Program. Federal funds passed through Michigan MDHHS for heating costs.",
  SER: "State Emergency Relief. Michigan MDHHS program that provides one-time emergency help for shutoffs, eviction, and similar crises.",
  SSI: "Supplemental Security Income. Federal cash benefit for low-income people who are 65 or older, blind, or have a qualifying disability.",
  SNAP: "Supplemental Nutrition Assistance Program. Federal food assistance. In Michigan, benefits load to a Bridge Card.",
  WIC: "Special Supplemental Nutrition Program for Women, Infants, and Children. USDA-funded program for pregnant or postpartum people and children under 5.",
};
