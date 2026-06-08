/**
 * Underserved ZIP Identifier - multi-dimensional need assessment.
 * THIS IS AN ILLUSTRATIVE COMPOSITE. Label clearly.
 */

export type NeedLevel = "Low" | "Moderate" | "High";
export type AccessLevel = "Good" | "Limited" | "Desert";
export type OverallFlag = "Well-Served" | "Moderate Need" | "Underserved" | "Critically Underserved";

export interface UnderservedAssessment {
  zip: string;
  overallFlag: OverallFlag;
  dimensions: {
    healthBurden: NeedLevel;
    economicHardship: NeedLevel;
    environmentalRisk: NeedLevel;
    providerAccess: AccessLevel;
    digitalAccess: AccessLevel;
  };
  flagCount: number;
}

export function assessZIP(zip: string, inputs: {
  healthScore?: number;      // 0-100, lower = worse health
  eitcPct?: number;          // EITC claim rate
  triCountyPounds?: number;  // TRI pounds in county
  hasCarcinogens?: boolean;
  hasHPSA?: boolean;         // health professional shortage area
  broadbandPct?: number;     // broadband adoption %
}): UnderservedAssessment {
  const healthBurden: NeedLevel =
    (inputs.healthScore ?? 50) < 40 ? "High" :
    (inputs.healthScore ?? 50) < 60 ? "Moderate" : "Low";

  const economicHardship: NeedLevel =
    (inputs.eitcPct ?? 15) > 30 ? "High" :
    (inputs.eitcPct ?? 15) > 20 ? "Moderate" : "Low";

  const environmentalRisk: NeedLevel =
    inputs.hasCarcinogens ? "High" :
    (inputs.triCountyPounds ?? 0) > 500000 ? "Moderate" : "Low";

  const providerAccess: AccessLevel =
    inputs.hasHPSA ? "Desert" : "Good";

  const digitalAccess: AccessLevel =
    (inputs.broadbandPct ?? 85) < 70 ? "Desert" :
    (inputs.broadbandPct ?? 85) < 80 ? "Limited" : "Good";

  let flagCount = 0;
  if (healthBurden === "High") flagCount++;
  if (economicHardship === "High") flagCount++;
  if (environmentalRisk === "High") flagCount++;
  if (providerAccess === "Desert") flagCount++;
  if (digitalAccess === "Desert") flagCount++;

  const overallFlag: OverallFlag =
    flagCount >= 4 ? "Critically Underserved" :
    flagCount >= 2 ? "Underserved" :
    flagCount >= 1 ? "Moderate Need" : "Well-Served";

  return {
    zip,
    overallFlag,
    dimensions: { healthBurden, economicHardship, environmentalRisk, providerAccess, digitalAccess },
    flagCount,
  };
}
