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
import { MI_BENCHMARKS, BENCHMARK_SOURCE } from "@/data/michiganBenchmarks";
import type { IntegrityLabel } from "@/types/chna";

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
  /**
   * VERIFIED / MODELED per the platform's IntegrityBadge vocabulary. Every
   * shortage here reads a small-area statistical model (HRSA HPSA rollup,
   * CDC/ATSDR SVI's ACS-derived inputs, or Census SAIPE), so all read
   * MODELED, matching how those source datasets self-label. See
   * src/data/hrsa-hpsa-county.ts, cdc-svi-county.generated.json, and
   * saipe-county.generated.json's own provenance notes.
   */
  label: IntegrityLabel;
}

/**
 * AccessMI editorial cutoff, not a HUD standard. HUD's own 30% guideline is
 * a household's *share of income* spent on housing; this shortage measures
 * the share of *households* in the county that SVI reports as cost-burdened
 * - a different quantity that happens to share the number 30.
 */
export const COST_BURDEN_SHARE_THRESHOLD = 30;
/** AccessMI editorial cutoff; SVI/Census publish no "near poverty" standard. */
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
      label: "MODELED",
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
      // CDC/ATSDR SVI carries no Michigan statewide uninsured figure to
      // benchmark against directly, so this falls back to the platform's
      // County Health Rankings benchmark - a different universe (CHR's
      // uninsured measure is population under 65; SVI's EP_UNINSUR is all
      // ages), so the comparison is directional, not exact.
      threshold: `Michigan ${stateUninsured}% (${BENCHMARK_SOURCE}; under-65 basis, county figure is all ages)`,
      source: `CDC/ATSDR SVI (ACS inputs); benchmark: ${BENCHMARK_SOURCE}`,
      resourceTypes: ["health_insurance", "information_referral"],
      programTypes: ["insurance", "prescription"],
      action:
        "Healthy Michigan Plan enrollment is open year-round if you qualify on income. Marketplace plans open during enrollment or after a life change.",
      showLocalFacilities: true,
      label: "MODELED",
    });
  }

  const costBurden =
    svi?.status === "populated" ? svi.inputs.housingCostBurdenPct : null;
  if (costBurden === null) {
    unassessed.push("Housing cost burden (county value pending)");
  } else if (costBurden > COST_BURDEN_SHARE_THRESHOLD) {
    shortages.push({
      id: "housing",
      title: "Housing cost burden",
      figure: `${costBurden.toFixed(1)}% of households cost-burdened`,
      threshold: `more than ${COST_BURDEN_SHARE_THRESHOLD}% of households (AccessMI cutoff)`,
      source: "CDC/ATSDR SVI (ACS inputs); cutoff is editorial, not a HUD standard",
      resourceTypes: ["housing", "housing_shelter"],
      programTypes: ["social_services"],
      action:
        "Housing assessment agencies handle emergency rent help and shelter placement. Energy assistance frees up rent money in the same household budget.",
      label: "MODELED",
    });
  }

  const poverty150 =
    svi?.status === "populated" ? svi.inputs.belowPoverty150Pct : null;
  if (poverty150 === null) {
    unassessed.push("Income below 150% of poverty (county value pending)");
  } else if (poverty150 > POVERTY_150_THRESHOLD) {
    shortages.push({
      id: "food",
      // SVI's EP_POV150 counts persons, not households; the title and
      // figure previously said "households" for a persons-level input.
      title: "High share of residents near poverty",
      figure: `${poverty150.toFixed(1)}% of residents below 150% of the poverty line`,
      threshold: `more than ${POVERTY_150_THRESHOLD}% of residents (AccessMI cutoff)`,
      source: "CDC/ATSDR SVI (ACS inputs)",
      resourceTypes: ["food", "food_nutrition"],
      programTypes: ["social_services"],
      action:
        "Food assistance (SNAP) is applied for once through MI Bridges. Pantries below do not require an application.",
      label: "MODELED",
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
      // SAIPE is Census's own small area *estimate* program (its own
      // provenance notes call it "model-based"), the same standing as
      // CDC/ATSDR SVI's ACS-derived inputs above - so this reads MODELED,
      // not VERIFIED, for consistency with those.
      label: "MODELED",
    });
  }

  return { shortages, unassessed };
}
