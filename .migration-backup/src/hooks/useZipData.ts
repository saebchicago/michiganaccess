/**
 * useZipData — React Query hook that aggregates ZIP-level data
 * from CDC PLACES, IRS SOI, HUD FMR, Census quickstats, and RUCA.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchZCTAData, type PlacesMeasure } from "@/lib/places-client";
import { ZIP_QUICKSTATS, type ZipQuickStat } from "@/data/zip-quickstats";
import { IRS_ZIP_DATA, type IRSZipIncome } from "@/data/irs-zip-income";
import { HUD_FMR_DATA, type HudFmr } from "@/data/hud-fmr";
import { ZIP_RUCA, type ZipRuca } from "@/data/rurality";
import { ZIP_TO_COUNTY } from "@/data/michiganZips";

export interface ZipDataResult {
  cdcData: PlacesMeasure[];
  quickStats: ZipQuickStat | null;
  irsData: IRSZipIncome | null;
  fmrData: HudFmr | null;
  rurality: ZipRuca | null;
  city: string;
  county: string;
  loading: boolean;
  error: Error | null;
}

export function useZipData(zipcode: string | undefined): ZipDataResult {
  const zip = zipcode ?? "";

  const { data: cdcData, isLoading, error } = useQuery({
    queryKey: ["zip-cdc-places", zip],
    queryFn: () => fetchZCTAData(zip),
    enabled: zip.length === 5,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const quickStats = ZIP_QUICKSTATS[zip] ?? null;
  const irsData = IRS_ZIP_DATA[zip] ?? null;
  const fmrData = HUD_FMR_DATA[zip] ?? null;
  const rurality = ZIP_RUCA[zip] ?? null;

  // Resolve city/county from quickstats, IRS data, or ZIP lookup
  const lookup = ZIP_TO_COUNTY[zip];
  const city = quickStats?.city ?? irsData?.city ?? lookup?.city ?? "";
  const county = quickStats?.county ?? irsData?.county ?? lookup?.county ?? "";

  return {
    cdcData: cdcData ?? [],
    quickStats,
    irsData,
    fmrData,
    rurality,
    city,
    county,
    loading: isLoading,
    error: error as Error | null,
  };
}
