import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
  is_24_7: boolean | null;
  is_open_now: boolean | null;
  on_bus_line: boolean | null;
  no_id_required: boolean | null;
  services_offered: string[] | null;
  is_active: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  hours: string | null;
  accepting_new_patients: boolean | null;
  telehealth_available: boolean | null;
  walk_in: boolean | null;
  insurance_accepted: string[] | null;
  services: string[] | null;
  specialties: string[] | null;
  quality_score: number | null;
  latitude: number;
  longitude: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
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
  description: string | null;
  organizer: string | null;
  is_free: boolean | null;
  registration_required: boolean | null;
  registration_url: string | null;
  website: string | null;
  contact_phone: string | null;
  tags: string[] | null;
  is_active: boolean | null;
}

export function useCommunityResources(county?: string, resourceType?: string) {
  return useQuery<CommunityResource[]>({
    queryKey: ["community_resources", county ?? "", resourceType ?? ""],
    queryFn: async () => {
      let query = supabase
        .from("community_resources")
        .select("*")
        .eq("is_active", true);
      if (county) query = query.ilike("county", `%${county}%`);
      if (resourceType && resourceType !== "All") {
        query = query.eq("resource_type", resourceType);
      }
      const { data, error } = await query.order("resource_name").limit(50);
      if (error) throw error;
      return (data ?? []) as CommunityResource[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useFacilities(county?: string, facilityType?: string) {
  return useQuery<Facility[]>({
    queryKey: ["facilities", county ?? "", facilityType ?? ""],
    queryFn: async () => {
      let query = supabase.from("facilities").select("*");
      if (county) query = query.ilike("county", `%${county}%`);
      if (facilityType && facilityType !== "All") {
        query = query.eq("facility_type", facilityType);
      }
      const { data, error } = await query.order("name").limit(50);
      if (error) throw error;
      return (data ?? []) as Facility[];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCommunityEvents(county?: string) {
  return useQuery<CommunityEvent[]>({
    queryKey: ["community_events", county ?? ""],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      let query = supabase
        .from("community_events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", today);
      if (county) query = query.ilike("county", `%${county}%`);
      const { data, error } = await query.order("event_date").limit(30);
      if (error) throw error;
      return (data ?? []) as CommunityEvent[];
    },
    staleTime: 30 * 60 * 1000,
  });
}
