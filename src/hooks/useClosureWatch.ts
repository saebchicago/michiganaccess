import { useQuery } from "@tanstack/react-query";
import { CLOSURE_WATCH_FALLBACK, type ClosureEntry } from "@/data/closureWatchFallback";

/**
 * useClosureWatch — returns verified Michigan hospital/service-line closure entries.
 *
 * Phase B note: the `sheps-closures` Supabase Edge Function has not been built because
 * the Sheps Center publishes Excel-only (no JSON/CSV/RSS API). Until a structured feed
 * or XLSX ingest pipeline exists, this hook returns the curated fallback dataset.
 * The queryFn is structured to swap in the edge-function call without changing call sites.
 */
export function useClosureWatch() {
  return useQuery<ClosureEntry[]>({
    queryKey: ["closure-watch"],
    queryFn: async () => {
      // TODO(Phase B): replace with supabase.functions.invoke("sheps-closures") when
      // the Excel ingest pipeline ships. Example:
      //   const { data, error } = await supabase.functions.invoke("sheps-closures");
      //   if (error) throw error;
      //   return data as ClosureEntry[];
      return CLOSURE_WATCH_FALLBACK;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — closure data changes infrequently
    retry: 1,
  });
}
