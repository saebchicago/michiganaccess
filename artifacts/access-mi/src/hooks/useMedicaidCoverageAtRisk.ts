import { useQuery } from "@tanstack/react-query";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY as SUPABASE_KEY,
} from "@/integrations/supabase/client";
import {
  MEDICAID_COVERAGE_AT_RISK_FALLBACK,
  type MedicaidCoverageRangeEntry,
} from "@/data/medicaidCoverageAtRiskFallback";

export type { MedicaidCoverageRangeEntry };

// Michigan has 83 counties; a complete projection must cover all of them.
const EXPECTED_COUNTY_COUNT = MEDICAID_COVERAGE_AT_RISK_FALLBACK.length;

/**
 * Live county Medicaid-coverage-at-risk projection via the
 * medicaid-coverage-at-risk edge function, which re-runs the proportional
 * model against fresh ACS C27007 shares. If the function is unavailable or
 * returns an incomplete payload, we fall back to the provenance-labeled
 * static dataset so the UI never renders partial data.
 */
async function fetchMedicaidCoverageAtRisk(): Promise<MedicaidCoverageRangeEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/medicaid-coverage-at-risk`,
      {
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      },
    );

    const contentType = res.headers.get("content-type") ?? "";
    const bodyText = await res.text();

    if (!res.ok || !contentType.toLowerCase().includes("application/json")) {
      console.warn(
        `[useMedicaidCoverageAtRisk] edge function unavailable (HTTP ${res.status}, ${contentType}); using fallback`,
        { bodySnippet: bodyText.slice(0, 200) },
      );
      return MEDICAID_COVERAGE_AT_RISK_FALLBACK;
    }

    const json = JSON.parse(bodyText) as { data?: MedicaidCoverageRangeEntry[] };
    if (!Array.isArray(json.data) || json.data.length < EXPECTED_COUNTY_COUNT) {
      console.warn(
        `[useMedicaidCoverageAtRisk] edge function returned ${json.data?.length ?? 0}/${EXPECTED_COUNTY_COUNT} counties; using fallback`,
      );
      return MEDICAID_COVERAGE_AT_RISK_FALLBACK;
    }

    return json.data;
  } catch (err) {
    console.warn(
      "[useMedicaidCoverageAtRisk] edge function fetch failed; using fallback",
      err,
    );
    return MEDICAID_COVERAGE_AT_RISK_FALLBACK;
  }
}

export function useMedicaidCoverageAtRisk() {
  return useQuery<MedicaidCoverageRangeEntry[]>({
    queryKey: ["medicaid-coverage-at-risk"],
    queryFn: fetchMedicaidCoverageAtRisk,
    // initialData ensures first paint has complete data - avoids isLoading:true on first
    // render which can cause a repaint race with Layout's Framer Motion opacity animation.
    initialData: MEDICAID_COVERAGE_AT_RISK_FALLBACK,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - projection re-runs are infrequent
    retry: 1,
  });
}
