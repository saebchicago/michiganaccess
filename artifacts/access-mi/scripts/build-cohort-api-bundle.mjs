#!/usr/bin/env node
/**
 * Build static cohort API bundle for Netlify function queries.
 *
 * Usage (from artifacts/access-mi/):
 *   node scripts/build-cohort-api-bundle.mjs
 */

import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const publicOut = resolve(projectRoot, "public/data/cohort-api-bundle.json");
const netlifyOut = resolve(projectRoot, "../../netlify/functions/_data/cohort-api-bundle.json");

mkdirSync(dirname(netlifyOut), { recursive: true });

execSync("pnpm exec vitest run src/test/unit/cohort-api-bundle.test.ts", {
  cwd: projectRoot,
  stdio: "inherit",
  env: { ...process.env, WRITE_COHORT_API_BUNDLE: "1" },
});

console.log("Cohort API bundle build complete.");
console.log(`  ${publicOut}`);
console.log(`  ${netlifyOut}`);