#!/usr/bin/env node
/**
 * Build guard (post-build): every sitemap URL ships its own raw-HTML identity.
 *
 * For each <loc> in dist/sitemap.xml, resolves the file Netlify serves for it
 * (dist/<path>/index.html, or dist/brief-county/<slug>/index.html for
 * /brief?county=<slug>, see netlify/edge-functions/brief-county.js) and fails
 * when the raw HTML:
 *   - declares a canonical other than the sitemap URL itself
 *   - has a <title> or <h1> shared with another sitemap URL
 *   - has no <h1>, or more than one, outside <noscript>
 *   - has no body text or no internal <a href> outside <noscript>
 *
 * It also fails when any HTML file other than dist/index.html (including the
 * SPA shell and 404 page) declares the homepage as its canonical: that tells crawlers a deep route is
 * a duplicate of "/", which is the failure this guard exists to stop.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://accessmi.org";
const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "..", "dist");

function servedFile(loc) {
  const u = new URL(loc);
  if (u.pathname.replace(/\/$/, "") === "/brief" && u.searchParams.get("county")) {
    return path.join(distDir, "brief-county", u.searchParams.get("county"), "index.html");
  }
  const rel = u.pathname.replace(/^\/+/, "").replace(/\/$/, "");
  return path.join(distDir, rel, "index.html");
}

function bodyOf(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? "";
  return body
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

async function main() {
  const sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
  if (locs.length === 0) throw new Error("dist/sitemap.xml has no <loc> entries");

  const failures = [];
  const titles = new Map();
  const h1s = new Map();
  for (const loc of locs) {
    const file = servedFile(loc);
    if (!existsSync(file)) {
      failures.push(`${loc}: no prerendered file (${path.relative(distDir, file)})`);
      continue;
    }
    const html = await readFile(file, "utf8");
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (canonical !== loc) failures.push(`${loc}: canonical is ${canonical ?? "missing"}`);

    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    if (!title) failures.push(`${loc}: empty <title>`);
    else if (titles.has(title)) failures.push(`${loc}: <title> duplicates ${titles.get(title)}`);
    else titles.set(title, loc);

    const body = bodyOf(html);
    const found = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].trim());
    if (found.length !== 1) failures.push(`${loc}: ${found.length} <h1> in raw body (want 1)`);
    else if (h1s.has(found[0])) failures.push(`${loc}: <h1> duplicates ${h1s.get(found[0])}`);
    else h1s.set(found[0], loc);

    const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (words < 15) failures.push(`${loc}: only ${words} word(s) of raw body text`);
    const internal = [...body.matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)].filter(
      (m) => m[1].startsWith("/") || m[1].startsWith(SITE_URL),
    ).length;
    if (internal === 0) failures.push(`${loc}: no internal <a href> in raw body`);
  }

  // No deep file may canonicalize to the homepage.
  for (const file of await walk(distDir)) {
    if (file === path.join(distDir, "index.html")) continue;
    const html = await readFile(file, "utf8");
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (canonical === `${SITE_URL}/` || canonical === SITE_URL) {
      failures.push(`${path.relative(distDir, file)}: canonical points at the homepage`);
    }
  }

  if (failures.length) {
    console.error(`[check-seo-prerender] FAIL (${failures.length}):`);
    for (const f of failures.slice(0, 60)) console.error(`  - ${f}`);
    if (failures.length > 60) console.error(`  ... and ${failures.length - 60} more`);
    process.exit(1);
  }
  console.log(
    `[check-seo-prerender] ok - ${locs.length} sitemap URL(s) ship a self canonical, unique title and h1, body text and internal links in raw HTML.`,
  );
}

main().catch((err) => {
  console.error("[check-seo-prerender] crashed:", err);
  process.exit(1);
});
