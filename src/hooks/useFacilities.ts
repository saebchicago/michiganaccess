import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Facility = Tables<"facilities">;

export function useFacilities(facilityTypes?: string[]) {
  return useQuery({
    queryKey: ["facilities", facilityTypes],
    queryFn: async () => {
      let query = supabase.from("facilities").select("*");
      if (facilityTypes && facilityTypes.length > 0) {
        query = query.in("facility_type", facilityTypes);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Facility[];
    },
  });
}
