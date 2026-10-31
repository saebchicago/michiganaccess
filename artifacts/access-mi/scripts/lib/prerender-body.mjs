/**
 * Shared raw-HTML body for prerendered routes.
 *
 * WHY
 * ---
 * Until 2026-10-30 every prerendered route put its <h1> and summary inside a
 * <noscript> block. Crawlers that render JavaScript ignore <noscript>, and
 * crawlers that do not render it often skip it too, so raw HTML read as an
 * empty body on every route, and the one shared sentence plus a single link
 * (to /data-sources) was the same on all 265 files.
 *
 * This module renders a visible <article id="prerender-content"> INSIDE
 * <div id="root">. React's createRoot().render() replaces whatever the
 * container holds on first commit, so the article is visible only until the
 * app mounts and needs no inline cleanup script (the CSP has no
 * 'unsafe-inline' for scripts). Every article carries its own <h1>, its own
 * text, and crawlable <a href> links to related routes.
 *
 * Copy rules: text only, taken verbatim from routeMeta.ts, extraRouteMeta.json
 * or the existing county summaries. This module never introduces a number.
 * Every article ends with the same "Related projects" nav the React footer
 * renders, read from src/config/relatedProjects.json.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_URL = "https://accessmi.org";

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trailing-slash policy shared with generate-sitemap.mjs and usePageMeta. */
export function canonicalPath(p) {
  if (p === "/" || p.includes("?")) return p;
  return p.endsWith("/") ? p : `${p}/`;
}

/** Short link label from a route title: drops the " | Access Michigan" suffix. */
export function linkLabel(title) {
  return String(title)
    .replace(/\s*[|\u2013\u2014-]\s*Access Michigan\s*$/i, "")
    .replace(/\s*[|\u2013\u2014-]\s*AccessMI\s*$/i, "")
    .trim();
}

/** Primary hubs linked from every prerendered page, when they exist. */
export const PRIMARY_HUBS = [
  "/",
  "/health-map",
  "/find-care",
  "/benefits",
  "/data",
  "/data-sources",
  "/regions",
  "/brief",
  "/compare",
  "/methodology",
  "/about",
];

/**
 * Fallback labels for PRIMARY_HUBS, used by scripts that do not parse
 * routeMeta.ts (prerender-extra-meta.mjs, the 404 page).
 */
export const PRIMARY_HUB_LABELS = {
  "/": "Access Michigan home",
  "/health-map": "Health map",
  "/find-care": "Find care",
  "/benefits": "Benefits",
  "/data": "Michigan data",
  "/data-sources": "Data sources",
  "/regions": "Michigan regions",
  "/brief": "County briefs",
  "/compare": "Compare counties",
  "/methodology": "Methodology",
  "/about": "About",
};

export function primaryHubLinks(selfPath = null) {
  return PRIMARY_HUBS.filter((p) => p !== selfPath).map((p) => ({
    href: canonicalPath(p),
    label: PRIMARY_HUB_LABELS[p],
  }));
}

const ARTICLE_START = "<!-- prerender-body:start -->";
const ARTICLE_END = "<!-- prerender-body:end -->";
const ARTICLE_RE = new RegExp(`${ARTICLE_START}[\\s\\S]*?${ARTICLE_END}`, "g");

const ARTICLE_STYLE =
  "max-width:56rem;margin:0 auto;padding:1.5rem 1rem;font-family:system-ui,sans-serif;line-height:1.5";

function linkList(heading, links) {
  if (!links || links.length === 0) return "";
  const items = links
    .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`)
    .join("");
  return `<nav aria-label="${escapeHtml(heading)}"><h2>${escapeHtml(heading)}</h2><ul>${items}</ul></nav>`;
}

// Same list the React footer renders (src/config/relatedProjects.json), so
// crawlers reading raw HTML see the sibling-project links on every route.
// Names only: no descriptions or claims.
const relatedProjects = JSON.parse(
  readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../src/config/relatedProjects.json",
    ),
    "utf8",
  ),
);

export function relatedProjectsNav() {
  const links = relatedProjects.projects
    .filter((p) => p.url !== relatedProjects.self)
    .concat([relatedProjects.builtBy])
    .map((p) => `<a href="${escapeHtml(p.url)}">${escapeHtml(p.name)}</a>`)
    .join(" · ");
  return `<nav aria-label="Related projects">Related projects: ${links}</nav>`;
}

/**
 * @param {{h1: string, paragraphs: string[], sections?: {heading: string, links: {href: string, label: string}[]}[], attrs?: string}} body
 */
export function buildArticle(body) {
  const paras = (body.paragraphs ?? [])
    .filter((p) => p && String(p).trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const navs = (body.sections ?? []).map((s) => linkList(s.heading, s.links)).join("");
  const attrs = body.attrs ? ` ${body.attrs}` : "";
  return (
    `${ARTICLE_START}<article id="prerender-content"${attrs} style="${ARTICLE_STYLE}">` +
    `<h1>${escapeHtml(body.h1)}</h1>${paras}${navs}${relatedProjectsNav()}</article>${ARTICLE_END}`
  );
}

/** Removes a previously injected article (idempotent re-runs, inherited templates). */
export function stripArticle(html) {
  return html.replace(ARTICLE_RE, "");
}

/** Places the article inside #root, replacing any article the template already carries. */
export function injectArticle(html, articleHtml) {
  const clean = stripArticle(html);
  const rootRe = /<div id=["']root["']([^>]*)>\s*<\/div>/i;
  if (!rootRe.test(clean)) {
    throw new Error("prerender template is missing an empty <div id=\"root\"></div>");
  }
  return clean.replace(rootRe, (_m, rest) => `<div id="root"${rest}>${articleHtml}</div>`);
}
