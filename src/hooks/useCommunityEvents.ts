import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string;
  address: string | null;
  city: string;
  county: string;
  state: string;
  zip: string | null;
  organizer: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  is_free: boolean | null;
  registration_required: boolean | null;
  registration_url: string | null;
  tags: string[] | null;
  is_active: boolean | null;
}

export const EVENT_TYPES = [
  { value: "health_fair", label: "Health Fair" },
  { value: "screening", label: "Screening" },
  { value: "support_group", label: "Support Group" },
  { value: "workshop", label: "Workshop" },
] as const;

export function useCommunityEvents(filters?: {
  eventType?: string;
  county?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["community_events", filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from("community_events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString().split("T")[0]);

      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }
      if (filters?.county) {
        query = query.eq("county", filters.county);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order("event_date", { ascending: true });
      if (error) throw error;
      return data as CommunityEvent[];
    },
  });
}
