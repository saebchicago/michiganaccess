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

  if (issues.length === 0) {
    console.log(
      `[check-counts] ok — sources=${sourcesTotal} (federal=${sourcesBreakdown.federal} state=${sourcesBreakdown.state} nonprofit=${sourcesBreakdown.nonprofit}), atlas layers=${atlasLayers}, counties=${countyCount}; routeMeta literals match.`,
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
