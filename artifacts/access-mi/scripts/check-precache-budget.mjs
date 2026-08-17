#!/usr/bin/env node
/**
 * Service-worker precache budget guard. Runs AFTER `vite build`, against the
 * real emitted `dist/sw.js`.
 *
 * The PWA precaches the app so it works offline. That is deliberate and worth
 * keeping. What is not worth keeping is precaching code the app already takes
 * care to load on demand: the 2026-08-16 audit found jsPDF, html2canvas and
 * canvg (~730KB) being downloaded by every first-time visitor, even though
 * every call site loads them with `await import()` at the moment the user
 * clicks export, and vite.config.ts says as much in a comment.
 *
 * This platform's audience is the households it maps - ALICE families, rural
 * counties, broadband deserts - often on metered mobile data. A first visit
 * that quietly pulls megabytes is a real cost to exactly the people the site
 * exists for, so the precache gets an explicit, enforced ceiling.
 *
 * Fails the build when:
 *   1. An export-only chunk reappears in the precache manifest.
 *   2. Total precache exceeds BUDGET_BYTES.
 *
 * Raising the budget is a deliberate act: change the constant, and say in the
 * commit message what got bigger and why.
 *
 * Run via: node scripts/check-precache-budget.mjs   (after `vite build`)
 */

import { readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const DIST = path.join(ROOT, "dist");
const SW = path.join(DIST, "sw.js");

/**
 * Ceiling for everything the service worker precaches, in bytes.
 * Measured 5.99MB on 2026-08-16 after excluding the PDF export stack; the
 * headroom absorbs normal growth without hiding a regression of that size.
 */
const BUDGET_BYTES = 6.4 * 1024 * 1024;

/**
 * Chunks that must never be precached: user-initiated, network-adjacent
 * features that are already dynamically imported at their call sites.
 */
const MUST_NOT_PRECACHE = [
  { pattern: /vendor-pdf-.*\.js$/, why: "jsPDF - loaded on export click" },
  { pattern: /html2canvas\.esm-.*\.js$/, why: "html2canvas - loaded on export click" },
  { pattern: /index\.es-.*\.js$/, why: "canvg - loaded on export click" },
];

if (!existsSync(SW)) {
  console.error(
    "[check-precache-budget] FAIL dist/sw.js not found. This guard runs after `vite build`.",
  );
  process.exit(1);
}

const sw = readFileSync(SW, "utf8");
const urls = [
  ...new Set(
    [
      ...sw.matchAll(
        /"(?:\.\/)?((?:assets\/)?[A-Za-z0-9._/-]+\.(?:js|css|woff2|html))"/g,
      ),
    ].map((m) => m[1]),
  ),
];

let total = 0;
let counted = 0;
for (const u of urls) {
  try {
    total += statSync(path.join(DIST, u)).size;
    counted++;
  } catch {
    /* referenced but not on disk - not a precache entry */
  }
}

let failures = 0;
const fail = (msg) => {
  console.error(`[check-precache-budget] FAIL ${msg}`);
  failures++;
};

// Self-check: a parse that found nothing would pass every rule vacuously.
if (counted < 20)
  fail(
    `only ${counted} precache entries resolved from dist/sw.js - the parse is broken.`,
  );

for (const { pattern, why } of MUST_NOT_PRECACHE) {
  const hit = urls.find((u) => pattern.test(u));
  if (hit)
    fail(
      `${hit} is in the precache manifest but must not be (${why}). Check globIgnores in the VitePWA injectManifest block of vite.config.ts.`,
    );
}

const mb = (b) => (b / 1048576).toFixed(2);
if (total > BUDGET_BYTES)
  fail(
    `precache is ${mb(total)}MB, over the ${mb(BUDGET_BYTES)}MB budget. Either trim what is precached or raise BUDGET_BYTES in this script and justify it in the commit message.`,
  );

if (failures > 0) {
  console.error(`[check-precache-budget] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-precache-budget] ok - ${counted} entries, ${mb(total)}MB of ${mb(BUDGET_BYTES)}MB budget; export-only chunks stay out of the precache.`,
);
