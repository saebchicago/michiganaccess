#!/usr/bin/env node
// build-data.mjs — Build static open-data files from declared sources.
// Output is committed and served by Netlify as static assets. No database.
//
// Governance is ENFORCED here, not left to convention:
//   - BLOCKED_SOURCES are refused; the build fails if any config references them.
//   - Per-repo FIPS exclusions strip disallowed geographies before write.
//   - Every dataset carries a _meta block with source, license, a single
//     classification (verified | modeled | projected — never blended), and a
//     fetch timestamp.
//   - Sources flagged _illustrative are SKIPPED, never written as fake data.
//
// Run: node scripts/build-data.mjs   (Node 20+, no dependencies)

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONFIG_PATH = process.env.DATA_SOURCES ?? "data-sources.json";
const OUT_DIR = process.env.OUT_DIR ?? "public/data";

// Sources that must never enter production ingest (licensing / policy).
const BLOCKED_SOURCES = new Set(["ihme", "gbd"]);
const VALID_LABELS = new Set(["verified", "modeled", "projected"]);

function fail(msg) {
  console.error(`✗ ${msg}`);
  throw new Error(msg);
}

async function fetchJson(url) {
  const MAX_ATTEMPTS = 3;
  const DELAY_MS = 5000;
  const TIMEOUT_MS = 60000;

  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "open-data-pipeline" },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        fail(`fetch failed HTTP ${res.status} for ${url}\n  body snippet: ${body.slice(0, 200)}`);
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        fail(`non-JSON response (HTTP ${res.status}) for ${url}\n  snippet: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      const reason = err.name === "AbortError" ? `timeout after ${TIMEOUT_MS}ms` : err.message;
      console.error(`  attempt ${attempt}/${MAX_ATTEMPTS} failed for ${url}: ${reason}`);
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
  throw new Error(`all ${MAX_ATTEMPTS} attempts failed for ${url}: ${lastErr?.message}`);
}

// Drop rows whose FIPS code starts with any excluded prefix (e.g. "26" = Michigan).
function applyFipsExclusions(rows, fipsField, excludePrefixes) {
  if (!Array.isArray(rows) || excludePrefixes.length === 0) return rows;
  return rows.filter((row) => {
    const code = String(row?.[fipsField] ?? "");
    return !excludePrefixes.some((p) => code.startsWith(p));
  });
}

async function main() {
  const cfg = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  const excludePrefixes = cfg.exclude_fips_prefixes ?? [];
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = { built_at: new Date().toISOString(), datasets: [] };

  for (const src of cfg.sources) {
    if (BLOCKED_SOURCES.has(src.id) || BLOCKED_SOURCES.has(src.provider)) {
      fail(`blocked source referenced: ${src.id} (${src.provider})`);
    }
    if (!VALID_LABELS.has(src.classification)) {
      fail(`source ${src.id} has invalid classification "${src.classification}"`);
    }
    if (src._illustrative) {
      console.warn(`⚠ skipping illustrative placeholder: ${src.id} — replace with a real endpoint`);
      continue;
    }

    console.log(`→ ${src.id} (${src.provider})`);
    let url = src.url;
    if (src.provider === "census" && process.env.CENSUS_API_KEY) {
      url += `&key=${process.env.CENSUS_API_KEY}`;
    }
    let rows = await fetchJson(url);
    if (src.fips_field) rows = applyFipsExclusions(rows, src.fips_field, excludePrefixes);

    const payload = {
      _meta: {
        id: src.id,
        provider: src.provider,
        source_url: src.url,
        license: src.license,
        classification: src.classification, // verified | modeled | projected
        excluded_fips_prefixes: src.fips_field ? excludePrefixes : [],
        fetched_at: new Date().toISOString(),
      },
      data: rows,
    };

    await writeFile(join(OUT_DIR, `${src.id}.json`), JSON.stringify(payload));
    manifest.datasets.push({
      id: src.id,
      provider: src.provider,
      license: src.license,
      classification: src.classification,
      records: Array.isArray(rows) ? rows.length : null,
      path: `/data/${src.id}.json`,
    });
    console.log(`  wrote ${src.id}.json (${Array.isArray(rows) ? rows.length : "?"} records)`);
  }

  await writeFile(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest written with ${manifest.datasets.length} datasets`);
}

main().catch((err) => { console.error(err); process.exit(1); });
