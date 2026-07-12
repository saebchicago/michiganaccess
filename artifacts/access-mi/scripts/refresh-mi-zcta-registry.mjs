#!/usr/bin/env node
/**
 * Refresh `src/data/mi-zctas.ts` from the Census Bureau 2020 ZCTA-to-County
 * relationship file. Emits the canonical set of Michigan ZCTAs (state FIPS
 * 26), each with its primary MI county (largest area overlap), primary
 * county area fraction, and a flag indicating whether the ZCTA spans more
 * than one Michigan county.
 *
 * The relationship file also feeds refresh-zcta-county-crosswalk.mjs (the
 * full multi-county overlap table for the ~342 split MI ZCTAs). This
 * registry is the "who is a MI ZCTA" question; the crosswalk is the
 * "which counties does it overlap and by how much" question.
 *
 * Source: U.S. Census Bureau, 2020 ZCTA5-County Relationship File
 *   https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
 * Vintage: 2020 (Census does not republish ZCTAs annually; 2020 remains the
 *   current definition until the 2030 decennial).
 * Method: filter rows to state FIPS 26 (Michigan), aggregate by ZCTA5, pick
 *   the county with the largest AREALAND_PART as the primary, record the
 *   fraction of the ZCTA's total AREALAND that lies in that county.
 *
 * Weighting caveat: this file is AREA-weighted, not population-weighted.
 *   HUD publishes a population-weighted USPS crosswalk but it requires an
 *   auth token; Census's own file is public and vintage-aligned with the
 *   rest of the AccessMI Census/PEP stack. Every consumer of a fractional
 *   overlap value must render it as "area-weighted" in provenance.
 *
 * Run with --apply to write the file; without --apply the script prints a
 * summary + first 5 entries and exits.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import https from "node:https";
import { createManifestEntry, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const fipsPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outPath = path.join(projectRoot, "src/data/mi-zctas.ts");

const APPLY = process.argv.includes("--apply");
const MI_STATE_FIPS = "26";
const REL_URL =
  "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt";
const VINTAGE = "2020 Census ZCTA5-County Relationship File";
// Distinct source_id from refresh-zcta-county-crosswalk.mjs even though
// both scripts fetch this same URL - see that script's comment for why.
const ZCTA_REGISTRY_SOURCE_ID = "census-zcta-county-relationship-2020";
const manifestEntries = [];
const BUILD_ID = `refresh-mi-zcta-registry-${new Date().toISOString().replace(/[:.]/g, "-")}`;

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
  // Rebuild a 5-digit-FIPS -> county-name lookup by reading MI_COUNTY_FIPS
  // out of census-geographies.ts. Never edit that file; only read it.
  const src = await readFile(fipsPath, "utf8");
  const block = src.match(
    /MI_COUNTY_FIPS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/,
  );
  if (!block) throw new Error("Could not locate MI_COUNTY_FIPS block");
  const byFips = new Map();
  for (const m of block[1].matchAll(/"?([A-Za-z'\.\- ]+?)"?\s*:\s*"(\d{3})"/g)) {
    const name = m[1].trim();
    const full = `${MI_STATE_FIPS}${m[2]}`;
    byFips.set(full, name);
  }
  if (byFips.size !== 83) {
    throw new Error(`Expected 83 MI counties, parsed ${byFips.size}`);
  }
  return byFips;
}

function parseRelationshipFile(text, countyByFips) {
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

  // First pass: aggregate ALL ZCTA-county intersection rows keyed by ZCTA5,
  // keeping both MI and non-MI parts so we can (a) row-conserve the sum
  // against the ZCTA's total AREALAND (Census's own invariant) and (b) tell
  // a "mostly-MI" ZCTA from a "mostly-out-of-state" ZCTA that happens to
  // graze the border.
  const byZcta = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = line.split("|");
    const zcta = cols[idx.zcta5];
    if (!zcta) continue;
    const countyFips = cols[idx.countyGeoid];
    if (!countyFips) continue;
    const zctaAreaLand = Number(cols[idx.zctaAreaLand]);
    const areaLandPart = Number(cols[idx.areaLandPart]);
    if (!Number.isFinite(zctaAreaLand) || !Number.isFinite(areaLandPart)) continue;
    if (!byZcta.has(zcta)) {
      byZcta.set(zcta, { zctaAreaLandM2: zctaAreaLand, allParts: [], miParts: [] });
    }
    const entry = byZcta.get(zcta);
    entry.allParts.push({ countyFips, areaLandPart });
    if (countyFips.slice(0, 2) === MI_STATE_FIPS) {
      const countyName = countyByFips.get(countyFips);
      if (!countyName) {
        throw new Error(
          `Unknown MI county FIPS "${countyFips}" for ZCTA ${zcta} - census-geographies.ts drift?`,
        );
      }
      entry.miParts.push({ countyName, countyFips, areaLandPart });
    }
  }

  // Second pass: pick ZCTAs whose MAJORITY of AREALAND is in Michigan.
  // Row-conserve the parts sum against the ZCTA total (Census invariant).
  const rows = [];
  for (const [zcta, data] of byZcta) {
    if (data.miParts.length === 0) continue;
    const allSum = data.allParts.reduce((s, p) => s + p.areaLandPart, 0);
    if (Math.abs(allSum - data.zctaAreaLandM2) > 2) {
      throw new Error(
        `Area parts do not sum to ZCTA total for ${zcta}: parts=${allSum} vs total=${data.zctaAreaLandM2}`,
      );
    }
    const miSum = data.miParts.reduce((s, p) => s + p.areaLandPart, 0);
    const miFraction = data.zctaAreaLandM2 > 0 ? miSum / data.zctaAreaLandM2 : 0;
    // Majority-MI test: a ZCTA that grazes the Michigan border with less
    // than half its area in-state is not a MI ZCTA for platform purposes.
    if (miFraction <= 0.5) continue;
    const miSorted = [...data.miParts].sort(
      (a, b) => b.areaLandPart - a.areaLandPart,
    );
    const primary = miSorted[0];
    rows.push({
      zcta5: zcta,
      primaryCountyName: primary.countyName,
      primaryCountyFips: primary.countyFips,
      primaryCountyAreaFraction:
        data.zctaAreaLandM2 > 0 ? primary.areaLandPart / data.zctaAreaLandM2 : 0,
      spansMiCounties: miSorted.length > 1,
      zctaAreaLandM2: data.zctaAreaLandM2,
      overlappingMiCountyCount: miSorted.length,
      miAreaFraction: miFraction,
    });
  }
  rows.sort((a, b) => a.zcta5.localeCompare(b.zcta5));
  return rows;
}

function buildFile(rows) {
  const zctaTotal = rows.length;
  const splitTotal = rows.filter((r) => r.spansMiCounties).length;
  const crossState = rows.filter((r) => r.miAreaFraction < 0.999).length;
  const entries = rows
    .map((r) => {
      const frac = r.primaryCountyAreaFraction.toFixed(4);
      const miFrac = r.miAreaFraction.toFixed(4);
      return `  "${r.zcta5}": { primaryCountyName: ${JSON.stringify(r.primaryCountyName)}, primaryCountyFips: "${r.primaryCountyFips}", primaryCountyAreaFraction: ${frac}, spansMiCounties: ${r.spansMiCounties}, zctaAreaLandM2: ${r.zctaAreaLandM2}, overlappingMiCountyCount: ${r.overlappingMiCountyCount}, miAreaFraction: ${miFrac} },`;
    })
    .join("\n");
  return `/**
 * Generated by scripts/refresh-mi-zcta-registry.mjs. Do not edit by hand.
 * Re-run the script to regenerate.
 *
 * The canonical set of Michigan ZCTAs, defined as ZCTAs whose majority of
 * land area lies in Michigan (state FIPS 26) per the Census 2020 ZCTA-to-
 * County relationship file. Each entry records its primary MI county
 * (largest area overlap), the fraction of the ZCTA that lies in that
 * primary county, a flag indicating whether the ZCTA spans more than one
 * MI county, and the fraction of the ZCTA that lies in Michigan overall
 * (< 1.0 for border ZCTAs that cross into WI, IN, OH, or Canada).
 *
 * Source: U.S. Census Bureau, 2020 ZCTA5-County Relationship File
 *   https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
 * Vintage: ${VINTAGE}. Census does not republish ZCTAs annually; the 2020
 *   definition remains current until the 2030 decennial.
 *
 * Weighting: AREA-weighted, not population-weighted. Every consumer of
 *   primaryCountyAreaFraction must render it as "area-weighted" in
 *   provenance. HUD publishes a population-weighted crosswalk under
 *   auth; a future refresh may layer that in as an alternate mapping.
 *
 * Membership rule: a ZCTA is included iff its miAreaFraction > 0.5 (more
 *   than half its land area is inside Michigan). ZCTAs that graze the
 *   border with a minority MI overlap are excluded from the registry.
 *
 * Aggregation totals captured at generation time:
 *   Michigan ZCTAs (majority in MI): ${zctaTotal}
 *   ZCTAs that span >1 MI county:    ${splitTotal}
 *   ZCTAs with any cross-state land: ${crossState}
 */

