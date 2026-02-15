import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  path?: string;
}

const SITE_NAME = "Michigan Access";
const BASE_URL = "https://michiganaccess.lovable.app";

export function usePageMeta({ title, description, path }: PageMeta) {
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

    if (path) {
      const url = `${BASE_URL}${path}`;
      setMeta("property", "og:url", url);
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) canonical.href = url;
    }

    return () => {
      document.title = `${SITE_NAME} — Statewide Services Gateway`;
    };
  }, [title, description, path]);
}
