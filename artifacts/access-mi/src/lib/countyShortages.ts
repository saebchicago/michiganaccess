/**
 * County shortage detection - the single rule set behind both the resource
 * bridge on the county brief and the full /county/:slug/help page.
 *
 * Rules:
 * - A shortage is only claimed when a published figure crosses a named
 *   threshold. Every shortage carries its figure, threshold and source so the
 *   claim can be checked at the point it is read.
 * - Missing data is never silently read as "no shortage": an input that has no
 *   county value is reported as not yet assessed.
 * - Nothing here invents a program. Program lookup happens in the UI against
 *   the resource directory and the verified facility extract.
 */
import { getHpsaForCountyName } from "@/data/hrsa-hpsa-county";
import { getSviForCountyName } from "@/data/cdc-svi-county";
import { getSaipeValue, SAIPE_STATEWIDE, saipeVintageLabel } from "@/data/saipe-county";
import { MI_BENCHMARKS } from "@/data/michiganBenchmarks";

export type ShortageId =
  | "primary-care"
  | "coverage"
  | "housing"
  | "food"
  | "child-poverty";

export interface Shortage {
  id: ShortageId;
  title: string;
  /** The measured figure, already formatted. */
  figure: string;
  /** The threshold that made this a shortage, already formatted. */
  threshold: string;
  source: string;
  resourceTypes: string[];
  programTypes: string[];
  /** What the resident can do about it, in plain language. */
  action: string;
  /** True when the county's own verified health sites answer this shortage. */
  showLocalFacilities?: boolean;
}

export const HUD_COST_BURDEN_THRESHOLD = 30;
export const POVERTY_150_THRESHOLD = 35;

/** Decide which shortages this county actually has, from published figures. */
export function detectShortages(county: string): {
  shortages: Shortage[];
  unassessed: string[];
} {
  const shortages: Shortage[] = [];
  const unassessed: string[] = [];

  const hpsa = getHpsaForCountyName(county);
  const pcFte = hpsa?.disciplines?.primaryCare?.shortageFte ?? null;
  if (pcFte === null) {
    unassessed.push("Primary care shortage (no HRSA designation on file)");
  } else if (pcFte > 0) {
    shortages.push({
      id: "primary-care",
      title: "Primary care shortage",
      figure: `${pcFte.toFixed(1)} full-time clinicians short`,
      threshold: "any HRSA-designated shortage",
      source: "HRSA Health Professional Shortage Areas",
      resourceTypes: ["health_services", "health", "information_referral"],
      programTypes: ["charity_care", "insurance"],
      action:
        "Federally qualified health centers charge on a sliding scale and take patients without insurance. Hospital financial assistance can cancel or cut a bill you already have.",
      showLocalFacilities: true,
    });
  }

  const svi = getSviForCountyName(county);
  const uninsured = svi?.status === "populated" ? svi.inputs.uninsuredPct : null;
  const stateUninsured = MI_BENCHMARKS["Uninsured rate"]?.stateValue ?? null;
  if (uninsured === null || stateUninsured === null) {
    unassessed.push("Uninsured rate (county value pending)");
  } else if (uninsured > stateUninsured) {
    shortages.push({
      id: "coverage",
      title: "Above-average uninsured rate",
      figure: `${uninsured.toFixed(1)}% uninsured`,
      threshold: `Michigan ${stateUninsured}%`,
      source: "CDC/ATSDR SVI (ACS inputs); benchmark: Michigan ACS",
      resourceTypes: ["health_insurance", "information_referral"],
      programTypes: ["insurance", "prescription"],
      action:
        "Healthy Michigan Plan enrollment is open year-round if you qualify on income. Marketplace plans open during enrollment or after a life change.",
      showLocalFacilities: true,
    });
  }

  const costBurden =
    svi?.status === "populated" ? svi.inputs.housingCostBurdenPct : null;
  if (costBurden === null) {
    unassessed.push("Housing cost burden (county value pending)");
  } else if (costBurden > HUD_COST_BURDEN_THRESHOLD) {
    shortages.push({
      id: "housing",
      title: "Housing cost burden",
      figure: `${costBurden.toFixed(1)}% of households cost-burdened`,
      threshold: `HUD standard ${HUD_COST_BURDEN_THRESHOLD}%`,
      source: "CDC/ATSDR SVI (ACS inputs); threshold: HUD",
      resourceTypes: ["housing", "housing_shelter"],
      programTypes: ["social_services"],
      action:
        "Housing assessment agencies handle emergency rent help and shelter placement. Energy assistance frees up rent money in the same household budget.",
    });
  }

  const poverty150 =
    svi?.status === "populated" ? svi.inputs.belowPoverty150Pct : null;
  if (poverty150 === null) {
    unassessed.push("Income below 150% of poverty (county value pending)");
  } else if (poverty150 > POVERTY_150_THRESHOLD) {
    shortages.push({
      id: "food",
      title: "High share of households near poverty",
      figure: `${poverty150.toFixed(1)}% below 150% of the poverty line`,
      threshold: `${POVERTY_150_THRESHOLD}% of households`,
      source: "CDC/ATSDR SVI (ACS inputs)",
      resourceTypes: ["food", "food_nutrition"],
      programTypes: ["social_services"],
      action:
        "Food assistance (SNAP) is applied for once through MI Bridges. Pantries below do not require an application.",
    });
  }

  // Census SAIPE child poverty against the Bureau's own Michigan figure from
  // the same release, so county and benchmark share a vintage and a method.
  const childPoverty = getSaipeValue(county, "childPovertyPct");
  const stateChildPoverty = SAIPE_STATEWIDE?.childPovertyPct ?? null;
  if (childPoverty === null || stateChildPoverty === null) {
    unassessed.push("Child poverty rate (county value pending)");
  } else if (childPoverty > stateChildPoverty) {
    shortages.push({
      id: "child-poverty",
      title: "Child poverty above the state rate",
      figure: `${childPoverty.toFixed(1)}% of children under 18 in poverty`,
      threshold: `Michigan ${stateChildPoverty.toFixed(1)}%`,
      source: `Census Bureau SAIPE (${saipeVintageLabel()})`,
      resourceTypes: ["food", "food_nutrition", "childcare", "information_referral"],
      programTypes: ["social_services", "insurance"],
      action:
        "WIC covers pregnancy through age five, school meals are free where the district qualifies, and MIChild covers children whose household earns too much for Medicaid.",
    });
  }

  return { shortages, unassessed };
}