export interface MiZctaEntry {
  /** MI county name whose area overlap with this ZCTA is largest. */
  primaryCountyName: string;
  /** 5-digit county FIPS (state FIPS 26 + 3-digit county), e.g. "26163". */
  primaryCountyFips: string;
  /**
   * Fraction of the ZCTA's total land area that lies in primaryCountyName.
   * Range (0, 1]. 1.0 iff the ZCTA is wholly inside one MI county.
   */
  primaryCountyAreaFraction: number;
  /** True iff the ZCTA overlaps more than one MI county. */
  spansMiCounties: boolean;
  /** ZCTA total AREALAND in square meters (from the relationship file). */
  zctaAreaLandM2: number;
  /** Number of MI counties this ZCTA overlaps. */
  overlappingMiCountyCount: number;
  /**
   * Fraction of the ZCTA's total AREALAND that lies inside Michigan.
   * < 1.0 for border ZCTAs that also touch WI, IN, OH, or Canada.
   * Always > 0.5 by the registry's own membership rule.
   */
  miAreaFraction: number;
}

export const MI_ZCTAS: Record<string, MiZctaEntry> = {
${entries}
};

/** Full list of MI ZCTA5 codes, sorted. */
export const MI_ZCTA_CODES: readonly string[] = Object.keys(MI_ZCTAS);

