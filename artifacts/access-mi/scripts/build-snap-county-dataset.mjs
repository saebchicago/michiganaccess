#!/usr/bin/env node
/**
 * Build the Michigan SNAP county participation dataset from the USDA FNS-388A
 * release (project-area / county-level average monthly participation).
 *
 * Output:
 *   src/data/snapCountyGenerated.json   - { $schema, provenance, counties[] }
 *
 * The companion module src/data/snapMichiganFallback.ts imports this JSON, so
 * the app reads whatever this script last wrote. Do not hand-edit the JSON.
 *
 * FAIL-SAFE: the script writes nothing unless it extracts and validates all 83
 * Michigan counties (positive integer persons + households, households < persons,
 * known FIPS). On any shortfall it exits non-zero and leaves the committed JSON
 * untouched - so a bad upstream release degrades to the last good data, never to
 * garbage. Retailer fields are not part of 388A and are carried over verbatim
 * from the existing JSON.
 *
 * Usage:
 *   node scripts/build-snap-county-dataset.mjs              # fetch + write
 *   node scripts/build-snap-county-dataset.mjs --dry-run    # fetch + validate, no write
 *   node scripts/build-snap-county-dataset.mjs --file a.zip # parse a local zip instead of fetching
 *   SNAP_388A_URL=https://... node scripts/build-snap-county-dataset.mjs   # override source URL
 *
 * No external dependencies: the ZIP container and the inner .xlsx files (which
 * are themselves ZIPs of XML) are read with Node's built-in zlib + a small
 * OOXML reader below.
 *
 * ---------------------------------------------------------------------------
 * PARSE ASSUMPTIONS (verify against a real release, then adjust if needed):
 *   - The outer .zip contains one or more .xlsx workbooks (not legacy .xls).
 *   - A worksheet has a header row whose cells name the columns; columns are
 *     located by header text (regex below), NOT by fixed position.
 *   - Michigan rows are disambiguated by a "State" column reading Michigan/MI,
 *     OR by a worksheet whose name identifies Michigan. Without either signal a
 *     row is skipped (county names like "Monroe" recur across states).
 *   - The data vintage (fiscal year) appears as FY?20xx in an entry or sheet name.
 * These four assumptions are the only things likely to need a tweak once the
 * file can be inspected; everything else is format-generic.
 * ---------------------------------------------------------------------------
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outFile = path.join(projectRoot, "src/data/snapCountyGenerated.json");

const DEFAULT_URL =
  "https://www.fns.usda.gov/sites/default/files/resource-files/snap-zip-fns388a-2.zip";
const SOURCE_URL = process.env.SNAP_388A_URL || DEFAULT_URL;
const SOURCE_NAME = "USDA FNS SNAP Data Tables";
const SOURCE_PAGE =
  "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap";

const DRY_RUN = process.argv.includes("--dry-run");
const fileArgIdx = process.argv.indexOf("--file");
const LOCAL_FILE = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;

// 3-digit FIPS within state 26. Mirror of src/data/census-geographies.ts
// (MI_COUNTY_FIPS) - that registry is sacrosanct and not importable from a
// .mjs; scripts/check-snap-county-dataset.mjs cross-checks the two stay in sync.
const MI_COUNTY_FIPS = {
  Alcona: "001", Alger: "003", Allegan: "005", Alpena: "007", Antrim: "009",
  Arenac: "011", Baraga: "013", Barry: "015", Bay: "017", Benzie: "019",
  Berrien: "021", Branch: "023", Calhoun: "025", Cass: "027", Charlevoix: "029",
  Cheboygan: "031", Chippewa: "033", Clare: "035", Clinton: "037", Crawford: "039",
  Delta: "041", Dickinson: "043", Eaton: "045", Emmet: "047", Genesee: "049",
  Gladwin: "051", Gogebic: "053", "Grand Traverse": "055", Gratiot: "057", Hillsdale: "059",
  Houghton: "061", Huron: "063", Ingham: "065", Ionia: "067", Iosco: "069",
  Iron: "071", Isabella: "073", Jackson: "075", Kalamazoo: "077", Kalkaska: "079",
  Kent: "081", Keweenaw: "083", Lake: "085", Lapeer: "087", Leelanau: "089",
  Lenawee: "091", Livingston: "093", Luce: "095", Mackinac: "097", Macomb: "099",
  Manistee: "101", Marquette: "103", Mason: "105", Mecosta: "107", Menominee: "109",
  Midland: "111", Missaukee: "113", Monroe: "115", Montcalm: "117", Montmorency: "119",
  Muskegon: "121", Newaygo: "123", Oakland: "125", Oceana: "127", Ogemaw: "129",
  Ontonagon: "131", Osceola: "133", Oscoda: "135", Otsego: "137", Ottawa: "139",
  "Presque Isle": "141", Roscommon: "143", Saginaw: "145", Sanilac: "151",
  Schoolcraft: "153", Shiawassee: "155", "St. Clair": "147", "St. Joseph": "149",
  Tuscola: "157", "Van Buren": "159", Washtenaw: "161", Wayne: "163", Wexford: "165",
};

// Normalized county key -> canonical name, so "ST CLAIR", "Saint Clair County",
// "GRAND TRAVERSE" all resolve to the registry's spelling.
const COUNTY_LOOKUP = new Map();
for (const name of Object.keys(MI_COUNTY_FIPS)) {
  COUNTY_LOOKUP.set(normCountyKey(name), name);
}

function normCountyKey(raw) {
  let c = String(raw || "").trim().toLowerCase();
  c = c.replace(/\bcounty\b/g, "").replace(/\bco\.?$/g, "");
  c = c.replace(/^saint\s+/, "st ").replace(/^st\.?\s+/, "st ");
  c = c.replace(/[.]/g, "").replace(/\s+/g, " ").trim();
  return c;
}

function canonicalCounty(raw) {
  return COUNTY_LOOKUP.get(normCountyKey(raw)) || null;
}

function isMichigan(raw) {
  const s = String(raw || "").trim().toLowerCase();
  return s === "michigan" || s === "mi" || s === "26";
}

// --- ZIP container reader (built-in zlib only) -----------------------------

function unzip(buf) {
  const entries = new Map();
  // End of Central Directory record: signature 0x06054b50.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65536; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("not a zip: no end-of-central-directory record");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16); // central directory offset
  if (p === 0xffffffff) throw new Error("ZIP64 archives are not supported");

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break; // central dir header sig
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const fnLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + fnLen);
    if (compSize === 0xffffffff || localOff === 0xffffffff) {
      throw new Error("ZIP64 archives are not supported");
    }
    // Local header gives its own filename/extra lengths; data follows them.
    const lhFnLen = buf.readUInt16LE(localOff + 26);
    const lhExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lhFnLen + lhExtraLen;
    const comp = buf.subarray(dataStart, dataStart + compSize);
    let content;
    if (method === 0) content = comp;
    else if (method === 8) content = zlib.inflateRawSync(comp);
    else throw new Error(`unsupported zip compression method ${method} for ${name}`);
    entries.set(name, content);
    p += 46 + fnLen + extraLen + commentLen;
  }
  return entries;
}

// --- OOXML (.xlsx) reader --------------------------------------------------

function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  const out = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRe.exec(xml))) {
    const inner = m[1];
    let text = "";
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let t;
    while ((t = tRe.exec(inner))) text += decodeXml(t[1]);
    out.push(text);
  }
  return out;
}

function colToIndex(ref) {
  const m = /^([A-Z]+)/.exec(ref || "");
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Parse one worksheet XML into an array of rows; each row is an array of
// trimmed cell strings indexed by spreadsheet column.
function parseSheet(xml, shared) {
  const rows = [];
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let r;
  while ((r = rowRe.exec(xml))) {
    const cells = [];
    const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g;
    let c;
    while ((c = cellRe.exec(r[1]))) {
      const attrs = c[1] || c[3] || "";
      const body = c[2] || "";
      const ref = (/r="([^"]+)"/.exec(attrs) || [])[1] || "";
      const type = (/t="([^"]+)"/.exec(attrs) || [])[1] || "";
      let value = "";
      if (type === "s") {
        const v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1];
        if (v !== undefined) value = shared[parseInt(v, 10)] ?? "";
      } else if (type === "inlineStr") {
        const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
        let t;
        while ((t = tRe.exec(body))) value += decodeXml(t[1]);
      } else {
        const v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1];
        if (v !== undefined) value = decodeXml(v);
      }
      cells[colToIndex(ref)] = String(value).trim();
    }
    rows.push(cells);
  }
  return rows;
}

// Return [{ name, rows }] for every worksheet in an .xlsx buffer.
function readWorkbook(xlsxBuf) {
  const files = unzip(xlsxBuf);
  const shared = parseSharedStrings(
    files.has("xl/sharedStrings.xml")
      ? files.get("xl/sharedStrings.xml").toString("utf8")
      : "",
  );
  const sheets = [];
  for (const [name, content] of files) {
    if (/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) {
      sheets.push({ name, rows: parseSheet(content.toString("utf8"), shared) });
    }
  }
  return sheets;
}

// --- extraction ------------------------------------------------------------

const HEADER_COUNTY = /county|project\s*area|area\s*name|sub[-\s]?area/i;
const HEADER_PERSONS = /person|participant|individual|recipient/i;
const HEADER_HOUSEHOLDS = /household|case/i;
const HEADER_STATE = /^state/i;

function parseCount(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function detectVintage(names) {
  for (const n of names) {
    const m = /FY[\s_-]?((?:20)?\d{2})/i.exec(n) || /\b(20\d{2})\b/.exec(n);
    if (m) {
      let y = m[1];
      if (y.length === 2) y = "20" + y;
      return `FY${y}`;
    }
  }
  return null;
}

function extractMichigan(sheets) {
  const byFips = new Map();
  for (const sheet of sheets) {
    const sheetIsMI = /mich|_mi\b|\bmi\b/i.test(sheet.name);
    // Locate the header row.
    let headerIdx = -1;
    let countyCol = -1, personsCol = -1, hhCol = -1, stateCol = -1;
    for (let i = 0; i < Math.min(sheet.rows.length, 40); i++) {
      const row = sheet.rows[i];
      let cc = -1, pc = -1, hc = -1, sc = -1;
      for (let j = 0; j < row.length; j++) {
        const cell = row[j] || "";
        if (cc === -1 && HEADER_COUNTY.test(cell)) cc = j;
        if (pc === -1 && HEADER_PERSONS.test(cell)) pc = j;
        if (hc === -1 && HEADER_HOUSEHOLDS.test(cell)) hc = j;
        if (sc === -1 && HEADER_STATE.test(cell)) sc = j;
      }
      if (cc !== -1 && pc !== -1 && hc !== -1) {
        headerIdx = i; countyCol = cc; personsCol = pc; hhCol = hc; stateCol = sc;
        break;
      }
    }
    if (headerIdx === -1) continue;

    for (let i = headerIdx + 1; i < sheet.rows.length; i++) {
      const row = sheet.rows[i];
      if (!row || row.length === 0) continue;
      if (stateCol !== -1) {
        if (!isMichigan(row[stateCol])) continue;
      } else if (!sheetIsMI) {
        continue; // cannot disambiguate state - skip
      }
      const county = canonicalCounty(row[countyCol]);
      if (!county) continue;
      const persons = parseCount(row[personsCol]);
      const households = parseCount(row[hhCol]);
      if (persons == null || households == null) continue;
      const fips = "26" + MI_COUNTY_FIPS[county];
      // First plausible hit wins; ignore later duplicate/sub-area rows.
      if (!byFips.has(fips)) {
        byFips.set(fips, { county, fips, persons, households });
      }
    }
  }
  return byFips;
}

// --- io --------------------------------------------------------------------

async function loadZip() {
  if (LOCAL_FILE) {
    const abs = path.resolve(process.cwd(), LOCAL_FILE);
    console.log(`[build-snap-county] reading local file ${abs}`);
    return readFile(abs);
  }
  console.log(`[build-snap-county] fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL, {
    headers: { "user-agent": "accessmi-data-bot/1.0 (+https://accessmi.org)" },
  });
  if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadPriorCounties() {
  try {
    const raw = await readFile(outFile, "utf8");
    const prior = JSON.parse(raw);
    const map = new Map();
    for (const c of prior.counties || []) map.set(c.fips, c);
    return map;
  } catch {
    return new Map();
  }
}

async function main() {
  const zipBuf = await loadZip();
  const outer = unzip(zipBuf);

  const xlsxNames = [...outer.keys()].filter((n) => /\.xlsx$/i.test(n));
  if (xlsxNames.length === 0) {
    const xlsNames = [...outer.keys()].filter((n) => /\.xls$/i.test(n));
    if (xlsNames.length > 0) {
      throw new Error(
        `release contains legacy .xls workbooks (${xlsNames.join(", ")}); ` +
          "this reader only handles .xlsx - inspect the file and extend the reader",
      );
    }
    throw new Error(`no .xlsx workbook in archive; entries: ${[...outer.keys()].join(", ")}`);
  }

  const allSheets = [];
  for (const name of xlsxNames) {
    for (const sheet of readWorkbook(outer.get(name))) {
      allSheets.push({ name: `${name}:${sheet.name}`, rows: sheet.rows });
    }
  }

  const vintage =
    detectVintage([...xlsxNames, ...allSheets.map((s) => s.name)]) ||
    (() => {
      throw new Error(
        "could not detect fiscal-year vintage from file/sheet names; " +
          "set it explicitly once the release naming is known",
      );
    })();

  const found = extractMichigan(allSheets);

  // --- fail-safe validation ---
  const expected = Object.keys(MI_COUNTY_FIPS).length; // 83
  const errors = [];
  for (const [county, code] of Object.entries(MI_COUNTY_FIPS)) {
    const fips = "26" + code;
    const row = found.get(fips);
    if (!row) { errors.push(`missing county: ${county} (${fips})`); continue; }
    if (!Number.isInteger(row.persons) || row.persons <= 0) {
      errors.push(`${county}: bad persons ${row.persons}`);
    }
    if (!Number.isInteger(row.households) || row.households <= 0) {
      errors.push(`${county}: bad households ${row.households}`);
    }
    if (row.households >= row.persons) {
      errors.push(`${county}: households ${row.households} >= persons ${row.persons}`);
    }
  }
  if (errors.length > 0) {
    console.error(
      `[build-snap-county] validation failed (${found.size}/${expected} counties); ` +
        "leaving existing data untouched:",
    );
    for (const e of errors.slice(0, 20)) console.error("  - " + e);
    if (errors.length > 20) console.error(`  ... and ${errors.length - 20} more`);
    process.exit(1);
  }

  // --- assemble output (carry retailer fields over from prior JSON) ---
  const prior = await loadPriorCounties();
  const counties = Object.keys(MI_COUNTY_FIPS)
    .sort((a, b) => MI_COUNTY_FIPS[a].localeCompare(MI_COUNTY_FIPS[b]))
    .map((county) => {
      const fips = "26" + MI_COUNTY_FIPS[county];
      const row = found.get(fips);
      const prev = prior.get(fips) || {};
      return {
        county,
        fips,
        enrollmentTotal: row.persons,
        enrollmentHouseholds: row.households,
        enrollmentAsOf: vintage,
        sourceName: SOURCE_NAME,
        sourceUrl: SOURCE_PAGE,
        retailerCount: prev.retailerCount ?? null,
        retailerAsOf: prev.retailerAsOf ?? null,
        retailerSourceUrl: prev.retailerSourceUrl ?? null,
      };
    });

  const payload = {
    $schema: "snapCountyGenerated.v1",
    provenance: {
      dataset: "USDA FNS-388A SNAP project-area / county participation",
      vintage,
      source_name: SOURCE_NAME,
      source_url: SOURCE_PAGE,
      release_zip: SOURCE_URL,
      fetched_at: new Date().toISOString(),
      transform_script: "scripts/build-snap-county-dataset.mjs",
      counties_total: expected,
      note:
        "Average monthly SNAP participation per Michigan county for the fiscal " +
        "year shown. Regenerated by the transform script; do not hand-edit. " +
        "Retailer fields are carried over from prior data (not part of 388A).",
    },
    counties,
  };

  if (DRY_RUN) {
    console.log(`[build-snap-county] --dry-run OK: ${counties.length} counties, vintage ${vintage}`);
    const wayne = counties.find((c) => c.county === "Wayne");
    console.log(`  Wayne: ${wayne.enrollmentTotal} persons / ${wayne.enrollmentHouseholds} households`);
    return;
  }

  await writeFile(outFile, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `[build-snap-county] wrote ${path.relative(projectRoot, outFile)} ` +
      `(${counties.length} counties, vintage ${vintage})`,
  );
}

main().catch((err) => {
  console.error("[build-snap-county] failed:", err.message);
  process.exit(1);
});
