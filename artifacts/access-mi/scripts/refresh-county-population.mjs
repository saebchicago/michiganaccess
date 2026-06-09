#!/usr/bin/env node
/**
 * Refresh `src/data/michigan-county-profiles.ts` populations from
 * the U.S. Census Bureau Population Estimates Program (PEP), Vintage
 * 2024. Replaces unlabeled 2020 decennial counts (e.g. Saginaw
 * 190,124) with the canonical PEP estimate (Saginaw 187,714).
 *
 * Data source: https://www2.census.gov/programs-surveys/popest/
 *   datasets/2020-2024/counties/totals/co-est2024-alldata.csv
 *
 * One vintage, one source, file-wide. Run with --apply to write the
 * file in place; run with --diff (default) to print the planned
 * changes without touching the file.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PEP_URL =
  "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const profilesPath = path.join(
  projectRoot,
  "src/data/michigan-county-profiles.ts",
);

const APPLY = process.argv.includes("--apply");

async function fetchPep() {
  const res = await fetch(PEP_URL, {
    headers: { "user-agent": "accessmi-data-refresh" },
  });
  if (!res.ok) {
    throw new Error(`PEP fetch failed: HTTP ${res.status}`);
  }
  return await res.text();
}

function parseMichigan(csv) {
  const lines = csv.split(/\r?\n/);
  const header = lines[0].split(",");
  const stateIdx = header.indexOf("STATE");
  const countyIdx = header.indexOf("COUNTY");
  const nameIdx = header.indexOf("CTYNAME");
  const popIdx = header.indexOf("POPESTIMATE2024");
  if (stateIdx < 0 || countyIdx < 0 || nameIdx < 0 || popIdx < 0) {
    throw new Error("PEP CSV missing expected columns");
  }
  const out = new Map();
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const cols = line.split(",");
    if (cols[stateIdx] !== "26" || cols[countyIdx] === "000") continue;
    const name = cols[nameIdx].replace(/ County$/, "");
    const pop = Number(cols[popIdx]);
    if (!Number.isFinite(pop)) continue;
    out.set(name, pop);
  }
  return out;
}

async function main() {
  const csv = await fetchPep();
  const pep = parseMichigan(csv);
  if (pep.size !== 83) {
    throw new Error(`Expected 83 Michigan counties, got ${pep.size}`);
  }

  const src = await readFile(profilesPath, "utf8");
  const lines = src.split("\n");
  const changes = [];
  const out = lines.slice();

  const lineRe = /^(\s*)("?[A-Z][A-Za-z'\-\s\.]+?"?):\s+\{\s*population:\s*(\d+),/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(lineRe);
    if (!m) continue;
    const indent = m[1];
    let key = m[2];
    if (key.startsWith('"')) key = key.slice(1, -1);
    const oldPop = Number(m[3]);
    const newPop = pep.get(key);
    if (newPop === undefined) continue;
    if (newPop === oldPop) continue;
    changes.push({ county: key, old: oldPop, new: newPop });
    out[i] = lines[i].replace(
      /population:\s*\d+/,
      `population: ${newPop}`,
    );
  }

  if (changes.length === 0) {
    console.log("[refresh-county-population] no changes — file already at PEP V2024.");
    return;
  }

  changes.sort((a, b) => a.county.localeCompare(b.county));
  console.log(`[refresh-county-population] ${changes.length} counties to update:`);
  for (const c of changes) {
    const delta = c.new - c.old;
    const sign = delta >= 0 ? "+" : "";
    console.log(
      `  ${c.county.padEnd(20)}: ${String(c.old).padStart(8)} -> ${String(c.new).padStart(8)} (${sign}${delta})`,
    );
  }

  if (!APPLY) {
    console.log("\n[refresh-county-population] dry-run (default). Re-run with --apply to write the file.");
    return;
  }

  await writeFile(profilesPath, out.join("\n"), "utf8");
  console.log(`\n[refresh-county-population] wrote ${profilesPath}.`);
}

main().catch((err) => {
  console.error("[refresh-county-population] failed:", err);
  process.exit(1);
});
