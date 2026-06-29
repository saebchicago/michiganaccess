#!/usr/bin/env node
/**
 * Deploy analyst cohort + workspace Supabase migrations (UC8 Phase 2).
 *
 * Prerequisites:
 *   - Supabase CLI installed: https://supabase.com/docs/guides/cli
 *   - Linked project: supabase link --project-ref <ref>
 *   - Service role not required for migration push (uses linked DB)
 *
 * Usage (from repo root):
 *   node artifacts/access-mi/scripts/deploy-analyst-migrations.mjs
 *   node artifacts/access-mi/scripts/deploy-analyst-migrations.mjs --dry-run
 *
 * Migrations applied:
 *   supabase/migrations/20260629000001_analyst_cohorts.sql
 *   supabase/migrations/20260629000002_analyst_cohort_workspace.sql
 */

import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const dryRun = process.argv.includes("--dry-run");

const MIGRATIONS = [
  "20260629000001_analyst_cohorts.sql",
  "20260629000002_analyst_cohort_workspace.sql",
];

for (const m of MIGRATIONS) {
  const path = resolve(repoRoot, "supabase/migrations", m);
  if (!existsSync(path)) {
    console.error(`Missing migration: ${path}`);
    process.exit(1);
  }
}

console.log("Analyst migration deploy");
console.log("Repo:", repoRoot);
console.log("Migrations:", MIGRATIONS.join(", "));

if (dryRun) {
  console.log("\nDry run - no changes applied.");
  console.log("Run: cd", repoRoot, "&& supabase db push");
  process.exit(0);
}

try {
  execSync("supabase db push", { cwd: repoRoot, stdio: "inherit" });
  console.log("\nMigrations pushed successfully.");
} catch (err) {
  console.error("\nDeploy failed. Ensure Supabase CLI is linked:");
  console.error("  cd", repoRoot);
  console.error("  supabase link --project-ref <your-project-ref>");
  console.error("  supabase db push");
  process.exit(1);
}