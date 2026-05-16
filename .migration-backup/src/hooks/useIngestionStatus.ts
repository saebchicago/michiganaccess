/**
 * Hook to fetch the latest ingestion run for a dataset.
 * Returns lastRun timestamp, status, and error if any.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IngestionStatus {
  lastRun: Date | null;
  lastSuccess: Date | null;
  lastError: string | null;
  recordCount: number | null;
  loading: boolean;
}

export function useIngestionStatus(datasetId: string, enabled = true): IngestionStatus {
  const { data, isLoading } = useQuery({
    queryKey: ["ingestion-status", datasetId],
    queryFn: async () => {
      const { data: runs } = await supabase
        .from("ingestion_runs" as any)
        .select("*")
        .eq("dataset_id", datasetId)
        .order("started_at", { ascending: false })
        .limit(1);

      if (!runs || runs.length === 0) return null;
      return runs[0] as any;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    lastRun: data?.started_at ? new Date(data.started_at) : null,
    lastSuccess: data?.status === "success" && data?.finished_at ? new Date(data.finished_at) : null,
    lastError: data?.status === "error" ? data.error_message : null,
    recordCount: data?.records_upserted ?? null,
    loading: isLoading,
  };
}
