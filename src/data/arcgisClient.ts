/**
 * Generic ArcGIS REST client
 * - Supports FeatureServer & MapServer
 * - Pagination handling (resultOffset / resultRecordCount)
 * - Geometry stripping for lighter payloads
 * - In-memory caching (10 min TTL)
 * - Retry-safe: never throws UI-breaking errors
 */

interface ArcGISQueryOptions {
  where?: string;
  outFields?: string;
  returnGeometry?: boolean;
  resultRecordCount?: number;
  maxPages?: number;
}

interface CacheEntry {
  data: Record<string, unknown>[];
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function queryArcGIS(
  endpoint: string,
  options: ArcGISQueryOptions = {}
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  const cacheKey = `${endpoint}|${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { data: cached.data, error: null };
  }

  const {
    where = "1=1",
    outFields = "*",
    returnGeometry = false,
    resultRecordCount = 1000,
    maxPages = 5,
  } = options;

  const allFeatures: Record<string, unknown>[] = [];

  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        where,
        outFields,
        returnGeometry: String(returnGeometry),
        f: "json",
        resultOffset: String(page * resultRecordCount),
        resultRecordCount: String(resultRecordCount),
      });

      const res = await fetch(`${endpoint}/query?${params}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) break;

      const json = await res.json();
      const features: { attributes?: Record<string, unknown> }[] = json.features ?? [];

      if (features.length === 0) break;

      for (const f of features) {
        if (f.attributes) allFeatures.push(f.attributes);
      }

      // If we got fewer than requested, we've reached the end
      if (features.length < resultRecordCount) break;
    }

    cache.set(cacheKey, { data: allFeatures, ts: Date.now() });
    return { data: allFeatures, error: null };
  } catch (err) {
    console.warn("[arcgisClient] fetch failed:", err);
    return { data: [], error: err instanceof Error ? err.message : "ArcGIS fetch failed" };
  }
}
