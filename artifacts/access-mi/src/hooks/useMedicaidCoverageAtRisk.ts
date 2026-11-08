import { useQuery } from "@tanstack/react-query";
import {
  MEDICAID_COVERAGE_AT_RISK_FALLBACK,
  type MedicaidCoverageRangeEntry,
} from "@/data/medicaidCoverageAtRiskFallback";

export type { MedicaidCoverageRangeEntry };

/**
 * County Medicaid-coverage-at-risk ranges, served from the committed static
 * dataset (src/data/acs-medicaid-adult-county.generated.json via
 * medicaidCoverageAtRiskFallback.ts).
 *
 * 2026-11-08: the medicaid-coverage-at-risk Supabase edge function call was
 * removed. The inputs change at most once a year (a new ACS 5-year release or
 * a revised Urban Institute range), so a live call added cost and a failure
 * mode without adding freshness. To refresh: run
 * `node scripts/refresh-medicaid-adult-county.mjs --apply`, commit, release.
 * The useQuery wrapper is kept so call sites and tests are unchanged.
 */
export function useMedicaidCoverageAtRisk() {
  return useQuery<MedicaidCoverageRangeEntry[]>({
    queryKey: ["medicaid-coverage-at-risk"],
    queryFn: async () => MEDICAID_COVERAGE_AT_RISK_FALLBACK,
    initialData: MEDICAID_COVERAGE_AT_RISK_FALLBACK,
    staleTime: Infinity,
  });
}
