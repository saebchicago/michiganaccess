import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityResource {
  id: string;
  resource_name: string;
  resource_type: string;
  organization: string | null;
  description: string | null;
  address: string | null;
  city: string;
  county: string;
  state: string;
  zip: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  eligibility_notes: string | null;
  languages: string[] | null;
  is_free: boolean | null;
  accepts_insurance: boolean | null;
  walk_in_available: boolean | null;
  services_offered: string[] | null;
  is_active: boolean | null;
}

export function useCommunityResources(resourceType?: string, county?: string | null) {
  return useQuery({
    queryKey: ["community_resources", resourceType, county],
    queryFn: async () => {
      let query = supabase.from("community_resources").select("*");
      if (resourceType) {
        query = query.eq("resource_type", resourceType);
      }
      if (county) {
        query = query.eq("county", county);
      }
      const { data, error } = await query.order("resource_name");
      if (error) throw error;
      return data as CommunityResource[];
    },
  });
}
