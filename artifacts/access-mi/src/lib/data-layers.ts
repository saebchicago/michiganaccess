import { supabase } from "@/integrations/supabase/client";
import type {
  FoodAccessTract,
  SnapRetailer,
  BroadbandAccess,
  TransitStop,
  MaternalInfantHealth,
  EjScreen,
  CompoundAccessIndex,
  MetricValue,
} from "@/types/data-layers";

export type { MetricValue };

// These tables exist in the database but are not yet reflected in the
// auto-generated Supabase types. We cast through `unknown` so the runtime
// queries work while keeping the rest of the code fully typed.
const sb = supabase as unknown as {
  from(table: string): {
    select(columns: string): any;
  };
};

export async function getFoodDesertsByCounty(
  county: string,
): Promise<FoodAccessTract[]> {
  const { data, error } = await sb
    .from("food_access_tracts")
    .select("*")
    .ilike("county", county)
    .order("food_desert_flag", { ascending: false });
  if (error) {
    console.warn("getFoodDesertsByCounty:", error.message);
    return [];
  }
  return (data || []) as FoodAccessTract[];
}

export async function getSnapRetailers(
  county?: string,
  limit = 200,
): Promise<SnapRetailer[]> {
  let query = sb.from("snap_retailers").select("*").limit(limit);
  if (county) query = query.ilike("county", county);
  const { data, error } = await query;
  if (error) {
    console.warn("getSnapRetailers:", error.message);
    return [];
  }
  return (data || []) as SnapRetailer[];
}

export async function getBroadbandByCounty(
  county: string,
): Promise<BroadbandAccess[]> {
  const { data, error } = await sb
    .from("broadband_access")
    .select("*")
    .ilike("county", county);
  if (error) {
    console.warn("getBroadbandByCounty:", error.message);
    return [];
  }
  return (data || []) as BroadbandAccess[];
}

export async function getTransitStops(
  agency?: string,
  limit = 500,
): Promise<TransitStop[]> {
  let query = sb.from("transit_stops").select("*").limit(limit);
  if (agency) query = query.eq("agency", agency);
  const { data, error } = await query;
  if (error) {
    console.warn("getTransitStops:", error.message);
    return [];
  }
  return (data || []) as TransitStop[];
}

export async function getMaternalHealth(
  county?: string,
): Promise<MaternalInfantHealth[]> {
  let query = sb.from("maternal_infant_health").select("*");
  if (county) query = query.ilike("county", county);
  const { data, error } = await query.order("county");
  if (error) {
    console.warn("getMaternalHealth:", error.message);
    return [];
  }
  return (data || []) as MaternalInfantHealth[];
}

export async function getEjScreenByTract(tractId: string): Promise<EjScreen[]> {
  const { data, error } = await sb
    .from("ej_screen")
    .select("*")
    .eq("census_tract_id", tractId);
  if (error) {
    console.warn("getEjScreenByTract:", error.message);
    return [];
  }
  return (data || []) as EjScreen[];
}

export async function getCompoundIndex(
  county?: string,
): Promise<CompoundAccessIndex[]> {
  let query = sb.from("compound_access_index").select("*");
  if (county) query = query.ilike("county", county);
  const { data, error } = await query.order("compound_deficit_index", {
    ascending: false,
  });
  if (error) {
    console.warn("getCompoundIndex:", error.message);
    return [];
  }
  return (data || []) as CompoundAccessIndex[];
}

export async function getCompoundIndexByTier(
  tier: string,
): Promise<CompoundAccessIndex[]> {
  const { data, error } = await sb
    .from("compound_access_index")
    .select("*")
    .eq("deficit_tier", tier)
    .order("compound_deficit_index", { ascending: false });
  if (error) {
    console.warn("getCompoundIndexByTier:", error.message);
    return [];
  }
  return (data || []) as CompoundAccessIndex[];
}

// Canonical data_years value that the seed CSV must carry for the verified
// MDHHS 2020-2024 five-year average dataset. The guard below matches on this
// exact string; rows with any other data_years resolve to null regardless of
// their rate value. The seed script must set data_years = CANONICAL_INFANT_MORTALITY_VINTAGE
// exactly or the guard will suppress every row.
export const CANONICAL_INFANT_MORTALITY_VINTAGE = "2020-2024";

// Returns MDHHS 2020-2024 five-year average infant mortality rates keyed by
// county name. A county resolves to a number only when its row carries
// data_years === CANONICAL_INFANT_MORTALITY_VINTAGE AND a non-null rate.
// All other rows (wrong vintage, null rate, absent county) resolve to null,
// which the atlas renders as "data unavailable." Returns an empty map until
// the maternal_infant_health table is seeded via scripts/seed-maternal-health.ts.
export async function getInfantMortalityAtlas(): Promise<
  Record<string, number | null>
> {
  const rows = await getMaternalHealth();
  const lookup: Record<string, number | null> = {};
  for (const r of rows) {
    if (
      r.county &&
      r.data_years === CANONICAL_INFANT_MORTALITY_VINTAGE &&
      r.infant_mortality_rate != null
    ) {
      lookup[r.county] = r.infant_mortality_rate;
    }
  }
  return lookup;
}
