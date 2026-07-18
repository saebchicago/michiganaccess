/**
 * useFooterStats - dynamic civic platform metrics for the Footer status bar.
 *
 * Every number this hook returns must come from the platform SSOT
 * (`@/config/platformConstants`). Adding a local hardcoded count here is
 * how the platform ended up showing "7 data feeds" in the footer while
 * /status only pinged 4 endpoints.
 */
import { useState, useEffect } from "react";
import {
  MONITORED_API_FEEDS_COUNT,
  COUNTIES_COVERED,
} from "@/config/platformConstants";

export interface FooterStats {
  dataFeeds: number;
  loadMs: number | null;
  /**
   * Live count of curated community resources, formatted for display
   * (e.g. "743+"), or null until the live query resolves. This is the
   * single canonical resource-count display on the site; the footer hides
   * the stat entirely while it is null so no unverified number is shown.
   */
  resourceCount: string | null;
  countyCount: number;
  lastRefresh: string;
}

export function formatLoadTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Returns a CSS class for load time color-coding */
export function loadTimeColor(ms: number | null): string {
  if (ms === null) return "text-muted-foreground";
  if (ms < 500) return "text-michigan-forest-deep";
  if (ms <= 1500) return "text-amber-700 dark:text-amber-400";
  return "text-destructive";
}

export function useFooterStats(): FooterStats {
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [resourceCount, setResourceCount] = useState<string | null>(null);

  useEffect(() => {
    const measure = () => {
      const entries = performance.getEntriesByType(
        "navigation",
      ) as PerformanceNavigationTiming[];
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
    // Session-scoped cache. Footer mounts once per route in this SPA,
    // so the previous implementation fired the count query 25+ times
    // on a typical session. Cache the resolved string for the session
    // and bail out immediately on subsequent mounts.
    const SESSION_CACHE_KEY = "accessmi.footer.resourceCount.v2";
    try {
      const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (cached) {
        setResourceCount(cached);
        return;
      }
    } catch {
      // sessionStorage can throw in private mode; proceed with the fetch.
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    // Previous code hit `/rest/v1/resources?select=count`. There is no
    // `resources` table in this project; the canonical table is
    // `community_resources`. The bad path returned 404 on every page
    // load and fired 25+ times per session.
    fetch(`${supabaseUrl}/rest/v1/community_resources?select=count`, {
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
        if (!res.ok) return;
        const contentRange = res.headers.get("Content-Range");
        if (!contentRange) return;
        const total = contentRange.split("/")[1];
        if (!total || total === "*") return;
        const n = parseInt(total, 10);
        if (isNaN(n) || n <= 0) return;
        const display = `${n.toLocaleString()}+`;
        setResourceCount(display);
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, display);
        } catch {
          // Ignore session-storage write failures (private mode, quota).
        }
      })
      .catch(() => {
        // Network errors leave resourceCount null, so the footer simply
        // hides the stat rather than showing an unverified number. We
        // intentionally do not cache a failure: a transient network
        // hiccup should not block a successful retry on the next route.
      })
      .finally(() => clearTimeout(timer));

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  return {
    dataFeeds: MONITORED_API_FEEDS_COUNT,
    loadMs,
    resourceCount,
    countyCount: COUNTIES_COVERED,
    lastRefresh: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}
