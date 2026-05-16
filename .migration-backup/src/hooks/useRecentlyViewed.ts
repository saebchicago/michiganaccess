import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "mi-access-recent-counties";
const MAX_RECENT = 6;

interface RecentCounty {
  county: string;
  slug: string;
  timestamp: number;
}

export function useRecentlyViewed(currentCounty?: string, currentSlug?: string) {
  const [recent, setRecent] = useState<RecentCounty[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Record visit
  useEffect(() => {
    if (!currentCounty || !currentSlug) return;
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.county !== currentCounty);
      const updated = [{ county: currentCounty, slug: currentSlug, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [currentCounty, currentSlug]);

  const others = recent.filter((r) => r.county !== currentCounty);

  return { recentCounties: others };
}
