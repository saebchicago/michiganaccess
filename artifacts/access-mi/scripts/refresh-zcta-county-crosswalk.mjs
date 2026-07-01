#!/usr/bin/env node
/**
 * Refresh `src/data/zcta-county-crosswalk.ts` from the Census 2020 ZCTA-to-
 * County relationship file. Emits every ZCTA-to-MI-county overlap for the
 * Michigan ZCTAs already in the registry (src/data/mi-zctas.ts), with each
 * overlap's area fraction so downstream consumers can allocate a ZCTA-scale
 * measure proportionally into counties.
 *
 * Why a separate file from mi-zctas.ts: the registry answers "which ZCTAs
 * are MI, and what is their primary county?"; the crosswalk answers "for a
 * given ZCTA, exactly how does its area split across MI counties?" The 342
 * split ZCTAs are the reason the second question is not trivially the first.
 *
 * Source: U.S. Census Bureau, 2020 ZCTA5-County Relationship File
 *   https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
 * Vintage: 2020 Census ZCTA5-County Relationship File.
 * Weighting: AREA-weighted, not population-weighted.
 *
 * Run with --apply to write the file; without --apply the script prints a
 * summary + first 8 crosswalk rows and exits.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import https from "node:https";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const fipsPath = path.join(projectRoot, "src/data/census-geographies.ts");
const registryPath = path.join(projectRoot, "src/data/mi-zctas.ts");
const outPath = path.join(projectRoot, "src/data/zcta-county-crosswalk.ts");

const APPLY = process.argv.includes("--apply");
const MI_STATE_FIPS = "26";
const REL_URL =
  "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt";
const VINTAGE = "2020 Census ZCTA5-County Relationship File";

function fetchText(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "http:" ? http : https;
    const req = lib.get(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + (u.search || ""),
        headers: {
          "user-agent": "accessmi-data-refresh",
          accept: "*/*",
          connection: "close",
        },
      },
      (res) => {
        if (
          (res.statusCode === 301 || res.statusCode === 302) &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          res.resume();
          resolve(
            fetchText(new URL(res.headers.location, url).toString(), redirectsLeft - 1),
          );
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve(Buffer.concat(chunks).toString("utf8").replace(/^﻿/, "")),
        );
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error(`timeout fetching ${url}`)));
  });
}

async function loadCountyLookup() {
  const src = await readFile(fipsPath, "utf8");
  const block = src.match(
    /MI_COUNTY_FIPS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/,
  );
  if (!block) throw new Error("Could not locate MI_COUNTY_FIPS block");
  const byFips = new Map();
  for (const m of block[1].matchAll(/"?([A-Za-z'\.\- ]+?)"?\s*:\s*"(\d{3})"/g)) {
    byFips.set(`${MI_STATE_FIPS}${m[2]}`, m[1].trim());
  }
  if (byFips.size !== 83) {
    throw new Error(`Expected 83 MI counties, parsed ${byFips.size}`);
  }
  return byFips;
}

async function loadMiZctaSet() {
  const src = await readFile(registryPath, "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/^\s*"(\d{5})":\s*\{/gm)) {
    keys.add(m[1]);
  }
  if (keys.size === 0) {
    throw new Error(
      "No ZCTAs parsed from mi-zctas.ts; run refresh-mi-zcta-registry.mjs first",
    );
  }
  return keys;
}

function parseCrosswalk(text, miZctas, countyByFips) {
  const lines = text.split(/\r?\n/);
  const header = lines[0].split("|");
  const idx = {
    zcta5: header.indexOf("GEOID_ZCTA5_20"),
    zctaAreaLand: header.indexOf("AREALAND_ZCTA5_20"),
    countyGeoid: header.indexOf("GEOID_COUNTY_20"),
    areaLandPart: header.indexOf("AREALAND_PART"),
  };
  for (const [k, v] of Object.entries(idx)) {
    if (v < 0) throw new Error(`Missing header column: ${k}`);
  }

  const rows = new Map(); // zcta -> [{ countyName, countyFips, areaFraction }]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = line.split("|");
    const zcta = cols[idx.zcta5];
    if (!zcta || !miZctas.has(zcta)) continue;
    const countyFips = cols[idx.countyGeoid];
    if (!countyFips || countyFips.slice(0, 2) !== MI_STATE_FIPS) continue;
    const countyName = countyByFips.get(countyFips);
    if (!countyName) {
      throw new Error(
        `Unknown MI county FIPS "${countyFips}" for ZCTA ${zcta} - census-geographies.ts drift?`,
      );
    }
    const zctaAreaLand = Number(cols[idx.zctaAreaLand]);
    const areaLandPart = Number(cols[idx.areaLandPart]);
    if (!Number.isFinite(zctaAreaLand) || zctaAreaLand <= 0) continue;
    if (!Number.isFinite(areaLandPart) || areaLandPart <= 0) continue;
    const areaFraction = areaLandPart / zctaAreaLand;
    if (!rows.has(zcta)) rows.set(zcta, []);
    rows.get(zcta).push({ countyName, countyFips, areaFraction });
  }

  // Sort each ZCTA's parts by fraction desc so the primary is first.
  for (const parts of rows.values()) {
    parts.sort((a, b) => b.areaFraction - a.areaFraction);
  }
  // Verify every MI ZCTA is present.
  for (const zcta of miZctas) {
    if (!rows.has(zcta)) {
      throw new Error(`Crosswalk missing MI ZCTA ${zcta}`);
    }
  }
  return rows;
}

