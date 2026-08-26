#!/usr/bin/env node
/**
 * Internal-link integrity check.
 *
 * Walks registered routes from src/config/routes.ts plus literal <Route path>
 * entries in App.tsx, Netlify redirects, and every internal href/to reference.
 * This keeps flagship/direct routes under the same dead-link contract as the
 * legacy route table while route configuration is gradually consolidated.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const repoRoot = path.resolve(projectRoot, "..", "..");
const srcDir = path.join(projectRoot, "src");
const routesPath = path.join(srcDir, "config/routes.ts");
const appTsxPath = path.join(srcDir, "App.tsx");
const netlifyTomlPath = path.join(repoRoot, "netlify.toml");

async function collectFiles(root) {
  const { readdir } = await import("node:fs/promises");
  const out = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        if (e.name === "test" || e.name === "__tests__") continue;
        await walk(full);
      } else if (e.isFile() && (full.endsWith(".tsx") || full.endsWith(".ts"))) {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out;
}

function extractRoutePaths(src) {
  const paths = new Set();
  const re = /path:\s*"(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) paths.add(m[1]);
  return paths;
}

function extractAppRoutePaths(src) {
  const paths = new Set();
  const re = /<Route\s+path="(\/[^"]+|\*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1] !== "*") paths.add(m[1]);
  }
  return paths;
}

function extractNavigateSources(src) {
  const sources = new Set();
  const re = /<Route\s+path="(\/[^"]+)"\s+element=\{<Navigate\s+to=/g;
  let m;
  while ((m = re.exec(src)) !== null) sources.add(m[1]);
  return sources;
}

function extractNetlifyRedirects(src) {
  const sources = new Set();
  const re = /from\s*=\s*"(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) sources.add(m[1]);
  return sources;
}

function extractInternalLinks(src) {
  const links = new Set();
  const re = /(?:href|to)\s*=\s*"(\/[^"#?]*)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const p = m[1];
    if (p.length > 0) links.add(p);
  }
  const reObj = /(?:href|to):\s*"(\/[^"#?]*)"/g;
  while ((m = reObj.exec(src)) !== null) links.add(m[1]);
  return links;
}

function matchesPattern(link, routePaths) {
  if (routePaths.has(link)) return true;
  for (const route of routePaths) {
    if (!route.includes(":")) continue;
    const re = new RegExp(
      "^" +
        route
          .split("/")
          .map((seg) => (seg.startsWith(":") ? "[^/]+" : escapeRegExp(seg)))
          .join("/") +
        "$",
    );
    if (re.test(link)) return true;
  }
  return false;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  if (!existsSync(routesPath)) {
    console.error(`[check-links] routes.ts not found at ${routesPath}`);
    process.exit(1);
  }

  const routesSrc = await readFile(routesPath, "utf8");
  const appSrc = await readFile(appTsxPath, "utf8");
  const configRoutePaths = extractRoutePaths(routesSrc);
  const appRoutePaths = extractAppRoutePaths(appSrc);
  const routePaths = new Set([...configRoutePaths, ...appRoutePaths]);
  const navigateSources = extractNavigateSources(appSrc);

  let edgeRedirects = new Set();
  if (existsSync(netlifyTomlPath)) {
    edgeRedirects = extractNetlifyRedirects(await readFile(netlifyTomlPath, "utf8"));
  }

  const validTargets = new Set([...routePaths, ...navigateSources, ...edgeRedirects]);
  validTargets.add("/");

  const files = await collectFiles(srcDir);
  const dead = [];

  const llmsTxtPath = path.join(projectRoot, "public/llms.txt");
  if (existsSync(llmsTxtPath)) {
    const llmsSrc = await readFile(llmsTxtPath, "utf8");
    const mdLinkRe = /\]\((\/[^)#?]*)\)/g;
    let m;
    while ((m = mdLinkRe.exec(llmsSrc)) !== null) {
      const link = m[1];
      if (link === "/" || matchesPattern(link, validTargets)) continue;
      dead.push({ file: "public/llms.txt", link });
    }
  }

  for (const file of files) {
    const src = await readFile(file, "utf8");
    const links = extractInternalLinks(src);
    for (const link of links) {
      if (link === "/") continue;
      if (link.startsWith("/api/") || link.startsWith("/data/")) continue;
      if (link.startsWith("/assets/") || link.startsWith("/favicon")) continue;
      if (link.endsWith(".png") || link.endsWith(".svg") || link.endsWith(".ico")) continue;
      if (link.endsWith(".txt") || link.endsWith(".xml") || link.endsWith(".json")) continue;
      if (link.endsWith(".pdf") || link.endsWith(".csv")) continue;
      if (matchesPattern(link, validTargets)) continue;
      dead.push({ file: path.relative(projectRoot, file), link });
    }
  }

  if (dead.length === 0) {
    console.log(
      `[check-links] ok - ${routePaths.size} routes (${appRoutePaths.size} direct App route(s)), ${navigateSources.size} navigates, ${edgeRedirects.size} netlify redirects; no dead links.`,
    );
    return;
  }

  console.error(`[check-links] FAIL - ${dead.length} dead internal link(s):`);
  for (const d of dead.slice(0, 50)) console.error(`  ${d.file}: ${d.link}`);
  if (dead.length > 50) console.error(`  ... ${dead.length - 50} more`);
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-links] failed:", err);
  process.exit(1);
});
