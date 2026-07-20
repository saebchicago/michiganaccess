import { useEffect } from "react";
import { SITE_NAME, BASE_URL, DEFAULT_OG_IMAGE } from "@/config/site";

interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  /** Set true for soft-404 / non-indexable pages. */
  noindex?: boolean;
}

const DEFAULT_TITLE = `${SITE_NAME} - Michigan, County by County`;
const DEFAULT_DESCRIPTION =
  "Independent Michigan civic intelligence, built by and for fellow citizens. County-level health, environmental, and social data across all 83 counties.";
const DEFAULT_OG_TITLE = "Access Michigan: civic intelligence, county by county.";
const DEFAULT_CANONICAL = `${BASE_URL}/`;

const BRAND_SUFFIXES = [` | ${SITE_NAME}`, ` - ${SITE_NAME}`];

/**
 * Appends the site brand to a page title exactly once, standardizing on
 * the " | Access Michigan" separator regardless of what a caller already
 * embedded in `title`. Exported so it can be unit-tested without a DOM.
 */
export function buildPageTitle(title: string): string {
  if (title === SITE_NAME) return title;
  let base = title;
  for (const suffix of BRAND_SUFFIXES) {
    if (base.endsWith(suffix)) {
      base = base.slice(0, -suffix.length);
      break;
    }
  }
  return `${base} | ${SITE_NAME}`;
}

function normalizePath(path: string): string {
  return path === "/" || path.includes("?")
    ? path
    : path.endsWith("/")
      ? path
      : `${path}/`;
}

export function usePageMeta({
  title,
  description,
  path,
  ogImage,
  jsonLd,
  noindex,
}: PageMeta) {
  useEffect(() => {
    const fullTitle = buildPageTitle(title);
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", ogImage || DEFAULT_OG_IMAGE);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);

    let canonicalEl = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (path) {
      // Normalize to trailing-slash so canonical and og:url match the URL
      // Netlify serves (Pretty URLs adds a trailing slash to directory paths).
      // Root stays "/", query-string paths are left unchanged.
      const url = `${BASE_URL}${normalizePath(path)}`;
      setMeta("property", "og:url", url);
      if (canonicalEl) canonicalEl.href = url;
    }

    if (noindex) {
      setMeta("name", "robots", "noindex,follow");
    } else {
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    }

    // Inject JSON-LD structured data
    let scriptEl = document.querySelector(
      "script[data-page-jsonld]",
    ) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.type = "application/ld+json";
        scriptEl.setAttribute("data-page-jsonld", "true");
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        ...jsonLd,
      });
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // Signal puppeteer prerenderer that this page's meta tags are fully written.
    // The event is ignored in normal browser sessions (no listener registered).
    document.dispatchEvent(new Event("prerender-ready"));

    return () => {
      // Reset every tag this hook can touch back to the site-wide default,
      // not just the title - otherwise a route that omits `description` or
      // `path` (or never calls this hook at all) inherits stale values left
      // behind by whichever page the user navigated from.
      document.title = DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:description", DEFAULT_DESCRIPTION);
      setMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:title", DEFAULT_OG_TITLE);
      setMeta("name", "twitter:title", DEFAULT_OG_TITLE);
      setMeta("property", "og:image", DEFAULT_OG_IMAGE);
      setMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
      setMeta("property", "og:url", DEFAULT_CANONICAL);
      if (canonicalEl) canonicalEl.href = DEFAULT_CANONICAL;
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
      const pageScript = document.querySelector("script[data-page-jsonld]");
      if (pageScript) pageScript.remove();
    };
  }, [title, description, path, ogImage, jsonLd, noindex]);
}
