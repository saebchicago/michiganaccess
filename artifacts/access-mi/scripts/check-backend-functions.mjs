#!/usr/bin/env node
/**
 * Backend-function reachability guard.
 *
 * Every serverless endpoint the app calls must have source in the repo, and
 * every Netlify endpoint must have source Netlify will actually deploy.
 *
 * WHY
 * ---
 * The app calls `/.netlify/functions/chat-mistral` in four places. Netlify
 * deploys from `netlify/functions/` (no `[functions]` override in
 * netlify.toml), and that file is not there - its only copy is in
 * `.migration-backup/netlify/functions/`. So the endpoint 404s in production
 * and "Ask Access Michigan" cannot work. GAPS.md logged this as LOW severity
 * and "out of scope"; it is a broken user-facing feature.
 *
 * Seven Supabase functions the app calls are in the same position
 * (civic-copilot, arcgis-proxy, airnow-proxy, npi-proxy, gtfs-rt-proxy,
 * cdc-proxy, appeal-generator). Those deploy to Supabase out-of-band rather
 * than from this repo, so they may well be live - but the repo's only record
 * of production code is a directory named `.migration-backup/`, excluded
 * from every other guard. A routine dead-code cleanup would delete it. One
 * nearly did.
 *
 * Rules:
 *   1. A `.netlify/functions/<name>` call must resolve to
 *      `netlify/functions/<name>.{js,ts,mjs}` - the directory Netlify
 *      deploys. Unresolved calls fail unless listed in
 *      `backend-function-allowlist.json` with a reason.
 *   2. A `functions/v1/<name>` (Supabase) call must have source somewhere in
 *      the repo. Living only under `.migration-backup/` is tolerated but
 *      must be declared, so the number cannot quietly grow and so the
 *      directory's load-bearing role stays visible.
 *
 * Run via: node scripts/check-backend-functions.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(here, "..");
const REPO = path.resolve(APP, "..", "..");
const SRC = path.join(APP, "src");
const ALLOWLIST_PATH = path.join(APP, "backend-function-allowlist.json");

const NETLIFY_DIR = path.join(REPO, "netlify", "functions");
const SUPABASE_DIR = path.join(REPO, "supabase", "functions");
const BACKUP_NETLIFY = path.join(REPO, ".migration-backup", "netlify", "functions");
const BACKUP_SUPABASE = path.join(REPO, ".migration-backup", "supabase", "functions");

const EXT = [".js", ".ts", ".mjs"];

function walk(dir, out = []) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const n of names) {
    const p = path.join(dir, n);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    st.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

let allow = { netlify: {}, supabaseBackupOnly: {} };
if (existsSync(ALLOWLIST_PATH)) {
  try {
    allow = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch (err) {
    console.error(
      `[check-backend-functions] FAIL backend-function-allowlist.json is unparseable: ${err.message}`,
    );
    process.exit(1);
  }
}

const files = walk(SRC).filter(
  (f) => /\.(ts|tsx)$/.test(f) && !/\.test\.|__tests__|[/\\]test[/\\]/.test(f),
);

const netlifyCalls = new Map();
const supabaseCalls = new Map();

for (const f of files) {
  const rel = path.relative(APP, f).replace(/\\/g, "/");
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/\.netlify\/functions\/([a-zA-Z0-9_-]+)/g))
    if (!netlifyCalls.has(m[1])) netlifyCalls.set(m[1], rel);
  for (const m of src.matchAll(/functions\/v1\/([a-zA-Z0-9_-]+)/g))
    if (!supabaseCalls.has(m[1])) supabaseCalls.set(m[1], rel);
}

if (netlifyCalls.size === 0 && supabaseCalls.size === 0) {
  console.error(
    "[check-backend-functions] FAIL found no backend calls at all - the scan is broken.",
  );
  process.exit(1);
}

let failures = 0;
const fail = (msg) => {
  console.error(`[check-backend-functions] FAIL ${msg}`);
  failures++;
};

const hasNetlifySource = (n) => EXT.some((e) => existsSync(path.join(NETLIFY_DIR, n + e)));
const hasBackupNetlify = (n) => EXT.some((e) => existsSync(path.join(BACKUP_NETLIFY, n + e)));

// Rule 1: Netlify functions must be where Netlify deploys from.
for (const [name, caller] of netlifyCalls) {
  if (hasNetlifySource(name)) continue;
  const reason = allow.netlify?.[name];
  if (reason) continue;
  fail(
    `${caller} calls /.netlify/functions/${name} but netlify/functions/${name}.{js,ts,mjs} does not exist${
      hasBackupNetlify(name)
        ? " - the only copy is in .migration-backup/netlify/functions/, which Netlify does not deploy, so this endpoint 404s in production"
        : ""
    }. Add the source, or record it in backend-function-allowlist.json with a reason.`,
  );
}

// Rule 2: Supabase functions deploy out-of-band; require repo source and
// declare the ones that survive only in the backup tree.
const backupOnly = [];
for (const [name, caller] of supabaseCalls) {
  if (existsSync(path.join(SUPABASE_DIR, name))) continue;
  if (existsSync(path.join(BACKUP_SUPABASE, name))) {
    backupOnly.push(name);
    if (!allow.supabaseBackupOnly?.[name])
      fail(
        `${caller} calls Supabase function "${name}" whose only repo source is .migration-backup/supabase/functions/${name}. Declare it in backend-function-allowlist.json under supabaseBackupOnly with a reason, or promote it into supabase/functions/.`,
      );
    continue;
  }
  fail(
    `${caller} calls Supabase function "${name}" but no source exists anywhere in the repo.`,
  );
}

// Stale declarations must not linger.
for (const name of Object.keys(allow.supabaseBackupOnly ?? {}))
  if (!backupOnly.includes(name))
    fail(
      `backend-function-allowlist.json declares "${name}" as backup-only but it is no longer called, or now has live source. Remove the entry.`,
    );
for (const name of Object.keys(allow.netlify ?? {}))
  if (hasNetlifySource(name))
    fail(
      `backend-function-allowlist.json allows Netlify function "${name}" but it now has deployable source. Remove the entry.`,
    );

if (failures > 0) {
  console.error(`[check-backend-functions] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-backend-functions] ok - ${netlifyCalls.size} Netlify and ${supabaseCalls.size} Supabase endpoints called; ${backupOnly.length} Supabase function(s) declared as surviving only in .migration-backup.`,
);
