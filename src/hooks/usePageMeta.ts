import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "Michigan Access";
const BASE_URL = "https://michiganaccess.lovable.app";
const DEFAULT_OG_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";

export function usePageMeta({ title, description, path, ogImage, jsonLd }: PageMeta) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
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
      const url = `${BASE_URL}${path}`;
      setMeta("property", "og:url", url);
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) canonical.href = url;
    }

    // Inject JSON-LD structured data
    let scriptEl = document.querySelector('script[data-page-jsonld]') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.type = "application/ld+json";
        scriptEl.setAttribute("data-page-jsonld", "true");
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({ "@context": "https://schema.org", ...jsonLd });
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      document.title = `${SITE_NAME} — Statewide Services Gateway`;
      const pageScript = document.querySelector('script[data-page-jsonld]');
      if (pageScript) pageScript.remove();
    };
  }, [title, description, path, ogImage, jsonLd]);
}
