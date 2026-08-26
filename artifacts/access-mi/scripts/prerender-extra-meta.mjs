#!/usr/bin/env node
/**
 * Prerender a deliberately small set of flagship routes that are registered
 * directly in App.tsx rather than the legacy APP_ROUTES table.
 *
 * This keeps crawler metadata build-time/static (zero request-time compute)
 * while the broader route-table consolidation proceeds independently. The
 * metadata lives in src/config/extraRouteMeta.json so sitemap generation and
 * this prerender step consume exactly the same facts.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://accessmi.org";
const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const metaPath = path.join(projectRoot, "src/config/extraRouteMeta.json");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function replaceOrInsert(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
}

function rewriteHead(html, meta) {
  const canonicalPath = meta.path === "/" ? "/" : `${meta.path.replace(/\/$/, "")}/`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  let out = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(meta.title)}</title>`,
  );

  out = replaceOrInsert(
    out,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  out = replaceOrInsert(
    out,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );

  const social = [
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`],
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`],
  ];
  for (const [pattern, tag] of social) out = replaceOrInsert(out, pattern, tag);

  const noscript = `<noscript data-accessmi-prerender><main><h1>${escapeHtml(meta.h1)}</h1><p>${escapeHtml(meta.summary ?? meta.description)}</p></main></noscript>`;
  if (/<div\s+id=["']root["']><\/div>/i.test(out)) {
    out = out.replace(
      /<div\s+id=["']root["']><\/div>/i,
      (root) => `${root}\n    ${noscript}`,
    );
  } else {
    out = out.replace(/<\/body>/i, `    ${noscript}\n  </body>`);
  }

  return out;
}

async function main() {
  const [baseHtml, rawMeta] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(metaPath, "utf8"),
  ]);
  const entries = JSON.parse(rawMeta);
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("extraRouteMeta.json must contain at least one route");
  }

  const seen = new Set();
  for (const meta of entries) {
    if (!meta?.path?.startsWith("/") || meta.path.includes(":")) {
      throw new Error(`Invalid static extra route path: ${meta?.path ?? "missing"}`);
    }
    if (seen.has(meta.path)) throw new Error(`Duplicate extra route path: ${meta.path}`);
    seen.add(meta.path);
    for (const field of ["title", "description", "h1"]) {
      if (typeof meta[field] !== "string" || !meta[field].trim()) {
        throw new Error(`${meta.path}: missing ${field}`);
      }
    }

    const targetDir = path.join(distDir, meta.path.replace(/^\//, ""));
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, "index.html"), rewriteHead(baseHtml, meta), "utf8");
  }

  console.log(`[prerender-extra-meta] wrote ${entries.length} flagship route HTML file(s).`);
}

main().catch((error) => {
  console.error("[prerender-extra-meta] failed:", error);
  process.exit(1);
});
