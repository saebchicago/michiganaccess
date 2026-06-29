/**
 * Need vs investment gap scoring (UC7 dashboard widget).
 * MODELED composite: high poverty + lower per-capita federal flow = higher gap.
 */

import { FEDERAL_INVESTMENTS } from "@/data/federal-investment";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";
import type { IntegrityLabel } from "@/types/chna";

export interface CountyInvestmentGap {
  county: string;
  povertyRate: number;
  perCapitaFederal: number;
  totalFederalUsd: number;
  needScore: number;
  investmentScore: number;
  gapScore: number;
  tier: "High gap" | "Moderate gap" | "Aligned";
  integrityLabel: IntegrityLabel;
}

function gapTier(score: number): CountyInvestmentGap["tier"] {
  if (score >= 25) return "High gap";
  if (score >= 10) return "Moderate gap";
  return "Aligned";
}

export function rankCountyInvestmentGaps(): CountyInvestmentGap[] {
  return FEDERAL_INVESTMENTS.map((inv) => {
    const cross = getCountyCrossDomain(inv.county);
    const poverty = cross?.povertyRate ?? 14;
    const needScore = Math.round(poverty * 2.8);
    const investmentScore = Math.round(inv.perCapita / 120);
    const gapScore = Math.max(0, needScore - investmentScore);

    return {
      county: inv.county,
      povertyRate: poverty,
      perCapitaFederal: inv.perCapita,
      totalFederalUsd: inv.totalFederal,
      needScore,
      investmentScore,
      gapScore,
      tier: gapTier(gapScore),
      integrityLabel: "MODELED" as const,
    };
  }).sort((a, b) => b.gapScore - a.gapScore);
}