// src/hooks/useLazyLoad.tsx  (top of file)
import { useCallback, useEffect, useRef, useState } from "react";
// ─── Module-level SWR cache ──────────────────────────────────────────────────
// Keyed by the caller-supplied cacheKey. Lives for the browser session.
// `refetch` busts the entry so the next call goes to the network.
const _cache = new Map<string, unknown>();
// ─── Types ───────────────────────────────────────────────────────────────────
export interface UseLazyLoadOptions<T> {
  /** Async function that fetches or computes the data. */
  loader: (signal: AbortSignal) => Promise<T>;
  /**
   * Stable string key for the SWR cache. If omitted, caching is skipped.
   * Tip: JSON.stringify your params works well here.
   */
  cacheKey?: string;
  /** Delay the fetch even if the element is visible (default: true). */
  enabled?: boolean;
  /** Fire the loader only the first time the element enters the viewport
   *  (default: true). Set false for pull-to-refresh panels. */
  triggerOnce?: boolean;
  /** IntersectionObserver rootMargin (default: "200px"). */
  rootMargin?: string;
}
export interface UseLazyLoadResult<T> {
  /** Ref to attach to the DOM node you want to observe. */
  observedRef: React.RefObject<HTMLDivElement | null>;
  data: T | null;
  /** True only on the very first load (use for skeleton state). */
  isFirstLoad: boolean;
  /** True on any in-flight fetch (use for refresh spinner). */
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  /** Clears the cache entry and re-fetches immediately. */
  refetch: () => void;
}
// ─── Hook ────────────────────────────────────────────────────────────────────
export function useLazyLoad<T>(
  opts: UseLazyLoadOptions<T>,
): UseLazyLoadResult<T> {
  const {
    loader,
    cacheKey,
    enabled = true,
    triggerOnce = true,
    rootMargin = "200px",
  } = opts;
  const observedRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<T | null>(() =>
    cacheKey && _cache.has(cacheKey) ? (_cache.get(cacheKey) as T) : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(data === null);
  const [error, setError] = useState<string | null>(null);
  const hasFiredRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  // ── Fetch logic ─────────────────────────────────────────────────────────
  const doLoad = useCallback(
    async (bustCache = false) => {
      if (!enabled) return;
      // Serve from cache unless busting
      if (!bustCache && cacheKey && _cache.has(cacheKey)) {
        setData(_cache.get(cacheKey) as T);
        setIsFirstLoad(false);
        return;
      }
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setError(null);
      try {
        const result = await loader(controller.signal);
        if (controller.signal.aborted) return; // component unmounted mid-flight
        if (cacheKey) _cache.set(cacheKey, result);
        setData(result);
        setIsFirstLoad(false);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.warn("[useLazyLoad]:", err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    },
    // loader identity should be stable (wrap in useCallback at call site)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, cacheKey, loader],
  );
  // ── Manual refetch (busts cache) ────────────────────────────────────────
  const refetch = useCallback(() => {
    if (cacheKey) _cache.delete(cacheKey);
    hasFiredRef.current = false;
    doLoad(true);
  }, [cacheKey, doLoad]);
  // ── IntersectionObserver ────────────────────────────────────────────────
  useEffect(() => {
    const el = observedRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        if (triggerOnce) observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, triggerOnce]);
  // ── Fire loader when visible + enabled ──────────────────────────────────
  useEffect(() => {
    if (!isVisible || !enabled) return;
    if (triggerOnce && hasFiredRef.current) return;
    hasFiredRef.current = true;
    doLoad();
  }, [isVisible, enabled, triggerOnce, doLoad]);
  // ── Abort on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);
  return {
    observedRef,
    data,
    isFirstLoad,
    isLoading,
    error,
    isVisible,
    refetch,
  };
}
