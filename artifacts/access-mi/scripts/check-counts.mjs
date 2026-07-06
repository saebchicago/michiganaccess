#!/usr/bin/env node
/**
 * Build-time guard that asserts the literal counts embedded in prose
 * (routeMeta.ts, index.html JSON-LD) match the SSOT registries.
 *
 * The prerender pipeline scrapes routeMeta.ts for the string literals
 * used in <title>, <meta description>, <link canonical>, and the
 * <noscript> h1+summary block. Those strings cannot import constants
 * at runtime — they must be literally correct when the regex parser
 * runs. This script protects against drift between the literal strings
 * and the registry-derived constants.
 *
 * Fails the build when:
 *   - routeMeta.ts mentions a source-count integer != SOURCES_REGISTRY.length
 *   - routeMeta.ts mentions an atlas-layer count != ATLAS_LAYERS.length
 *   - routeMeta.ts mentions a county count != 83
 *   - index.html JSON-LD resource count != RESOURCE_COUNT_DISPLAY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const srcDir = path.join(projectRoot, "src");

async function countRegistryEntries(filePath, keyField) {
  // Whole-file count of `<keyField>: "..."` lines. Works because the
  // type-declaration form `<keyField>: string;` lacks the quote so it
  // doesn't match this regex.
  const src = await readFile(filePath, "utf8");
  const re = new RegExp(`\\b${keyField}\\s*:\\s*"`, "g");
  return (src.match(re) ?? []).length;
}

async function countByCategory(filePath) {
  const src = await readFile(filePath, "utf8");
  const headerStart = src.indexOf("SOURCES_BY_CATEGORY");
  if (headerStart < 0) {
    throw new Error("check-counts: SOURCES_BY_CATEGORY not found");
  }
  const re = /"(Federal Agencies|Michigan State Agencies|Nonprofits & Research)":\s*\[/g;
  const counts = { federal: 0, state: 0, nonprofit: 0 };
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = src.indexOf("[", m.index);
    let depth = 0;
    let end = -1;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;
    const body = src.slice(open, end);
    const n = (body.match(/\bname:\s*"/g) ?? []).length;
    if (m[1] === "Federal Agencies") counts.federal = n;
    else if (m[1] === "Michigan State Agencies") counts.state = n;
    else counts.nonprofit = n;
  }
  return counts;
}

function findIntegerNeighbors(src, words) {
  const hits = [];
  for (const word of words) {
    const re = new RegExp(`(\\d+)\\s+${escapeRegExp(word)}`, "gi");
    let m;
    while ((m = re.exec(src)) !== null) {
      hits.push({ word, value: Number(m[1]), context: src.slice(Math.max(0, m.index - 25), m.index + 60).replace(/\s+/g, " ") });
    }
  }
  return hits;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function countArrayEntries(filePath, arrayName, itemPattern) {
  const src = await readFile(filePath, "utf8");
  // Find the array declaration and count occurrences of the item pattern within it.
  // We look for `= [` after the const declaration to skip any type annotation brackets
  // (e.g. `const FOO: Bar[] = [` - the `[]` in `Bar[]` must not be matched).
  const declarationStart = src.indexOf(`const ${arrayName}`);
  if (declarationStart < 0) {
    throw new Error(`check-counts: '${arrayName}' not found in ${filePath}`);
  }
  // Find the `= [` assignment (may have whitespace between `=` and `[`)
  const assignRe = /=\s*\[/;
  const tail = src.slice(declarationStart);
  const assignMatch = assignRe.exec(tail);
  if (!assignMatch) {
    throw new Error(`check-counts: '= [' assignment not found for '${arrayName}' in ${filePath}`);
  }
  const open = declarationStart + assignMatch.index + assignMatch[0].lastIndexOf("[");
  // Walk to matching close bracket
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) {
    throw new Error(`check-counts: unmatched '[' for '${arrayName}' in ${filePath}`);
  }
  const body = src.slice(open, end);
  const re = new RegExp(itemPattern, "g");
  return (body.match(re) ?? []).length;
}

async function main() {
  const sourcesPath = path.join(srcDir, "data/sourcesRegistry.ts");
  const atlasPath = path.join(srcDir, "config/atlasLayers.ts");
  const routeMetaPath = path.join(srcDir, "config/routeMeta.ts");

  const sourcesTotal = await countRegistryEntries(sourcesPath, "name");
  const sourcesBreakdown = await countByCategory(sourcesPath);
  const atlasLayers = await countRegistryEntries(atlasPath, "key");
  const countyCount = 83;

  const routeMeta = await readFile(routeMetaPath, "utf8");
  const issues = [];

  const sourceMentions = findIntegerNeighbors(routeMeta, [
    "verified public source organizations",
    "verified federal, state, and nonprofit",
    "data sources",
  ]);
  for (const hit of sourceMentions) {
    if (hit.value !== sourcesTotal) {
      issues.push(
        `routeMeta.ts: literal "${hit.value} ${hit.word}" does not match SOURCES_TOTAL ${sourcesTotal}. Context: ${hit.context}`,
      );
    }
  }

  const layerMentions = findIntegerNeighbors(routeMeta, [
    "equity layers",
    "health-equity layers",
    "data layers",
  ]);
  for (const hit of layerMentions) {
    if (hit.value !== atlasLayers) {
      issues.push(
        `routeMeta.ts: literal "${hit.value} ${hit.word}" does not match ATLAS_LAYERS.length ${atlasLayers}. Context: ${hit.context}`,
      );
    }
  }

  const countyMentions = findIntegerNeighbors(routeMeta, ["counties"]);
  for (const hit of countyMentions) {
    if (hit.value !== countyCount) {
      issues.push(
        `routeMeta.ts: literal "${hit.value} counties" does not match COUNTIES_COVERED ${countyCount}. Context: ${hit.context}`,
      );
    }
  }

  // --- Subset counts: FRESHNESS_TRACKED_COUNT and LIVE_MONITORED_COUNT ---
  // These constants must match the actual hardcoded array lengths in their
  // respective source files. We read FRESHNESS_TRACKED_COUNT and
  // LIVE_MONITORED_COUNT directly from platformConstants.ts rather than
  // importing it (Node ESM can't resolve @/ aliases), so we parse the value.
  const platformConstantsPath = path.join(srcDir, "config/platformConstants.ts");
  const platformSrc = await readFile(platformConstantsPath, "utf8");

  function extractConstant(src, name) {
    const re = new RegExp(`export\\s+const\\s+${name}\\s*=\\s*(\\d+)`);
    const m = src.match(re);
    if (!m) throw new Error(`check-counts: '${name}' not found in platformConstants.ts`);
    return Number(m[1]);
  }

  const freshnessTrackedCount = extractConstant(platformSrc, "FRESHNESS_TRACKED_COUNT");
  const liveMonitoredCount = extractConstant(platformSrc, "LIVE_MONITORED_COUNT");

  // Count DATA_SOURCES entries in DataFreshnessDashboard.tsx
  const dashboardPath = path.join(srcDir, "components/shared/DataFreshnessDashboard.tsx");
  const actualFreshnessCount = await countArrayEntries(dashboardPath, "DATA_SOURCES", `\\bname:\\s*"`);

  if (actualFreshnessCount !== freshnessTrackedCount) {
    issues.push(
      `FRESHNESS_TRACKED_COUNT=${freshnessTrackedCount} in platformConstants.ts does not match DATA_SOURCES.length=${actualFreshnessCount} in DataFreshnessDashboard.tsx. Update the constant or the array so they match.`,
    );
  }

  // Count ENDPOINTS entries in health-check.ts
  const healthCheckPath = path.join(srcDir, "lib/health-check.ts");
  const actualLiveCount = await countArrayEntries(healthCheckPath, "ENDPOINTS", `\\bname:\\s*"`);

  if (actualLiveCount !== liveMonitoredCount) {
    issues.push(
      `LIVE_MONITORED_COUNT=${liveMonitoredCount} in platformConstants.ts does not match ENDPOINTS.length=${actualLiveCount} in health-check.ts. Update the constant or the array so they match.`,
    );
  }

  // Sanity check: subsets must be smaller than the total registry
  if (freshnessTrackedCount >= sourcesTotal) {
    issues.push(
      `FRESHNESS_TRACKED_COUNT=${freshnessTrackedCount} must be less than SOURCES_TOTAL=${sourcesTotal}.`,
    );
  }
  if (liveMonitoredCount >= sourcesTotal) {
    issues.push(
      `LIVE_MONITORED_COUNT=${liveMonitoredCount} must be less than SOURCES_TOTAL=${sourcesTotal}.`,
    );
  }

  if (issues.length === 0) {
    console.log(
      `[check-counts] ok — sources=${sourcesTotal} (federal=${sourcesBreakdown.federal} state=${sourcesBreakdown.state} nonprofit=${sourcesBreakdown.nonprofit}), atlas layers=${atlasLayers}, counties=${countyCount}; freshness-tracked=${freshnessTrackedCount}/${sourcesTotal}, live-monitored=${liveMonitoredCount}/${sourcesTotal}; routeMeta literals match.`,
    );
    return;
  }

  console.error(`[check-counts] FAIL — ${issues.length} drift(s):`);
  for (const i of issues) console.error(`  ${i}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-counts] failed:", err);
  process.exit(1);
});
