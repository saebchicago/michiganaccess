#!/usr/bin/env node
/**
 * ZIP-population integrity check.
 *
 * Scans `src/data/*.ts` for every ZIP that appears with a numeric
 * `population`, `total_population`, or `pop` field and flags any ZIP
 * where the two values differ across files. Catches the audit's
 * 48201 ~12,500 vs ~14,500 split, plus any future drift.
 *
 * Per D4 the right fix is the pattern (single field consumed by both
 * summary and detail), not the values. This script makes drift loud
 * so the pattern doesn't quietly regress.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const dataDir = path.join(projectRoot, "src/data");

const POP_FIELDS = ["population", "total_population", "totalPopulation", "pop"];

async function main() {
  const files = (await readdir(dataDir)).filter(
    (f) => f.endsWith(".ts") && !f.includes(".test.") && !f.includes(".spec."),
  );

  const observations = new Map();

  const popFieldRe = new RegExp(
    `(?:^|[^A-Za-z_])(${POP_FIELDS.join("|")})\\s*:\\s*(\\d{2,8})`,
    "g",
  );

  for (const file of files) {
    const src = await readFile(path.join(dataDir, file), "utf8");
    const zipBlockRe = /"(\d{5})"\s*:\s*\{([\s\S]*?)\}/g;
    let m;
    while ((m = zipBlockRe.exec(src)) !== null) {
      const zip = m[1];
      const body = m[2];
      let p;
      while ((p = popFieldRe.exec(body)) !== null) {
        const field = p[1];
        const value = Number(p[2]);
        if (!observations.has(zip)) observations.set(zip, []);
        observations.get(zip).push({ file, field, value });
      }
      popFieldRe.lastIndex = 0;
    }
  }

  let conflictCount = 0;
  for (const [zip, hits] of observations) {
    const distinct = new Set(hits.map((h) => h.value));
    if (distinct.size > 1) {
      conflictCount++;
      console.log(
        `[check-zip-population] ${zip}: ${[...distinct].join(" vs ")}`,
      );
      for (const h of hits) {
        console.log(`    ${h.file}: ${h.field}=${h.value}`);
      }
    }
  }

  if (conflictCount === 0) {
    console.log(
      `[check-zip-population] ok — ${observations.size} ZIPs scanned, no population conflicts.`,
    );
    return;
  }

  console.error(
    `[check-zip-population] FAIL — ${conflictCount} ZIP(s) with conflicting population values.`,
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-zip-population] failed:", err);
  process.exit(1);
});
