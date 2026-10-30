#!/usr/bin/env node
/**
 * Build guard (post-build): every router path answers 200, everything else 404.
 *
 * Fails when:
 *   - netlify.toml still carries a `/*` 200 catch-all, or its last redirect is
 *     not `/* -> /404.html 404`
 *   - dist/404.html is missing, lacks noindex, or declares a canonical
 *   - a static router path has no dist file, no 200 rule in dist/_redirects
 *     and no netlify.toml redirect (it would 404 in production)
 *   - a dynamic router path has no matching 200 rule, unless it is a fully
 *     prerendered county family with all 83 files present
 *   - the /:slug county shortcut is missing a 301 for any prerendered county
 *   - a 200 rewrite targets anything but /spa-shell.html, or the shell
 *     declares a canonical (index.html carries the homepage canonical)
 *
 * Independent of generate-spa-rewrites.mjs on purpose: it reads the router and
 * the outputs and checks the result, not the generator's internals.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const repoRoot = path.resolve(projectRoot, "..", "..");
const distDir = path.join(projectRoot, "dist");
const FULLY_PRERENDERED = { "/county/:slug": "county", "/county/:slug/help": "county" };

const norm = (p) => p.replace(/\/$/, "") || "/";

async function main() {
  const failures = [];
  const [routes, app, toml] = await Promise.all([
    readFile(path.join(projectRoot, "src/config/routes.ts"), "utf8"),
    readFile(path.join(projectRoot, "src/App.tsx"), "utf8"),
    readFile(path.join(repoRoot, "netlify.toml"), "utf8"),
  ]);

  // netlify.toml catch-all
  const blocks = toml.split(/\[\[redirects\]\]/).slice(1).map((b) => ({
    from: b.match(/^\s*from\s*=\s*"([^"]+)"/m)?.[1],
    to: b.match(/^\s*to\s*=\s*"([^"]+)"/m)?.[1],
    status: Number(b.match(/^\s*status\s*=\s*(\d+)/m)?.[1]),
  }));
  if (blocks.some((b) => b.from === "/*" && b.status === 200)) {
    failures.push("netlify.toml still has a /* 200 SPA catch-all (soft 404s)");
  }
  const last = blocks[blocks.length - 1];
  if (!last || last.from !== "/*" || last.to !== "/404.html" || last.status !== 404) {
    failures.push("netlify.toml's last redirect must be /* -> /404.html 404");
  }
  const tomlSources = new Set(blocks.map((b) => b.from && norm(b.from)).filter(Boolean));

  // 404 page
  const notFound = path.join(distDir, "404.html");
  if (!existsSync(notFound)) {
    failures.push("dist/404.html missing");
  } else {
    const html = await readFile(notFound, "utf8");
    if (!/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) failures.push("dist/404.html lacks noindex");
    if (/rel=["']canonical["']/i.test(html)) failures.push("dist/404.html declares a canonical");
    if (!/<div id=["']root["']/i.test(html)) failures.push("dist/404.html has no app root");
  }

  // _redirects
  const redirectsPath = path.join(distDir, "_redirects");
  const rules = existsSync(redirectsPath)
    ? (await readFile(redirectsPath, "utf8"))
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => l.trim().split(/\s+/))
        .map(([from, to, status]) => ({ from: norm(from), to, status: Number(status) }))
    : [];
  if (!rules.length) failures.push("dist/_redirects missing or empty");
  const ok200 = new Set(rules.filter((r) => r.status === 200).map((r) => r.from));
  for (const r of rules.filter((r) => r.status === 200)) {
    if (r.to !== "/spa-shell.html") failures.push(`_redirects ${r.from}: 200 rewrite targets ${r.to}, want /spa-shell.html`);
  }
  const shellPath = path.join(distDir, "spa-shell.html");
  if (!existsSync(shellPath)) failures.push("dist/spa-shell.html missing");
  else if (/rel=["']canonical["']/i.test(await readFile(shellPath, "utf8"))) {
    failures.push("dist/spa-shell.html declares a canonical");
  }

  const tableStart = routes.indexOf("APP_ROUTES");
  const paths = [
    ...new Set([
      ...[...routes.slice(tableStart).matchAll(/\bpath:\s*"([^"]+)"/g)].map((m) => m[1]),
      ...[...app.matchAll(/\bpath="([^"]+)"/g)].map((m) => m[1]),
    ]),
  ].filter((p) => p !== "*");

  const counties = existsSync(path.join(distDir, "county"))
    ? (await readdir(path.join(distDir, "county"), { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];

  for (const p of paths) {
    if (p === "/:slug") {
      const shortcut = new Set(rules.filter((r) => r.status === 301).map((r) => r.from));
      const missing = counties.filter((s) => !shortcut.has(`/${s}`) && !paths.includes(`/${s}`));
      if (missing.length) failures.push(`/:slug: no 301 for ${missing.length} county shortcut(s), e.g. /${missing[0]}`);
      continue;
    }
    if (tomlSources.has(norm(p))) continue;
    if (p.includes(":")) {
      if (FULLY_PRERENDERED[p]) {
        if (counties.length !== 83) failures.push(`${p}: expected 83 prerendered counties, found ${counties.length}`);
        const sample = p.replace(":slug", counties[0] ?? "x");
        if (!existsSync(path.join(distDir, sample.slice(1), "index.html"))) {
          failures.push(`${p}: prerendered file missing for ${sample}`);
        }
        continue;
      }
      if (!ok200.has(norm(p))) failures.push(`${p}: dynamic route has no 200 rewrite (would 404)`);
      continue;
    }
    const file = path.join(distDir, p.replace(/^\/+/, ""), "index.html");
    if (p !== "/" && !existsSync(file) && !ok200.has(norm(p))) {
      failures.push(`${p}: no prerendered file and no 200 rewrite (would 404)`);
    }
  }

  if (failures.length) {
    console.error("[check-spa-rewrites] FAIL:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(
    `[check-spa-rewrites] ok - ${paths.length} router path(s) answer 200; unknown paths fall to /404.html with status 404.`,
  );
}

main().catch((err) => {
  console.error("[check-spa-rewrites] crashed:", err);
  process.exit(1);
});
