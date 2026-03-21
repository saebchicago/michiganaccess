import { supabase } from "@/integrations/supabase/client";
import type {
  FoodAccessTract,
  SnapRetailer,
  BroadbandAccess,
  TransitStop,
  MaternalInfantHealth,
  EjScreen,
  CompoundAccessIndex,
} from "@/types/data-layers";

export async function getFoodDesertsByCounty(county: string): Promise<FoodAccessTract[]> {
  const { data, error } = await supabase
    .from("food_access_tracts")
    .select("*")
    .ilike("county", county)
    .order("food_desert_flag", { ascending: false });
  if (error) { console.warn("getFoodDesertsByCounty:", error.message); return []; }
  return (data || []) as FoodAccessTract[];
}

export async function getSnapRetailers(county?: string, limit = 200): Promise<SnapRetailer[]> {
  let query = supabase.from("snap_retailers").select("*").limit(limit);
  if (county) query = query.ilike("county", county);
  const { data, error } = await query;
  if (error) { console.warn("getSnapRetailers:", error.message); return []; }
  return (data || []) as SnapRetailer[];
}

export async function getBroadbandByCounty(county: string): Promise<BroadbandAccess[]> {
  const { data, error } = await supabase
    .from("broadband_access")
    .select("*")
    .ilike("county", county);
  if (error) { console.warn("getBroadbandByCounty:", error.message); return []; }
  return (data || []) as BroadbandAccess[];
}

export async function getTransitStops(agency?: string, limit = 500): Promise<TransitStop[]> {
  let query = supabase.from("transit_stops").select("*").limit(limit);
  if (agency) query = query.eq("agency", agency);
  const { data, error } = await query;
  if (error) { console.warn("getTransitStops:", error.message); return []; }
  return (data || []) as TransitStop[];
}

export async function getMaternalHealth(county?: string): Promise<MaternalInfantHealth[]> {
  let query = supabase.from("maternal_infant_health").select("*");
  if (county) query = query.ilike("county", county);
  const { data, error } = await query.order("county");
  if (error) { console.warn("getMaternalHealth:", error.message); return []; }
  return (data || []) as MaternalInfantHealth[];
}

export async function getEjScreenByTract(tractId: string): Promise<EjScreen[]> {
  const { data, error } = await supabase
    .from("ej_screen")
    .select("*")
    .eq("census_tract_id", tractId);
  if (error) { console.warn("getEjScreenByTract:", error.message); return []; }
  return (data || []) as EjScreen[];
}

export async function getCompoundIndex(county?: string): Promise<CompoundAccessIndex[]> {
  let query = supabase.from("compound_access_index").select("*");
  if (county) query = query.ilike("county", county);
  const { data, error } = await query.order("compound_deficit_index", { ascending: false });
  if (error) { console.warn("getCompoundIndex:", error.message); return []; }
  return (data || []) as CompoundAccessIndex[];
}

export async function getCompoundIndexByTier(tier: string): Promise<CompoundAccessIndex[]> {
  const { data, error } = await supabase
    .from("compound_access_index")
    .select("*")
    .eq("deficit_tier", tier)
    .order("compound_deficit_index", { ascending: false });
  if (error) { console.warn("getCompoundIndexByTier:", error.message); return []; }
  return (data || []) as CompoundAccessIndex[];
}
