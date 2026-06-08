import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Municipality {
  id: string;
  name: string;
  county: string;
  municipality_type: string;
  population: number | null;
  website: string | null;
  council_agenda_url: string | null;
  council_minutes_url: string | null;
  foia_portal_url: string | null;
  foia_contact_email: string | null;
  foia_policy_url: string | null;
  meeting_schedule: string | null;
  meeting_location: string | null;
  property_tax_rate: number | null;
  state_avg_tax_rate: number | null;
  safety_response_avg: number | null;
  state_avg_safety_response: number | null;
}

export function useMunicipalities(county?: string) {
  return useQuery({
    queryKey: ["municipalities", county],
    queryFn: async () => {
      let query = supabase.from("municipalities").select("*").order("population", { ascending: false });
      if (county) query = query.eq("county", county);
      const { data, error } = await query;
      if (error) throw error;
      return data as Municipality[];
    },
    enabled: !!county,
    staleTime: 24 * 60 * 60 * 1000, // 24h - municipality data rarely changes
  });
}
