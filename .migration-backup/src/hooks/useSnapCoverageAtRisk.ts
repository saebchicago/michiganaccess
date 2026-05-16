import { useQuery } from "@tanstack/react-query";
import {
  SNAP_COVERAGE_AT_RISK_FALLBACK,
  type SnapCoverageRangeEntry,
} from "@/data/snapCoverageAtRiskFallback";

export type { SnapCoverageRangeEntry };

export function useSnapCoverageAtRisk() {
  return useQuery<SnapCoverageRangeEntry[]>({
    queryKey: ["snap-coverage-at-risk"],
    queryFn: async () => {
      // TODO: replace with supabase.functions.invoke("snap-coverage-at-risk") once
      // the edge function is built. It will re-run the same proportional model against
      // fresher county enrollment data. Interface remains SnapCoverageRangeEntry[].
      return SNAP_COVERAGE_AT_RISK_FALLBACK;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — projection re-runs are infrequent
    retry: 1,
  });
}