/** True iff a ZCTA5 is a Michigan ZCTA per the 2020 Census relationship file. */
export function isMiZcta(zcta5: string): boolean {
  return zcta5 in MI_ZCTAS;
}
`;
}

async function fetchTextWithManifest() {
  try {
    const text = await fetchText(REL_URL);
    manifestEntries.push(
      createManifestEntry({
        sourceId: ZCTA_REGISTRY_SOURCE_ID,
        url: REL_URL,
        status: 200,
        contentType: "text/plain",
        payload: text,
        vintage: VINTAGE,
        valid: true,
      }),
    );
    return text;
  } catch (err) {
    const statusMatch = /^HTTP (\d+)/.exec(err.message);
    manifestEntries.push(
      createManifestEntry({
        sourceId: ZCTA_REGISTRY_SOURCE_ID,
        url: REL_URL,
        status: statusMatch ? Number(statusMatch[1]) : null,
        contentType: null,
        payload: "",
        vintage: VINTAGE,
        valid: false,
        invalidReason: err.message,
      }),
    );
    throw err;
  }
}

async function main() {
  console.log(`[refresh-mi-zcta-registry] fetching ${REL_URL}...`);
  const text = await fetchTextWithManifest();
  console.log(
    `[refresh-mi-zcta-registry] got ${(text.length / 1024 / 1024).toFixed(1)} MB text`,
  );
  const countyByFips = await loadCountyLookup();
  const rows = parseRelationshipFile(text, countyByFips);

  const spans = rows.filter((r) => r.spansMiCounties).length;
  const crossState = rows.filter((r) => r.miAreaFraction < 0.999).length;
  console.log(
    `[refresh-mi-zcta-registry] parsed ${rows.length} MI ZCTAs (majority-in-MI), ${spans} span >1 MI county, ${crossState} have cross-state area`,
  );
  console.log("[refresh-mi-zcta-registry] first 5 entries:");
  for (const r of rows.slice(0, 5)) {
    console.log(
      `  ${r.zcta5}  ${r.primaryCountyName.padEnd(15)}  primary=${r.primaryCountyAreaFraction.toFixed(4)}  MI=${r.miAreaFraction.toFixed(4)}  spans=${r.spansMiCounties}`,
    );
  }

  if (rows.length < 900 || rows.length > 1100) {
    throw new Error(
      `Sanity: MI ZCTA count ${rows.length} is outside expected 900-1100 band`,
    );
  }

  const content = buildFile(rows);

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({
      projectRoot,
      buildId: BUILD_ID,
      entries: manifestEntries,
    });
    console.log(`[refresh-mi-zcta-registry] archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }

  if (!APPLY) {
    console.log(
      `\n[refresh-mi-zcta-registry] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outPath)}.`,
    );
    return;
  }
  await writeFile(outPath, content, "utf8");
  console.log(
    `\n[refresh-mi-zcta-registry] wrote ${path.relative(projectRoot, outPath)} (${rows.length} entries).`,
  );
}

main().catch(async (err) => {
  console.error("[refresh-mi-zcta-registry] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({
        projectRoot,
        buildId: BUILD_ID,
        entries: manifestEntries,
      });
      console.error(
        `[refresh-mi-zcta-registry] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`,
      );
    } catch (manifestErr) {
      console.error("[refresh-mi-zcta-registry] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
