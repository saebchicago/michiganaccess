import { useEffect } from "react";
import { SITE_NAME, BASE_URL, DEFAULT_OG_IMAGE } from "@/config/site";

interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

export function usePageMeta({
  title,
  description,
  path,
  ogImage,
  jsonLd,
}: PageMeta) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} - ${SITE_NAME}`;
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

    if (path) {
      // Normalize to trailing-slash so canonical and og:url match the URL
      // Netlify serves (Pretty URLs adds a trailing slash to directory paths).
      // Root stays "/", query-string paths are left unchanged.
      const normalized =
        path === "/" || path.includes("?")
          ? path
          : path.endsWith("/")
            ? path
            : `${path}/`;
      const url = `${BASE_URL}${normalized}`;
      setMeta("property", "og:url", url);
      let canonical = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (canonical) canonical.href = url;
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
      document.title = `${SITE_NAME} - Michigan, County by County`;
      const pageScript = document.querySelector("script[data-page-jsonld]");
      if (pageScript) pageScript.remove();
    };
  }, [title, description, path, ogImage, jsonLd]);
}
