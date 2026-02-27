/**
 * useFooterStats — dynamic civic platform metrics for the Footer status bar.
 *
 * Sources:
 *  - dataFeeds:    derived from the canonical DATA_SOURCES list (auto-syncs with footer)
 *  - loadMs:       actual page load time via PerformanceNavigationTiming API
 *  - resourceCount: resource directory total, fetched from Supabase with "700+" fallback
 *  - countyCount:  always 83 (Michigan's county count is a constitutional fact)
 *  - lastRefresh:  today's date — represents the platform's live data posture
 */
import { useState, useEffect } from "react";

// Single source of truth — matches the data sources listed in the Footer
export const DATA_SOURCES = [
  "MDHHS",
  "Michigan 2-1-1",
  "CMS (Medicare)",
  "HRSA",
  "CDC",
  "EPA AirNow",
  "Leapfrog (Safety)",
] as const;

export interface FooterStats {
  dataFeeds: number;
  loadMs: number | null;
  resourceCount: string;
  countyCount: number;
  lastRefresh: string;
}

const MICHIGAN_COUNTY_COUNT = 83;

function formatLoadTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function useFooterStats(): FooterStats {
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [resourceCount, setResourceCount] = useState<string>("700+");

  // Measure actual page load time using Navigation Timing Level 2
  useEffect(() => {
    const measure = () => {
      const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      const nav = entries[0];
      if (nav && nav.loadEventEnd > 0) {
        setLoadMs(Math.round(nav.loadEventEnd - nav.startTime));
      }
    };

    if (document.readyState === "complete") {
      measure();
    } else {
      window.addEventListener("load", measure, { once: true });
    }
  }, []);

  // Try to fetch live resource count from Supabase; fall back gracefully
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4s timeout

    fetch(`${supabaseUrl}/rest/v1/resources?select=count`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
      signal: controller.signal,
    })
      .then((res) => {
        const contentRange = res.headers.get("Content-Range");
        if (contentRange) {
          const total = contentRange.split("/")[1];
          if (total && total !== "*") {
            const n = parseInt(total, 10);
            if (!isNaN(n) && n > 0) {
              setResourceCount(`${n.toLocaleString()}+`);
            }
          }
        }
      })
      .catch(() => {
        // Silently fall back to static "700+" — expected when table doesn't exist or is private
      })
      .finally(() => clearTimeout(timer));

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  return {
    dataFeeds: DATA_SOURCES.length,
    loadMs,
    resourceCount,
    countyCount: MICHIGAN_COUNTY_COUNT,
    lastRefresh: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export { formatLoadTime };
