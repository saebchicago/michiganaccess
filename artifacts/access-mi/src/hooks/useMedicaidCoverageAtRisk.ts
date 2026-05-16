import { useQuery } from "@tanstack/react-query";
import {
  MEDICAID_COVERAGE_AT_RISK_FALLBACK,
  type MedicaidCoverageRangeEntry,
} from "@/data/medicaidCoverageAtRiskFallback";

export type { MedicaidCoverageRangeEntry };

export function useMedicaidCoverageAtRisk() {
  return useQuery<MedicaidCoverageRangeEntry[]>({
    queryKey: ["medicaid-coverage-at-risk"],
    queryFn: async () => {
      // TODO: replace with supabase.functions.invoke("medicaid-coverage-at-risk") once
      // the edge function is built. It will re-run the same proportional model against
      // fresher Urban Institute / ACS data. Interface remains MedicaidCoverageRangeEntry[].
      return MEDICAID_COVERAGE_AT_RISK_FALLBACK;
    },
    // initialData ensures first paint has complete data — avoids isLoading:true on first
    // render which can cause a repaint race with Layout's Framer Motion opacity animation.
    initialData: MEDICAID_COVERAGE_AT_RISK_FALLBACK,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — projection re-runs are infrequent
    retry: 1,
  });
}
