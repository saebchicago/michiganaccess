#!/usr/bin/env node
/**
 * Post-build per-route HTML injection.
 *
 * Vite produces a single dist/index.html for the SPA. Crawlers and
 * link-preview generators that do not run JavaScript only ever see
 * the boilerplate <title>, <meta name="description">, and the empty
 * <body><div id="root"></div></body> from that one file. That is why
 * deep routes like /methodology, /health-map, and /transportation
 * have been appearing as the homepage in search snippets.
 *
 * This script copies dist/index.html into dist/<route>/index.html for
 * each entry in src/config/routeMeta.ts, then rewrites the head tags
 * (<title>, <meta name="description">, <link rel="canonical">, OG
 * and Twitter equivalents) and injects a <noscript> block with a
 * route-specific <h1> + summary so non-JS readers see route-specific
 * content instead of the homepage shell.
 *
 * The SPA still hydrates as normal in browsers that run JS. The
 * Netlify SPA fallback (`/* -> /index.html`) only fires when a
 * specific path is missing on disk, so a prerendered
 * dist/methodology/index.html is served directly for /methodology
 * while /county/wayne and other dynamic paths fall through to the
 * client-rendered shell.
 *
 * Invoked from package.json's `build` script:
 *     vite build && node scripts/prerender-meta.mjs
 */

import { mkdir, copyFile, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SITE_URL = "https://accessmi.org";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const routeMetaPath = path.join(projectRoot, "src/config/routeMeta.ts");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}

/**
 * Parse src/config/routeMeta.ts without TS tooling. The file is a
 * plain TypeScript array literal and only uses string fields, so a
 * narrow regex lift is enough; this keeps the post-build step free
 * of a TS or esbuild dependency at runtime.
 */
async function loadRouteMeta() {
  const src = await readFile(routeMetaPath, "utf8");
  const arrStart = src.indexOf("ROUTE_META: RouteMeta[] = [");
  if (arrStart < 0) {
    throw new Error(
      "Could not locate ROUTE_META array in src/config/routeMeta.ts; the regex parser expected the literal 'ROUTE_META: RouteMeta[] = ['.",
    );
  }
  // Skip the literal `RouteMeta[]` type annotation by anchoring on the
  // `=` sign. Otherwise `indexOf("[")` lands on the `[]` in `RouteMeta[]`
  // and the bracket walker closes the array immediately.
  const eqIdx = src.indexOf("=", arrStart);
  const bodyStart = src.indexOf("[", eqIdx);
  let depth = 0;
  let end = -1;
  for (let i = bodyStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error("Unterminated ROUTE_META array");

  const body = src.slice(bodyStart + 1, end);
  const entries = [];
  // Each entry is a {...} object literal. Walk the braces.
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf("{", i);
    if (open < 0) break;
    let d = 0;
    let close = -1;
    for (let j = open; j < body.length; j++) {
      if (body[j] === "{") d++;
      else if (body[j] === "}") {
        d--;
        if (d === 0) {
          close = j;
          break;
        }
      }
    }
    if (close < 0) break;
    entries.push(body.slice(open + 1, close));
    i = close + 1;
  }

  const fields = (entry) => {
    const out = {};
    const re = /(path|title|description|h1|summary)\s*:\s*"((?:\\.|[^"\\])*)"/g;
    let m;
    while ((m = re.exec(entry)) !== null) {
      out[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return out;
  };

  return entries
    .map(fields)
    .filter((r) => r.path && r.title && r.description && r.h1);
}

function rewriteHead(html, meta) {
  let out = html;

  // Title
  out = out.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(meta.title)}</title>`,
  );

  // Description
  if (/<meta\s+name=["']description["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `  <meta name="description" content="${escapeAttr(meta.description)}" />\n  </head>`,
    );
  }

  // Canonical
  const canonical = `${SITE_URL}${meta.path === "/" ? "" : meta.path}`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${escapeAttr(canonical)}" />\n  </head>`,
    );
  }

  // og:title / og:description / og:url
  const ogReplace = (prop, content) => {
    const re = new RegExp(
      `<meta\\s+property=["']${prop}["'][^>]*>`,
      "i",
    );
    const tag = `<meta property="${prop}" content="${escapeAttr(content)}" />`;
    if (re.test(out)) out = out.replace(re, tag);
    else out = out.replace(/<\/head>/i, `  ${tag}\n  </head>`);
  };
  ogReplace("og:title", meta.title);
  ogReplace("og:description", meta.description);
  ogReplace("og:url", canonical);

  // twitter:title / twitter:description
  const twReplace = (prop, content) => {
    const re = new RegExp(
      `<meta\\s+name=["']${prop}["'][^>]*>`,
      "i",
    );
    const tag = `<meta name="${prop}" content="${escapeAttr(content)}" />`;
    if (re.test(out)) out = out.replace(re, tag);
    else out = out.replace(/<\/head>/i, `  ${tag}\n  </head>`);
  };
  twReplace("twitter:title", meta.title);
  twReplace("twitter:description", meta.description);

  return out;
}

