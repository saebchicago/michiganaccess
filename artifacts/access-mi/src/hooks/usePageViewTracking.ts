import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA page_view dispatch for the GA4 tag loaded in index.html.
 *
 * gtag.js only records the initial document load on its own; in a
 * 140-route SPA every client-side navigation was invisible, so funnel
 * data (find-care entry points, county pages, partner pages) was
 * unreliable. This sends a page_view on each route change using the
 * already-loaded tag. No new cookies, identifiers, or Google features
 * are enabled beyond what index.html already discloses - see the
 * privacy note there and on /privacy.
 *
 * Only the path is sent (no query string): /brief?county=... and
 * search params can encode a visitor's county or search terms, and the
 * path alone is enough for navigation analytics.
 */
export function usePageViewTracking(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
      .gtag;
    if (typeof gtag !== "function") return;
    gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.origin + pathname,
      page_title: document.title,
    });
  }, [pathname]);
}
