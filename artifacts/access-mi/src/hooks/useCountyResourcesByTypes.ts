import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityResource } from "./useCommunityResources";

/**
 * Active community resources in one county across several resource_type
 * values. Used by the county resource bridge, which needs "food OR
 * food_nutrition" style groups. Returns [] only when the county genuinely has
 * no matching row; a failed request throws so callers can say so.
 */
export function useCountyResourcesByTypes(
  county: string | null | undefined,
  resourceTypes: string[],
) {
  const types = [...resourceTypes].sort();
  return useQuery({
    queryKey: ["community_resources_by_types", county, types],
    enabled: Boolean(county) && types.length > 0,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_resources")
        .select("*")
        .eq("county", county as string)
        .eq("is_active", true)
        .in("resource_type", types)
        .order("resource_name");
      if (error) throw error;
      return (data ?? []) as CommunityResource[];
    },
  });
}
