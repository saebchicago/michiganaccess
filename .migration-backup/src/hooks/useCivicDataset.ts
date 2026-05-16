/**
 * Universal Civic Data Hook
 *
 * useCivicDataset(sourceId) → { data, loading, error, lastUpdated }
 *
 * - Graceful failure (never crashes UI)
 * - Skeleton-ready loading state
 * - Compatible with LazySection
 */

import { useQuery } from "@tanstack/react-query";
import { getDatasetById } from "@/data/datasetRegistry";
import { queryArcGIS } from "@/data/arcgisClient";
import { querySocrata } from "@/data/socrataClient";

interface CivicDatasetResult {
  data: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

async function fetchDataset(sourceId: string) {
  const source = getDatasetById(sourceId);
  if (!source) throw new Error(`Unknown dataset: ${sourceId}`);

  if (source.provider === "ArcGIS") {
    const result = await queryArcGIS(source.endpoint, { resultRecordCount: 100 });
    if (result.error) throw new Error(result.error);
    return result.data;
  }

  if (source.provider === "Socrata") {
    const result = await querySocrata(source.endpoint, { limit: 100 });
    if (result.error) throw new Error(result.error);
    return result.data;
  }

  throw new Error(`Unsupported provider: ${source.provider}`);
}

export function useCivicDataset(sourceId: string): CivicDatasetResult {
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["civic-dataset", sourceId],
    queryFn: () => fetchDataset(sourceId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
  };
}
