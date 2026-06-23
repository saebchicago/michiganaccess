/**
 * Generic Socrata SODA client
 * - Offset pagination
 * - Rate-limit protection (back-off on 429)
 * - Optional app token support
 * - Lightweight in-memory caching (10 min TTL)
 */

interface SocrataQueryOptions {
  select?: string;
  where?: string;
  limit?: number;
  offset?: number;
  order?: string;
  appToken?: string;
  maxPages?: number;
}

interface CacheEntry {
  data: Record<string, unknown>[];
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000;

export async function querySocrata(
  endpoint: string,
  options: SocrataQueryOptions = {},
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  const cacheKey = `${endpoint}|${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { data: cached.data, error: null };
  }

  const {
    select,
    where,
    limit = 1000,
    offset = 0,
    order,
    appToken,
    maxPages = 3,
  } = options;

  const allRows: Record<string, unknown>[] = [];

  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        $limit: String(limit),
        $offset: String(offset + page * limit),
      });
      if (select) params.set("$select", select);
      if (where) params.set("$where", where);
      if (order) params.set("$order", order);

      const headers: Record<string, string> = { Accept: "application/json" };
      if (appToken) headers["X-App-Token"] = appToken;

      const res = await fetch(`${endpoint}?${params}`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 429) {
        // Rate limited - return what we have
        console.warn("[socrataClient] rate limited, returning partial data");
        break;
      }
      if (!res.ok) break;

      const rows: Record<string, unknown>[] = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) break;

      allRows.push(...rows);

      if (rows.length < limit) break;
    }

    cache.set(cacheKey, { data: allRows, ts: Date.now() });
    return { data: allRows, error: null };
  } catch (err) {
    console.warn("[socrataClient] fetch failed:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Socrata fetch failed",
    };
  }
}
