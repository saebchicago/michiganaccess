#!/usr/bin/env node
/**
 * Manual EPA EJScreen CSV ingest for Michigan ZCTAs (UC1 data spine).
 *
 * Use when the EPA ArcGIS endpoint is unavailable. Accepts official EJScreen
 * CSV exports (ZCTA or block-group rows). Block groups are skipped unless
 * --aggregate-bg is passed (not implemented in v1 - ZCTA rows only).
 *
 * Output: src/data/ejscreen.generated.ts (merged in ejscreen.ts after review)
 *
 * Usage (from artifacts/access-mi/):
 *   node scripts/ingest-ejscreen-csv.mjs <path-to-ejscreen.csv>
 *   node scripts/ingest-ejscreen-csv.mjs --dry-run <path-to-ejscreen.csv>
 *
 * Expected columns (EPA EJScreen 2.x):
 *   ZCTA5CE10 or ZCTA or ID (11-char block group starting with 26)
 *   P_PM25_D2, P_OZONE_D2, P_PTRAF_D2 or PTRAF
 *   P_PWDIS_D2 or PWDIS, P_PRMP_D2 or PRMP
 *   LOWINCPCT, MINORPCT, UNEDUPCT
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/ejscreen.generated.ts");
const MI_STATE_FIPS = "26";
const DRY_RUN = process.argv.includes("--dry-run");
const csvArg = process.argv.filter((a) => !a.startsWith("--"))[2];

function parseCsv(raw) {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
  return { headers, rows };
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseNum(v) {
  if (v == null || v === "" || v === "None" || v === "NA" || v === "N/A") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] != null && row[k] !== "") return row[k];
  }
  return "";
}

function isMichiganZcta(zcta) {
  return zcta.startsWith("48") || zcta.startsWith("49");
}

function rowToRecord(row, dataYear) {
  const id = pick(row, ["ZCTA5CE10", "ZCTA", "zcta", "ID", "GEOID"]);
  let zcta = "";
  if (/^\d{5}$/.test(id)) {
    zcta = id.padStart(5, "0");
  } else if (id.length === 5 && /^\d+$/.test(id)) {
    zcta = id.padStart(5, "0");
  } else if (id.startsWith(MI_STATE_FIPS) && id.length === 11) {
    return null;
  } else if (id.length >= 5) {
    const maybe = id.slice(-5);
    if (/^\d{5}$/.test(maybe)) zcta = maybe;
  }

  if (!zcta || !isMichiganZcta(zcta)) return null;

  const state = pick(row, ["STATEFP", "STATE", "STFIPS", "statefp"]);
  if (state && state !== MI_STATE_FIPS && state !== "MI" && state !== "Michigan") {
    return null;
  }

  const pm25 = parseNum(pick(row, ["P_PM25_D2", "P_PM25", "pm25_percentile"]));
  const ozone = parseNum(pick(row, ["P_OZONE_D2", "P_OZONE", "ozone_percentile"]));
  const traffic = parseNum(pick(row, ["P_PTRAF_D2", "P_PTRAF", "PTRAF", "traffic_percentile"]));
  const wastewater = parseNum(pick(row, ["P_PWDIS_D2", "P_PWDIS", "PWDIS", "wastewater_percentile"]));
  const rmp = parseNum(pick(row, ["P_PRMP_D2", "P_PRMP", "PRMP", "rmp_percentile"]));
  const demog = parseNum(pick(row, ["P_DEMOGIDX_2", "DEMOGIDX_2", "demographic_index"]));

  const ej = Math.round(
    Math.max(pm25 ?? 0, ozone ?? 0, traffic ?? 0, demog ?? 0),
  );

  return {
    zcta,
    ej_index: ej,
    pm25_percentile: pm25 ?? 0,
    ozone_percentile: ozone ?? 0,
    traffic_percentile: traffic ?? 0,
    wastewater_percentile: wastewater ?? 0,
    rmp_percentile: rmp ?? 0,
    pct_low_income: parseNum(pick(row, ["LOWINCPCT", "pct_low_income"])) ?? 0,
    pct_minority: parseNum(pick(row, ["MINORPCT", "pct_minority"])) ?? 0,
    pct_less_hs: parseNum(pick(row, ["UNEDUPCT", "pct_less_hs"])) ?? 0,
    data_year: dataYear,
  };
}

function inferDataYear(headers, rows) {
  const yearCol = headers.find((h) => /year|vintage|fy/i.test(h));
  if (yearCol && rows[0]?.[yearCol]) {
    const y = parseInt(rows[0][yearCol], 10);
    if (y >= 2015 && y <= 2030) return y;
  }
  return 2024;
}

function main() {
  if (!csvArg) {
    console.error("Usage: node scripts/ingest-ejscreen-csv.mjs [--dry-run] <ejscreen.csv>");
    process.exit(1);
  }

  const raw = readFileSync(resolve(csvArg), "utf-8");
  const { headers, rows } = parseCsv(raw);
  if (headers.length === 0) {
    console.error("CSV has no headers.");
    process.exit(1);
  }

  const dataYear = inferDataYear(headers, rows);
  const byZcta = new Map();

  for (const row of rows) {
    const rec = rowToRecord(row, dataYear);
    if (!rec) continue;
    byZcta.set(rec.zcta, rec);
  }

  if (byZcta.size === 0) {
    console.error(
      "No Michigan ZCTA rows found. Ensure the CSV has ZCTA5CE10/ZCTA columns and STATEFP=26 rows.",
    );
    process.exit(1);
  }

  console.log(`Parsed ${byZcta.size} Michigan ZCTA records (data_year=${dataYear}).`);

  if (DRY_RUN) {
    console.log("Dry run - no file written.");
    console.log("Sample ZCTAs:", [...byZcta.keys()].slice(0, 5).join(", "));
    process.exit(0);
  }

  const records = Object.fromEntries(
    [...byZcta.entries()].sort(([a], [b]) => a.localeCompare(b)),
  );

  const ts = `/**
 * AUTO-GENERATED by scripts/ingest-ejscreen-csv.mjs
 * Source: ${csvArg}
 * Generated: ${new Date().toISOString()}
 * Records: ${byZcta.size}
 *
 * Do not hand-edit. Re-run the ingest script to refresh.
 */

import type { EjscreenRecord } from "./ejscreen";

export const MICHIGAN_EJSCREEN_GENERATED: Record<string, EjscreenRecord> = ${JSON.stringify(records, null, 2)};
`;

  writeFileSync(OUT, ts, "utf-8");
  console.log(`Wrote ${byZcta.size} ZCTAs to ${OUT}`);
  console.log("Review generated values, then run pnpm typecheck.");
}

main();