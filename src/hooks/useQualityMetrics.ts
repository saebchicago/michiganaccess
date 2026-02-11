import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type QualityMetric = Tables<"quality_metrics">;

export function useQualityMetrics(facilityIds?: string[]) {
  return useQuery({
    queryKey: ["quality_metrics", facilityIds],
    queryFn: async () => {
      let query = supabase.from("quality_metrics").select("*");
      if (facilityIds && facilityIds.length > 0) {
        query = query.in("facility_id", facilityIds);
      }
      const { data, error } = await query.order("metric_type").order("metric_name");
      if (error) throw error;
      return data as QualityMetric[];
    },
  });
}