function buildFile(rows) {
  const zctaTotal = rows.size;
  let splitTotal = 0;
  let overlapRowTotal = 0;
  const sortedZctas = [...rows.keys()].sort();
  const entries = [];
  for (const zcta of sortedZctas) {
    const parts = rows.get(zcta);
    if (parts.length > 1) splitTotal++;
    overlapRowTotal += parts.length;
    const inner = parts
      .map(
        (p) =>
          `{ countyName: ${JSON.stringify(p.countyName)}, countyFips: "${p.countyFips}", areaFraction: ${p.areaFraction.toFixed(4)} }`,
      )
      .join(", ");
    entries.push(`  "${zcta}": [${inner}],`);
  }
  return `/**
 * Generated by scripts/refresh-zcta-county-crosswalk.mjs. Do not edit by hand.
 * Re-run the script to regenerate.
 *
 * Full ZCTA-to-MI-county area-weighted crosswalk. For every MI ZCTA in
 * src/data/mi-zctas.ts, this file lists the MI counties it overlaps and
 * the fraction of the ZCTA's total AREALAND that lies in each. The parts
 * are sorted by fraction desc (largest first, so \`crosswalk[zcta][0]\` is
 * always the primary county).
 *
 * Source: U.S. Census Bureau, 2020 ZCTA5-County Relationship File
 *   https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
 * Vintage: ${VINTAGE}. Static until the 2030 decennial.
 *
 * Weighting: AREA-weighted, not population-weighted. Consumers rendering
 *   ZCTA-scale measures allocated into counties MUST label the
 *   allocation as area-weighted in provenance. A future population-
 *   weighted variant would come from HUD's USPS crosswalk (requires
 *   an auth token) and would replace, not augment, this file.
 *
 * Aggregation totals captured at generation time:
 *   MI ZCTAs in crosswalk:    ${zctaTotal}
 *   ZCTAs that span >1 MI county: ${splitTotal}
 *   Total ZCTA-county rows:   ${overlapRowTotal}
 */

export interface ZctaCountyOverlap {
  /** MI county name. */
  countyName: string;
  /** 5-digit county FIPS (state FIPS 26 + 3-digit county), e.g. "26163". */
  countyFips: string;
  /**
   * Fraction of the ZCTA's total land area that lies in countyName.
   * Range (0, 1]. Sum across a ZCTA's overlaps equals its miAreaFraction
   * from mi-zctas.ts (< 1.0 for cross-state ZCTAs, else exactly 1.0).
   */
  areaFraction: number;
}

export const ZCTA_COUNTY_CROSSWALK: Record<string, ZctaCountyOverlap[]> = {
${entries.join("\n")}
};

/**
 * Return the primary MI county for a ZCTA (largest area overlap), or null
 * if the ZCTA is not in the MI registry. Equivalent to reading the primary
 * fields from mi-zctas.ts, provided here for call-site convenience.
 */
export function getPrimaryCountyForZcta(
  zcta5: string,
): ZctaCountyOverlap | null {
  const parts = ZCTA_COUNTY_CROSSWALK[zcta5];
  return parts && parts.length > 0 ? parts[0] : null;
}
`;
}

async function main() {
  const countyByFips = await loadCountyLookup();
  const miZctas = await loadMiZctaSet();
  console.log(
    `[refresh-zcta-county-crosswalk] loaded ${miZctas.size} MI ZCTAs from registry`,
  );
  console.log(`[refresh-zcta-county-crosswalk] fetching ${REL_URL}...`);
  const text = await fetchText(REL_URL);
  console.log(
    `[refresh-zcta-county-crosswalk] got ${(text.length / 1024 / 1024).toFixed(1)} MB text`,
  );
  const rows = parseCrosswalk(text, miZctas, countyByFips);

  let splitTotal = 0;
  let overlapRowTotal = 0;
  for (const parts of rows.values()) {
    if (parts.length > 1) splitTotal++;
    overlapRowTotal += parts.length;
  }
  console.log(
    `[refresh-zcta-county-crosswalk] parsed ${rows.size} ZCTAs, ${splitTotal} span >1 county, ${overlapRowTotal} total overlap rows`,
  );
  console.log("[refresh-zcta-county-crosswalk] first 8 split-ZCTA overlaps:");
  let printed = 0;
  for (const [zcta, parts] of rows) {
    if (parts.length <= 1) continue;
    console.log(
      `  ${zcta}: ${parts.map((p) => `${p.countyName} ${p.areaFraction.toFixed(3)}`).join(" | ")}`,
    );
    if (++printed >= 8) break;
  }

  if (rows.size !== miZctas.size) {
    throw new Error(
      `Crosswalk row count ${rows.size} != registry size ${miZctas.size}`,
    );
  }

  const content = buildFile(rows);
  if (!APPLY) {
    console.log(
      `\n[refresh-zcta-county-crosswalk] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outPath)}.`,
    );
    return;
  }
  await writeFile(outPath, content, "utf8");
  console.log(
    `\n[refresh-zcta-county-crosswalk] wrote ${path.relative(projectRoot, outPath)}.`,
  );
}

main().catch((err) => {
  console.error("[refresh-zcta-county-crosswalk] failed:", err);
  process.exit(1);
});
