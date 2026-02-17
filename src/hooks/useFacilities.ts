import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Facility = Tables<"facilities">;

export function useFacilities(facilityTypes?: string[], county?: string | string[] | null) {
  return useQuery({
    queryKey: ["facilities", facilityTypes, county],
    queryFn: async () => {
      let query = supabase.from("facilities").select("*");
      if (facilityTypes && facilityTypes.length > 0) {
        query = query.in("facility_type", facilityTypes);
      }
      if (county) {
        if (Array.isArray(county)) {
          query = query.in("county", county);
        } else {
          query = query.eq("county", county);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Facility[];
    },
  });
}
