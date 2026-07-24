/**
 * Page index for site search, derived from the route manifest so every
 * navigable page is discoverable via Cmd-K without hand-maintaining a
 * list. Sitemap labels ride along as synonyms (they are often the more
 * natural phrasing), and prerender summaries provide match text and
 * result sublabels.
 */
import { ROUTE_MANIFEST, SITEMAP_SECTIONS } from "@/routes/manifest";

export interface PageSearchEntry {
  label: string;
  href: string;
  description?: string;
  /** Extra match text: sitemap link labels pointing at this page. */
  synonyms: string[];
}

/** Curated copy that reads better in a search palette than the route label. */
const PAGE_OVERRIDES: Record<string, { label?: string; description?: string }> =
  {
    "/case-studies": { label: "Illustrative Scenarios" },
    "/outages": { label: "Utility Outages" },
    "/data": { label: "Health Data Dashboard" },
    "/resources": { label: "Community Resources" },
  };

/** Routes that should not surface in search. */
const EXCLUDED_PATHS = new Set(["/", "/embed", "/admin/search-trends", "*"]);

function isIndexable(path: string): boolean {
  return !path.includes(":") && !EXCLUDED_PATHS.has(path);
}

function buildIndex(): PageSearchEntry[] {
  const synonymsByHref = new Map<string, string[]>();
  for (const section of SITEMAP_SECTIONS) {
    for (const link of section.links) {
      const existing = synonymsByHref.get(link.href) ?? [];
      existing.push(link.label);
      synonymsByHref.set(link.href, existing);
    }
  }

  return ROUTE_MANIFEST.filter((r) => isIndexable(r.path)).map((r) => ({
    label: PAGE_OVERRIDES[r.path]?.label ?? r.label,
    href: r.path,
    description:
      PAGE_OVERRIDES[r.path]?.description ?? r.summary ?? r.description,
    synonyms: (synonymsByHref.get(r.path) ?? []).filter(
      (s) => s !== (PAGE_OVERRIDES[r.path]?.label ?? r.label),
    ),
  }));
}

/**
 * Built on first search, NOT at module evaluation.
 *
 * This used to be `export const PAGE_SEARCH_INDEX = buildIndex()`, which ran
 * during module evaluation and crashed the entire app in the production bundle:
 *
 *   ReferenceError: Cannot access 'wT' before initialization
 *
 * There is an import cycle - src/routes/manifest.ts eagerly imports
 * @/pages/Index, whose component tree reaches back here, and this module then
 * imports SITEMAP_SECTIONS from the manifest. In the bundled output this module
 * body evaluated before the manifest's `const` bindings were initialized, so
 * `for (const section of SITEMAP_SECTIONS)` hit the temporal dead zone. The
 * exception was thrown before ReactDOM ever rendered, leaving `<div id="root">`
 * empty - a blank page for every visitor, on every route.
 *
 * Vitest and the dev server both use a different module graph and never hit it;
 * only the production build did. Lighthouse had been reporting it for months as
 * NO_FCP ("The page did not paint any content"), which was read as CI noise.
 *
 * Deferring the build sidesteps the ordering entirely: by the time a visitor
 * types into the search palette, every module has finished evaluating.
 */
let cachedIndex: PageSearchEntry[] | null = null;

export function getPageSearchIndex(): PageSearchEntry[] {
  if (cachedIndex === null) cachedIndex = buildIndex();
  return cachedIndex;
}

/**
 * Rank pages for a query: label hits first, then sitemap synonyms, then
 * description text. Case-insensitive substring matching keeps behavior
 * predictable inside the cmdk palette (which does its own highlighting).
 */
export function searchPages(term: string, limit = 6): PageSearchEntry[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];

  const rank = (p: PageSearchEntry): number => {
    if (p.label.toLowerCase().includes(q)) return 0;
    if (p.synonyms.some((s) => s.toLowerCase().includes(q))) return 1;
    if (p.description?.toLowerCase().includes(q)) return 2;
    return -1;
  };

  return getPageSearchIndex()
    .map((p) => ({ p, r: rank(p) }))
    .filter(({ r }) => r >= 0)
    .sort((a, b) => a.r - b.r || a.p.label.localeCompare(b.p.label))
    .slice(0, limit)
    .map(({ p }) => p);
}
