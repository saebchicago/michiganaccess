import { useQuery } from "@tanstack/react-query";
import {
  SNAP_COUNTY_FALLBACK,
  SNAP_STATE_FALLBACK,
  type SnapCountyData,
  type SnapStateData,
} from "@/data/snapMichiganFallback";

export interface SnapMichiganData {
  counties: SnapCountyData[];
  state: SnapStateData;
}

const FALLBACK: SnapMichiganData = {
  counties: SNAP_COUNTY_FALLBACK,
  state: SNAP_STATE_FALLBACK,
};

export function useSnapMichigan() {
  return useQuery<SnapMichiganData>({
    queryKey: ["snap-michigan"],
    queryFn: async () => {
      // TODO: replace with supabase.functions.invoke("usda-snap-county") once
      // the usda-snap-county edge function is built (specced in V3_DESIGN.md).
      // The edge function will return county + state data matching this interface.
      return FALLBACK;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
}
