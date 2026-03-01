/**
 * Universal Pillar Data Hook
 *
 * Fetches real data for a registered pillar dataset.
 * Supports: supabase-table, arcgis-proxy, socrata, census-acs
 *
 * Returns empty data + clear status for pending datasets.
 * Never returns mock/fake data.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDatasetConfig, type PillarDataset } from "@/data/pillarRegistry";
import { queryArcGIS } from "@/data/arcgisClient";
import { querySocrata } from "@/data/socrataClient";

export interface PillarDataResult {
  data: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  status: "live" | "pending" | "error" | "empty";
  dataset: PillarDataset | null;
}

async function fetchPillarData(
  config: PillarDataset,
  filters?: Record<string, string>
): Promise<Record<string, unknown>[]> {
  switch (config.ingestionMethod) {
    case "supabase-table": {
      const tableName = config.ingestionTarget as any;
      let query = supabase.from(tableName).select("*").limit(500);
      if (filters?.county) {
        query = query.eq("county", filters.county);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Record<string, unknown>[];
    }

    case "arcgis-proxy": {
      const layer = config.ingestionTarget;
      const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co"}/functions/v1/arcgis-proxy?layer=${layer}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`ArcGIS proxy: ${res.status}`);
      const json = await res.json();
      // GeoJSON FeatureCollection → flat array of properties
      if (json.data?.features) {
        return json.data.features.map((f: any) => ({
          ...f.properties,
          _lat: f.geometry?.coordinates?.[1],
          _lon: f.geometry?.coordinates?.[0],
        }));
      }
      // Already flat array from arcgisClient
      if (Array.isArray(json.data)) return json.data;
      return [];
    }

    case "arcgis-direct": {
      const result = await queryArcGIS(config.ingestionTarget, { resultRecordCount: 200 });
      if (result.error) throw new Error(result.error);
      return result.data;
    }

    case "socrata": {
      const result = await querySocrata(config.ingestionTarget, {
        limit: 200,
        ...(filters?.where ? { where: filters.where } : {}),
      });
      if (result.error) throw new Error(result.error);
      return result.data;
    }

    case "census-acs": {
      // Census ACS is handled by useCensusACS hook; return empty here
      // and let the insight cards use the dedicated hook
      return [];
    }

    default:
      return [];
  }
}

export function usePillarData(
  datasetId: string,
  filters?: Record<string, string>,
  enabled = true
): PillarDataResult {
  const config = getDatasetConfig(datasetId);

  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["pillar-data", datasetId, filters],
    queryFn: () => {
      if (!config) throw new Error(`Unknown dataset: ${datasetId}`);
      if (config.status === "pending") return [] as Record<string, unknown>[];
      return fetchPillarData(config, filters);
    },
    enabled: enabled && !!config,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isPending = config?.status === "pending";
  const hasError = !!error;
  const isEmpty = !isLoading && !hasError && (data?.length ?? 0) === 0 && !isPending;

  return {
    data: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    status: isPending ? "pending" : hasError ? "error" : isEmpty ? "empty" : "live",
    dataset: config ?? null,
  };
}
