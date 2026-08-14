#!/usr/bin/env node
/**
 * Build guard: every /county/<slug> route must ship a prerendered index.html
 * whose canonical points at itself, not at the site root. Without this the
 * 83 county pages inherit the homepage canonical in raw HTML and read as
 * duplicates to crawlers that do not execute JavaScript.
 *
 * Runs after prerender-meta.mjs.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const countyDir = path.join(root, "dist", "county");

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(countyDir))) {
    console.error(
      "[check-county-prerender] dist/county is missing - prerender-meta.mjs did not emit county routes.",
    );
    process.exit(1);
  }

  const slugs = (await readdir(countyDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (slugs.length !== 83) {
    console.error(
      `[check-county-prerender] expected 83 county routes, found ${slugs.length}.`,
    );
    process.exit(1);
  }

  const failures = [];
  for (const slug of slugs) {
    const file = path.join(countyDir, slug, "index.html");
    if (!(await exists(file))) {
      failures.push(`${slug}: missing index.html`);
      continue;
    }
    const html = await readFile(file, "utf8");
    const canonical = html.match(
      /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    )?.[1];
    if (!canonical) {
      failures.push(`${slug}: no canonical link`);
    } else if (!new RegExp(`/county/${slug}/?$`).test(canonical)) {
      failures.push(`${slug}: canonical points to ${canonical}`);
    }
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
    if (!/county/i.test(title)) {
      failures.push(`${slug}: title is not county-specific ("${title}")`);
    }
    if (!/<noscript>/i.test(html)) {
      failures.push(`${slug}: no noscript summary for non-JS crawlers`);
    }
  }

  if (failures.length) {
    console.error("[check-county-prerender] failures:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `[check-county-prerender] OK - ${slugs.length} county routes have self-referencing canonicals, county titles, and noscript summaries.`,
  );
}

main().catch((err) => {
  console.error("[check-county-prerender] crashed:", err);
  process.exit(1);
});
