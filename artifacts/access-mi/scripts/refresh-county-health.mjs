#!/usr/bin/env node
/**
 * Refresh `src/data/michigan-county-profiles.ts` health values from
 * the County Health Rankings 2025 ORIGINAL release. Replaces stale
 * health figures that were labeled "2025" but actually came from an
 * older CHR vintage. Mirrors the structure of refresh-county-population.mjs.
 *
 * Data sources (one coherent snapshot, all three measures, all 83 MI counties):
 *   Uninsured        - CHR measure 85  (Census SAHIE 2022)
 *   PCP ratio        - CHR measure 4   (HRSA AHRF 2021 / AMA)
 *   Food insecurity  - CHR measure 139 (Feeding America Map the Meal Gap 2022,
 *                                       a modeled estimate, not a primary
 *                                       federal source)
 *
 * Endpoints:
 *   https://api.countyhealthrankings.org/measures/2025/26/000/{measure_id}
 *
 * One vintage, one source, file-wide. Run with --apply to write the
 * file in place; run without (default) to print the planned changes
 * and emit a verification table without touching the file.
 *
 * Trend arrows policy: for any measure whose value changes in this
 * regen, the trend arrow argument is dropped rather than carried
 * forward from an old, now-wrong value. An unsourced trend is a
 * fabrication. Trends are only preserved when the underlying value
 * is unchanged.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const profilesPath = path.join(
  projectRoot,
  "src/data/michigan-county-profiles.ts",
);
const fipsPath = path.join(projectRoot, "src/data/census-geographies.ts");

const APPLY = process.argv.includes("--apply");

const STATE_FIPS = "26";
const RELEASE_YEAR = "2025";

const MEASURES = {
  uninsured: {
    id: 85,
    label: "Uninsured",
    expectedSourceYears: "2022",
    expectedSystem: "Small Area Health Insurance Estimates",
    format: "percent",
  },
  pcp: {
    id: 4,
    label: "Primary Care Physicians",
    expectedSourceYears: "2021",
    expectedSystem: "Area Health Resource File/American Medical Association",
    format: "ratio",
  },
  food: {
    id: 139,
    label: "Food Insecurity",
    expectedSourceYears: "2022",
    expectedSystem: "Map the Meal Gap",
    format: "percent",
  },
};

const manifestEntries = [];
const BUILD_ID = `refresh-county-health-${new Date().toISOString().replace(/[:.]/g, "-")}`;

async function fetchMeasure(key) {
  const measureId = MEASURES[key].id;
  const url = `https://api.countyhealthrankings.org/measures/${RELEASE_YEAR}/${STATE_FIPS}/000/${measureId}`;
  const text = await fetchAndRecord({
    sourceId: `chr-county-health-${key}-${RELEASE_YEAR}`,
    url,
    headers: { "user-agent": "accessmi-data-refresh" },
    vintage: MEASURES[key].expectedSourceYears,
    minBytes: 100,
    entries: manifestEntries,
  });
  return JSON.parse(text);
}

function rowsByFips(measureJson) {
  const rows = measureJson?.tabs?.data?.rows;
  if (!rows || typeof rows !== "object") {
    throw new Error("CHR response missing tabs.data.rows");
  }
  const out = new Map();
  for (const [fipsKey, cells] of Object.entries(rows)) {
    if (!fipsKey.startsWith(`${STATE_FIPS}_`)) continue;
    const countyFips = fipsKey.slice(STATE_FIPS.length + 1);
    let raw = null;
    for (const cell of cells) {
      if (cell?.table_field === "raw_value") {
        raw = cell.raw;
        break;
      }
    }
    out.set(countyFips, raw);
  }
  return out;
}

function assertDatasource(measureJson, key) {
  const ds = measureJson?.tabs?.datasource;
  const cfg = MEASURES[key];
  if (!ds) {
    throw new Error(`CHR response for ${key} missing tabs.datasource`);
  }
  if (String(ds.id) !== String(cfg.id)) {
    throw new Error(
      `CHR ${key} datasource id mismatch: expected ${cfg.id}, got ${ds.id}`,
    );
  }
  if (ds.years !== cfg.expectedSourceYears) {
    throw new Error(
      `CHR ${key} source years mismatch: expected ${cfg.expectedSourceYears}, got ${ds.years}`,
    );
  }
  if (ds.system_name !== cfg.expectedSystem) {
    throw new Error(
      `CHR ${key} source system mismatch: expected ${cfg.expectedSystem}, got ${ds.system_name}`,
    );
  }
}

function formatPercent(raw) {
  if (raw === null || raw === undefined || raw === "") return "-";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "-";
  const rounded = Math.round(n * 10) / 10;
  return `${rounded.toFixed(1)}%`;
}

function formatRatio(raw) {
  if (raw === null || raw === undefined || raw === "") return "-";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "-";
  return `${Math.round(n).toLocaleString("en-US")}:1`;
}

async function loadFipsMap() {
  const src = await readFile(fipsPath, "utf8");
  const block = src.match(
    /MI_COUNTY_FIPS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/,
  );
  if (!block) {
    throw new Error("Could not locate MI_COUNTY_FIPS object in census-geographies.ts");
  }
  const body = block[1];
  const entries = body.matchAll(/"?([A-Za-z'\.\- ]+?)"?\s*:\s*"(\d{3})"/g);
  const nameToFips = new Map();
  for (const m of entries) {
    nameToFips.set(m[1].trim(), m[2]);
  }
  if (nameToFips.size !== 83) {
    throw new Error(
      `Expected 83 MI counties in MI_COUNTY_FIPS, parsed ${nameToFips.size}`,
    );
  }
  return nameToFips;
}

function parseHArgs(argsStr) {
  const parts = [];
  let cur = "";
  let depth = 0;
  let inStr = false;
  let strCh = "";
  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (inStr) {
      cur += ch;
      if (ch === "\\" && i + 1 < argsStr.length) {
        cur += argsStr[++i];
        continue;
      }
      if (ch === strCh) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = true;
      strCh = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim() !== "") parts.push(cur.trim());
  return parts;
}

function literalToValue(lit) {
  if (lit === "undefined" || lit === "null") return undefined;
  if (lit.startsWith('"') && lit.endsWith('"')) return lit.slice(1, -1);
  if (lit.startsWith("'") && lit.endsWith("'")) return lit.slice(1, -1);
  return undefined;
}

function buildHCall(uninsured, pcp, food, uTrend, fTrend) {
  const q = (s) => JSON.stringify(s);
  if (fTrend) {
    return `h(${q(uninsured)}, ${q(pcp)}, ${q(food)}, ${uTrend ? q(uTrend) : "undefined"}, ${q(fTrend)})`;
  }
  if (uTrend) {
    return `h(${q(uninsured)}, ${q(pcp)}, ${q(food)}, ${q(uTrend)})`;
  }
  return `h(${q(uninsured)}, ${q(pcp)}, ${q(food)})`;
}

const EM_DASH = String.fromCharCode(0x2014);
function ensureNoEmDash(s) {
  if (s && s.includes(EM_DASH)) {
    throw new Error(`Em dash found in generated string: ${s}`);
  }
}

async function main() {
  console.log("[refresh-county-health] fetching CHR 2025 original release...");
  const [uJson, pJson, fJson] = await Promise.all([
    fetchMeasure("uninsured"),
    fetchMeasure("pcp"),
    fetchMeasure("food"),
  ]);
  assertDatasource(uJson, "uninsured");
  assertDatasource(pJson, "pcp");
  assertDatasource(fJson, "food");

  const uVals = rowsByFips(uJson);
  const pVals = rowsByFips(pJson);
  const fVals = rowsByFips(fJson);

  const fipsMap = await loadFipsMap();
  for (const [name, fips] of fipsMap) {
    for (const [key, vals] of [["uninsured", uVals], ["pcp", pVals], ["food", fVals]]) {
      if (!vals.has(fips)) {
        throw new Error(
          `CHR ${key} response missing FIPS 26_${fips} (${name}). Will not write blanks.`,
        );
      }
    }
  }

  const src = await readFile(profilesPath, "utf8");
  const lines = src.split("\n");
  const out = lines.slice();

  const blockOpenRe = /^export const COUNTY_PROFILES\b[^=]*=\s*\{\s*$/;
  const blockCloseRe = /^\};\s*$/;
  let inBlock = false;
  let blockStart = -1;
  let blockEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (!inBlock && blockOpenRe.test(lines[i])) {
      inBlock = true;
      blockStart = i;
      continue;
    }
    if (inBlock && blockCloseRe.test(lines[i])) {
      blockEnd = i;
      break;
    }
  }
  if (blockStart < 0 || blockEnd < 0) {
    throw new Error("Could not locate COUNTY_PROFILES block bounds.");
  }

  const countyKeyRe = /^(\s*)"?([A-Z][A-Za-z'\.\- ]*?)"?:\s*\{\s*$/;
  const healthRe = /^(\s*)healthHighlights:\s*h\(([\s\S]*?)\),\s*$/;

  let currentCounty = null;
  const seen = new Set();
  const changes = [];

  for (let i = blockStart + 1; i < blockEnd; i++) {
    const km = lines[i].match(countyKeyRe);
    if (km) {
      currentCounty = km[2];
      continue;
    }
    const hm = lines[i].match(healthRe);
    if (!hm) continue;
    if (!currentCounty) continue;
    const fips = fipsMap.get(currentCounty);
    if (!fips) continue;

    const args = parseHArgs(hm[2]);
    if (args.length < 3) {
      throw new Error(
        `Could not parse h() args for ${currentCounty} on line ${i + 1}`,
      );
    }
    const oldU = literalToValue(args[0]) ?? "";
    const oldP = literalToValue(args[1]) ?? "";
    const oldF = literalToValue(args[2]) ?? "";
    const oldUTrend = args.length > 3 ? literalToValue(args[3]) : undefined;
    const oldFTrend = args.length > 4 ? literalToValue(args[4]) : undefined;

    const newU = formatPercent(uVals.get(fips));
    const newP = formatRatio(pVals.get(fips));
    const newF = formatPercent(fVals.get(fips));
    ensureNoEmDash(newU);
    ensureNoEmDash(newP);
    ensureNoEmDash(newF);

    const uTrend = newU === oldU ? oldUTrend : undefined;
    const fTrend = newF === oldF ? oldFTrend : undefined;

    const indent = hm[1];
    const newCall = buildHCall(newU, newP, newF, uTrend, fTrend);
    const newLine = `${indent}healthHighlights: ${newCall},`;

    if (newLine !== lines[i]) {
      out[i] = newLine;
    }
    changes.push({
      county: currentCounty,
      oldU,
      newU,
      uSource: uVals.get(fips),
      oldP,
      newP,
      pSource: pVals.get(fips),
      oldF,
      newF,
      fSource: fVals.get(fips),
      uTrendDropped: oldUTrend !== undefined && uTrend === undefined,
      fTrendDropped: oldFTrend !== undefined && fTrend === undefined,
    });
    seen.add(currentCounty);
  }

  for (const name of fipsMap.keys()) {
    if (!seen.has(name)) {
      throw new Error(
        `No healthHighlights line matched for county "${name}". Refusing to write partial data.`,
      );
    }
  }
  if (changes.length !== 83) {
    throw new Error(
      `Expected to process 83 counties, processed ${changes.length}`,
    );
  }

  changes.sort((a, b) => a.county.localeCompare(b.county));

  console.log("\n[refresh-county-health] per-county verification (CHR raw -> formatted):");
  console.log(
    [
      "County".padEnd(18),
      "U: old".padEnd(8),
      "U: new".padEnd(8),
      "U: CHR raw".padEnd(20),
      "P: old".padEnd(10),
      "P: new".padEnd(10),
      "P: CHR raw".padEnd(16),
      "F: old".padEnd(8),
      "F: new".padEnd(8),
      "F: CHR raw".padEnd(12),
      "trends dropped",
    ].join(" "),
  );
  console.log("-".repeat(160));
  for (const c of changes) {
    const dropped = [
      c.uTrendDropped ? "U" : "",
      c.fTrendDropped ? "F" : "",
    ]
      .filter(Boolean)
      .join("+") || "-";
    console.log(
      [
        c.county.padEnd(18),
        String(c.oldU).padEnd(8),
        String(c.newU).padEnd(8),
        String(c.uSource ?? "null").padEnd(20),
        String(c.oldP).padEnd(10),
        String(c.newP).padEnd(10),
        String(c.pSource ?? "null").padEnd(16),
        String(c.oldF).padEnd(8),
        String(c.newF).padEnd(8),
        String(c.fSource ?? "null").padEnd(12),
        dropped,
      ].join(" "),
    );
  }

  const auditExpect = {
    Wayne: { u: "5.7%", p: "1,426:1" },
    Kent: { u: "5.5%", p: "1,068:1" },
    Keweenaw: { u: "4.8%", p: "-" },
    Marquette: { u: "5.9%", p: "870:1" },
    Washtenaw: { u: "4.3%", p: "563:1" },
  };
  console.log("\n[refresh-county-health] audit-confirmation check (5 counties):");
  for (const [name, want] of Object.entries(auditExpect)) {
    const got = changes.find((c) => c.county === name);
    if (!got) throw new Error(`Audit county ${name} not processed`);
    const ok = got.newU === want.u && got.newP === want.p;
    console.log(
      `  ${name.padEnd(12)} uninsured=${got.newU} (want ${want.u})  PCP=${got.newP} (want ${want.p})  ${ok ? "OK" : "MISMATCH"}`,
    );
    if (!ok) {
      throw new Error(
        `Audit mismatch for ${name}: uninsured ${got.newU} vs ${want.u}, PCP ${got.newP} vs ${want.p}`,
      );
    }
  }

  const changedCount = changes.filter(
    (c) => c.oldU !== c.newU || c.oldP !== c.newP || c.oldF !== c.newF,
  ).length;
  console.log(
    `\n[refresh-county-health] ${changedCount} of 83 counties have at least one value change.`,
  );

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({
      projectRoot,
      buildId: BUILD_ID,
      entries: manifestEntries,
    });
    console.log(`[refresh-county-health] archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }

  if (!APPLY) {
    console.log(
      "\n[refresh-county-health] dry-run (default). Re-run with --apply to write the file.",
    );
    return;
  }

  await writeFile(profilesPath, out.join("\n"), "utf8");
  console.log(`\n[refresh-county-health] wrote ${profilesPath}.`);
}

main().catch(async (err) => {
  console.error("[refresh-county-health] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({
        projectRoot,
        buildId: BUILD_ID,
        entries: manifestEntries,
      });
      console.error(
        `[refresh-county-health] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`,
      );
    } catch (manifestErr) {
      console.error("[refresh-county-health] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
