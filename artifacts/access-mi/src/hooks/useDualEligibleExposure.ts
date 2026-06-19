import { useQuery } from "@tanstack/react-query";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY as SUPABASE_KEY,
} from "@/integrations/supabase/client";
import {
  DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
  type DualEligibleCountyEntry,
} from "@/data/dualEligibleExposureFallback";

export type { DualEligibleCountyEntry };

// Michigan has 83 counties; a complete allocation must cover all of them.
const EXPECTED_COUNTY_COUNT = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.length;

/**
 * Live county dual-eligible exposure via the dual-eligible-exposure edge
 * function, which re-runs the proportional model against fresh ACS B27010
 * shares. If the function is unavailable or returns an incomplete payload, we
 * fall back to the provenance-labeled static dataset so the UI never renders
 * partial data.
 */
async function fetchDualEligibleExposure(): Promise<DualEligibleCountyEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/dual-eligible-exposure`,
      {
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      },
    );

    const contentType = res.headers.get("content-type") ?? "";
    const bodyText = await res.text();

    if (!res.ok || !contentType.toLowerCase().includes("application/json")) {
      console.warn(
        `[useDualEligibleExposure] edge function unavailable (HTTP ${res.status}, ${contentType}); using fallback`,
        { bodySnippet: bodyText.slice(0, 200) },
      );
      return DUAL_ELIGIBLE_EXPOSURE_FALLBACK;
    }

    const json = JSON.parse(bodyText) as { data?: DualEligibleCountyEntry[] };
    if (!Array.isArray(json.data) || json.data.length < EXPECTED_COUNTY_COUNT) {
      console.warn(
        `[useDualEligibleExposure] edge function returned ${json.data?.length ?? 0}/${EXPECTED_COUNTY_COUNT} counties; using fallback`,
      );
      return DUAL_ELIGIBLE_EXPOSURE_FALLBACK;
    }

    return json.data;
  } catch (err) {
    console.warn(
      "[useDualEligibleExposure] edge function fetch failed; using fallback",
      err,
    );
    return DUAL_ELIGIBLE_EXPOSURE_FALLBACK;
  }
}

export function useDualEligibleExposure() {
  return useQuery<DualEligibleCountyEntry[]>({
    queryKey: ["dual-eligible-exposure"],
    queryFn: fetchDualEligibleExposure,
    // initialData ensures first paint has complete data - avoids isLoading:true on first
    // render which can cause a repaint race with Layout's Framer Motion opacity animation.
    initialData: DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - dual-eligible population data is updated annually
    retry: 1,
  });
}