const PRERENDER_MARKER_START = "<!-- prerender-meta:start -->";
const PRERENDER_MARKER_END = "<!-- prerender-meta:end -->";

function stripExistingNoscript(html) {
  // Make this script safe to re-run against an already-prerendered
  // dist/. Without this, each invocation appends another noscript
  // block, eventually surfacing the wrong h1 to crawlers.
  const re = new RegExp(
    `${PRERENDER_MARKER_START}[\\s\\S]*?${PRERENDER_MARKER_END}\\s*`,
    "g",
  );
  return html.replace(re, "");
}

function injectNoscript(html, meta) {
  // Drop a route-specific <h1> + summary inside a <noscript> block at
  // the top of the SPA root. JS-enabled browsers ignore it; crawlers
  // and text-mode readers see route-specific content instead of the
  // homepage shell. Marker comments make the inserted region cheap to
  // locate and replace on subsequent runs.
  const cleaned = stripExistingNoscript(html);
  const snippet =
    `${PRERENDER_MARKER_START}\n` +
    `    <noscript>\n` +
    `      <section role="main" aria-labelledby="noscript-route-h1">\n` +
    `        <h1 id="noscript-route-h1">${escapeHtml(meta.h1)}</h1>\n` +
    (meta.summary
      ? `        <p>${escapeHtml(meta.summary)}</p>\n`
      : "") +
    `        <p>This page requires JavaScript for full interactivity. View the data we publish at <a href="${SITE_URL}/data-sources">${SITE_URL}/data-sources</a>.</p>\n` +
    `      </section>\n` +
    `    </noscript>\n` +
    `    ${PRERENDER_MARKER_END}\n    `;

  if (/<div id=["']root["'][^>]*>/i.test(cleaned)) {
    return cleaned.replace(
      /<div id=["']root["'][^>]*>/i,
      (match) => `${snippet}${match}`,
    );
  }
  return cleaned;
}

async function main() {
  if (!existsSync(distDir)) {
    console.error(`[prerender-meta] dist/ not found at ${distDir}`);
    console.error("[prerender-meta] Run `vite build` before this script.");
    process.exit(1);
  }
  if (!existsSync(indexPath)) {
    console.error(`[prerender-meta] index.html not found at ${indexPath}`);
    process.exit(1);
  }

  const routeMeta = await loadRouteMeta();
  if (routeMeta.length === 0) {
    console.warn(
      "[prerender-meta] no entries in ROUTE_META; skipping per-route HTML.",
    );
    return;
  }

  const indexHtml = await readFile(indexPath, "utf8");

  // Always rewrite dist/index.html in place for the home route so the
  // homepage shell itself ships the canonical / og / twitter tags.
  const homeMeta = routeMeta.find((r) => r.path === "/");
  if (homeMeta) {
    const homeHtml = injectNoscript(rewriteHead(indexHtml, homeMeta), homeMeta);
    await writeFile(indexPath, homeHtml, "utf8");
  }

  let written = 0;
  for (const meta of routeMeta) {
    if (meta.path === "/") continue;
    const routeDir = path.join(distDir, meta.path.replace(/^\/+/, ""));
    await mkdir(routeDir, { recursive: true });
    const html = injectNoscript(rewriteHead(indexHtml, meta), meta);
    await writeFile(path.join(routeDir, "index.html"), html, "utf8");
    written++;
  }

  console.log(
    `[prerender-meta] wrote ${written} per-route HTML files into dist/.`,
  );
}

main().catch((err) => {
  console.error("[prerender-meta] failed:", err);
  process.exit(1);
});
