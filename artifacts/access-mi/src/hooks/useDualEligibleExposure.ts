import { useQuery } from "@tanstack/react-query";
import {
  DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
  type DualEligibleCountyEntry,
} from "@/data/dualEligibleExposureFallback";

export type { DualEligibleCountyEntry };

export function useDualEligibleExposure() {
  return useQuery<DualEligibleCountyEntry[]>({
    queryKey: ["dual-eligible-exposure"],
    queryFn: async () => {
      // TODO: replace with supabase.functions.invoke("dual-eligible-exposure") once
      // the edge function is built. It will re-run the same proportional model against
      // fresher MACPAC / ACS data. Interface remains DualEligibleCountyEntry[].
      return DUAL_ELIGIBLE_EXPOSURE_FALLBACK;
    },
    // initialData ensures first paint has complete data - avoids isLoading:true on first
    // render which can cause a repaint race with Layout's Framer Motion opacity animation.
    initialData: DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - dual-eligible population data is updated annually
    retry: 1,
  });
}
