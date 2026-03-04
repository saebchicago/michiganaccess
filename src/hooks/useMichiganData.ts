import { useState, useEffect, useCallback } from "react";

const MICHIGAN_BASE = "https://data.michigan.gov/resource";

/**
 * Generic hook to fetch any Michigan Open Data (Socrata) dataset.
 * Pass the dataset ID (e.g. "abcd-1234") and optional query params.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useMichiganData("abcd-1234", { county: "Wayne" });
 */
export function fetchMichiganData<T = Record<string, unknown>[]>(
  datasetId: string,
  params: Record<string, string> = {},
  limit = 5000,
): Promise<T> {
  const url = new URL(`${MICHIGAN_BASE}/${datasetId}.json`);
  url.searchParams.set("$limit", String(limit));
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  return fetch(url.toString(), { headers: { Accept: "application/json" },signal })
    .then((res) => {
      if (!res.ok) throw new Error(`Michigan Open Data HTTP ${res.status}`);
      return res.json() as Promise<T>;
    });
}

export interface UseMichiganDataOptions {
  /** Socrata dataset identifier, e.g. "abcd-1234" */
  datasetId: string;
  /** Optional SoQL / query params */
  params?: Record<string, string>;
  /** Row limit (default 5000) */
  limit?: number;
  /** Skip fetch until true (default true) */
  enabled?: boolean;
}

export interface UseMichiganDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMichiganData<T = Record<string, unknown>[]>(
  opts: UseMichiganDataOptions,
): UseMichiganDataResult<T> {
  const { datasetId, params = {}, limit = 5000, enabled = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);

  const doFetch = useCallback(async () => {
    if (!datasetId || !enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMichiganData<T>(datasetId, params, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Michigan data");
      console.error("useMichiganData error:", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, paramsKey, limit, enabled]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return { data, isLoading, error, refetch: doFetch };
}
