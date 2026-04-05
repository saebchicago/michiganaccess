/**
 * useFooterStats — dynamic civic platform metrics for the Footer status bar.
 */
import { useState, useEffect } from "react";

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

export function formatLoadTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Returns a CSS class for load time color-coding */
export function loadTimeColor(ms: number | null): string {
  if (ms === null) return "text-muted-foreground";
  if (ms < 500) return "text-michigan-forest";
  if (ms <= 1500) return "text-amber-700 dark:text-amber-400";
  return "text-destructive";
}

export function useFooterStats(): FooterStats {
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [resourceCount, setResourceCount] = useState<string>("700+");

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

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    fetch(`${supabaseUrl}/rest/v1/resources?select=count`, {
      headers: {
        apikey: supabaseKey as string,
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
        // Silently fall back to static "700+"
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
