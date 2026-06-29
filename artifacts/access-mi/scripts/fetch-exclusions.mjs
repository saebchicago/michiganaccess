#!/usr/bin/env node
/**
 * Fetches active firm exclusions from the SAM.gov v4 Exclusions API and writes
 * a slim JSON to public/data/sam-exclusions.json for UEI-based contractor matching.
 *
 * Requires SAM_API_KEY env var (Read Public Data scope).
 * If absent, writes an empty placeholder and exits 0 (never fails the build).
 *
 * Run: node scripts/fetch-exclusions.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outPath = path.join(projectRoot, "public/data/sam-exclusions.json");

const SAM_API_KEY = process.env.SAM_API_KEY;
const EXCLUSIONS_URL = "https://api.sam.gov/entity-information/v4/exclusions";

async function writeEmpty(note) {
  const payload = {
    generatedAt: new Date().toISOString(),
    source: "SAM.gov v4 Exclusions API (not yet populated — set SAM_API_KEY and re-run)",
    note,
    count: 0,
    records: [],
  };
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`[fetch-exclusions] Wrote empty placeholder: ${outPath}`);
}

async function fetchExclusions() {
  if (!SAM_API_KEY) {
    await writeEmpty("SAM_API_KEY not set.");
    process.exit(0);
  }

  console.log("[fetch-exclusions] Requesting SAM.gov exclusions extract...");

  const initUrl = `${EXCLUSIONS_URL}?api_key=${SAM_API_KEY}&classification=Firm`;
  const initRes = await fetch(initUrl, {
    headers: { Accept: "application/json" },
  });

  if (!initRes.ok) {
    const body = await initRes.text().catch(() => "");
    console.error(
      `[fetch-exclusions] SAM API error ${initRes.status}: ${body.slice(0, 500)}`
    );
    console.error(
      "[fetch-exclusions] Check that SAM_API_KEY has 'Read Public Data' permission and is active."
    );
    await writeEmpty(`SAM API returned HTTP ${initRes.status} — key may lack permission or not yet active.`);
    process.exit(0);
  }

  const initData = await initRes.json();

  // SAM v4 exclusions endpoint returns a token + download URL for the full extract.
  // Shape: { exclusionDetails: { exclusionResult: N, token: "...", downloadUrl: "..." } }
  // or alternately: { token: "...", downloadUrl: "..." } at the top level.
  const token =
    initData?.exclusionDetails?.token ??
    initData?.token ??
    null;
  const downloadUrl =
    initData?.exclusionDetails?.downloadUrl ??
    initData?.downloadUrl ??
    null;

  if (!token && !downloadUrl) {
    // Might be a paginated inline response — check for records array
    const inlineRecords = initData?.exclusionDetails?.content ?? initData?.content ?? null;
    if (!inlineRecords) {
      console.error("[fetch-exclusions] Unexpected SAM response shape. Top-level keys:", Object.keys(initData).join(", "));
      console.error("[fetch-exclusions] Dumping first 1000 chars:", JSON.stringify(initData).slice(0, 1000));
      await writeEmpty("Unexpected SAM API response shape — see script output for field names.");
      process.exit(0);
    }
    // Inline records path
    return await processRecords(inlineRecords, initData?.exclusionDetails?.generatedDate ?? null);
  }

  // Download path: SAM returns a token, then we fetch the extract file
  const dlUrl = downloadUrl ?? `${EXCLUSIONS_URL}/download?api_key=${SAM_API_KEY}&token=${token}`;
  console.log("[fetch-exclusions] Fetching extract from download URL...");

  const dlRes = await fetch(dlUrl.includes("api_key=") ? dlUrl : `${dlUrl}&api_key=${SAM_API_KEY}`, {
    headers: { Accept: "application/json,text/csv" },
  });

  if (!dlRes.ok) {
    const body = await dlRes.text().catch(() => "");
    console.error(`[fetch-exclusions] Download failed ${dlRes.status}: ${body.slice(0, 500)}`);
    await writeEmpty(`SAM extract download returned HTTP ${dlRes.status}.`);
    process.exit(0);
  }

  const contentType = dlRes.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const dlData = await dlRes.json();
    const records = dlData?.exclusionDetails?.content ?? dlData?.content ?? dlData?.records ?? [];
    if (!Array.isArray(records)) {
      console.error("[fetch-exclusions] Download JSON keys:", Object.keys(dlData).join(", "));
      console.error("[fetch-exclusions] Sample:", JSON.stringify(dlData).slice(0, 1000));
      await writeEmpty("Unexpected download JSON shape — see script output.");
      process.exit(0);
    }
    return await processRecords(records, null);
  }

  if (contentType.includes("text/csv") || contentType.includes("application/octet-stream") || contentType.includes("text/plain")) {
    const csv = await dlRes.text();
    return await processCsv(csv);
  }

  console.error("[fetch-exclusions] Unhandled content-type:", contentType);
  const raw = await dlRes.text();
  console.error("[fetch-exclusions] Raw sample:", raw.slice(0, 500));
  await writeEmpty(`Unhandled content-type from SAM download: ${contentType}`);
  process.exit(0);
}

function mapJsonRecord(r) {
  // Log field names on first record so we can verify the mapping
  return {
    uei: r.ueiSAM ?? r["Unique Entity ID"] ?? r.uniqueEntityId ?? "",
    name: r.exclusionName ?? r.entityName ?? r["Legal Business Name"] ?? "",
    exclusionType: r.exclusionType ?? r["Exclusion Type"] ?? "",
    classification: r.classification ?? r["Classification"] ?? "",
    activationDate: r.activationDate ?? r["Active Date"] ?? r["Activation Date"] ?? "",
    samUrl: buildSamUrl(r.ueiSAM ?? r["Unique Entity ID"] ?? r.uniqueEntityId ?? ""),
  };
}

function buildSamUrl(uei) {
  if (!uei) return "https://sam.gov/search/?index=ei&sort=relevance&sfm%5Bstatus%5D%5Bis_active%5D=true";
  return `https://sam.gov/exclusions/${uei}/summary`;
}

async function processRecords(records, _generatedAt) {
  if (!Array.isArray(records) || records.length === 0) {
    console.log("[fetch-exclusions] No inline records returned.");
    await writeEmpty("SAM returned 0 records.");
    return;
  }

  const sample = records[0];
  console.log("[fetch-exclusions] Mapping from JSON fields:", Object.keys(sample).join(", "));

  const slim = records.map(mapJsonRecord).filter((r) => r.uei);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "SAM.gov active exclusions (FASCSA public), classification=Firm",
    count: slim.length,
    records: slim,
  };

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`[fetch-exclusions] Wrote ${slim.length} exclusion records to ${outPath}`);
}

async function processCsv(csv) {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) {
    await writeEmpty("SAM CSV was empty.");
    return;
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  console.log("[fetch-exclusions] CSV headers:", headers.join(", "));

  // Map column indices from actual headers
  const col = (candidates) => candidates.map((c) => headers.indexOf(c)).find((i) => i >= 0) ?? -1;

  const idxUei = col(["Unique Entity ID", "ueiSAM", "UEI"]);
  const idxName = col(["Legal Business Name", "Exclusion Name", "Entity Name"]);
  const idxType = col(["Exclusion Type", "exclusionType"]);
  const idxClass = col(["Classification", "classification"]);
  const idxDate = col(["Active Date", "Activation Date", "activationDate"]);

  if (idxUei < 0) {
    console.error("[fetch-exclusions] Could not find UEI column in CSV. Headers:", headers.join(", "));
    await writeEmpty("Could not identify UEI column in SAM CSV.");
    process.exit(0);
  }

  const parseCell = (cells, idx) =>
    idx >= 0 ? (cells[idx] ?? "").trim().replace(/^"|"$/g, "") : "";

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(",");
    const uei = parseCell(cells, idxUei);
    if (!uei) continue;
    records.push({
      uei,
      name: parseCell(cells, idxName),
      exclusionType: parseCell(cells, idxType),
      classification: parseCell(cells, idxClass),
      activationDate: parseCell(cells, idxDate),
      samUrl: buildSamUrl(uei),
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "SAM.gov active exclusions (FASCSA public), classification=Firm",
    count: records.length,
    records,
  };

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`[fetch-exclusions] Wrote ${records.length} exclusion records to ${outPath}`);
}

fetchExclusions().catch((err) => {
  console.error("[fetch-exclusions] Unexpected error:", err);
  writeEmpty(`Script error: ${err.message}`).then(() => process.exit(0));
});
