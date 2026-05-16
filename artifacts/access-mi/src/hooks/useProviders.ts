import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Provider = Tables<"providers">;

export function useProviders(facilityId?: string) {
  return useQuery({
    queryKey: ["providers", facilityId],
    queryFn: async () => {
      let query = supabase.from("providers").select("*");
      if (facilityId) {
        query = query.eq("facility_id", facilityId);
      }
      const { data, error } = await query.order("last_name");
      if (error) throw error;
      return data as Provider[];
    },
    staleTime: 60 * 60 * 1000, // 1h
  });
}
