#!/usr/bin/env node
/**
 * Orphan-module guard.
 *
 * Fails when a module under src/{components,pages,hooks,utils,lib,data} is
 * mentioned nowhere else in the app - not imported, not lazy-loaded, not even
 * named in a comment or a test.
 *
 * The 2026-08-16 audit found 73 such files totalling 351KB: entire home-page
 * sections, a dozen "Spotlights" components, seed scripts, and a
 * `data/testfile.ts`. Vite tree-shakes them so they never reached users, but
 * they were live maintenance surface - several rendered platform claims
 * ("43 verified data sources", Trinity Health outcome figures, "all 83
 * counties") that the copy and fabrication guards dutifully scanned on every
 * build for components no user could reach. Worse, a reader grepping for a
 * claim would find it and reasonably assume it was on the site.
 *
 * The detector is deliberately over-broad: ANY mention of the module's
 * basename anywhere else in src/, scripts/, public/ or the root config files
 * counts as a reference,
 * so a file has to be genuinely unreachable to fail. That means the guard
 * under-reports rather than producing false positives that get it disabled.
 *
 * Adding a component before wiring it up is legitimate - list it in
 * `orphan-allowlist.json` with a reason. The allowlist is shrink-only: CI
 * blocks growth, the same policy provenance-allowlist.json uses.
 *
 * Run via: node scripts/check-orphan-modules.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.join(ROOT, "src");
const ALLOWLIST_PATH = path.join(ROOT, "orphan-allowlist.json");

/** Directories whose modules must be reachable. */
const SCANNED = ["components", "pages", "hooks", "utils", "lib", "data"];

/** Never flagged: framework entry points and vendored UI primitives. */
const EXEMPT = [
  /^src\/main\.tsx$/,
  /^src\/App\.tsx$/,
  /^src\/sw\.ts$/,
  /^src\/components\/ui\//, // shadcn primitives, added wholesale by design
  /\.d\.ts$/,
  /vite-env/,
];

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

const srcFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

// Reference corpus: all app source, plus scripts and public assets, plus the
// root-level config files.
//
// The config files are not optional. `vite.config.ts` aliases
// src/lib/radix-compose-refs-patch.ts into the Radix tooltip package, so that
// module is imported by production code without any src/ file naming it. An
// earlier revision of this guard scanned only src/, scripts/ and public/,
// declared the patch an orphan, and the deletion broke `vite build` - while
// typecheck and all 1070 tests stayed green, because the reference is a build
// -time alias. Any file that can name a module must be in this corpus.
const corpus = new Map(srcFiles.map((f) => [f, readFileSync(f, "utf8")]));

// This script is excluded from its own corpus. Its comments name specific
// modules by way of explanation, and "any mention counts" would then make
// every module it discusses permanently invisible to it.
const SELF = fileURLToPath(import.meta.url);

const addFile = (f) => {
  if (path.resolve(f) === SELF) return;
  try {
    corpus.set(f, readFileSync(f, "utf8"));
  } catch {
    /* unreadable file is simply not part of the corpus */
  }
};

for (const dir of [path.join(ROOT, "scripts"), path.join(ROOT, "public")]) {
  for (const f of walk(dir)) {
    if (!/\.(mjs|js|ts|tsx|json|html|txt|xml)$/.test(f)) continue;
    addFile(f);
  }
}

for (const name of readdirSync(ROOT)) {
  if (!/\.(ts|tsx|js|mjs|cjs|json|html)$/.test(name)) continue;
  const p = path.join(ROOT, name);
  try {
    if (statSync(p).isFile()) addFile(p);
  } catch {
    /* ignore */
  }
}

let allowlist = [];
if (existsSync(ALLOWLIST_PATH)) {
  try {
    allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8")).orphans ?? [];
  } catch (err) {
    console.error(
      `[check-orphan-modules] FAIL orphan-allowlist.json could not be parsed: ${err.message}`,
    );
    process.exit(1);
  }
}
const allowed = new Map(allowlist.map((o) => [o.path, o.reason]));

const isTest = (rel) => /\.test\.|__tests__|^src\/test\//.test(rel);

const orphans = [];
for (const file of srcFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (isTest(rel)) continue;
  if (EXEMPT.some((re) => re.test(rel))) continue;
  if (!SCANNED.some((d) => rel.startsWith(`src/${d}/`))) continue;

  const base = path.basename(file).replace(/\.(ts|tsx)$/, "");

  let referenced = false;
  for (const [other, text] of corpus) {
    if (other === file) continue;
    if (text.includes(base)) {
      referenced = true;
      break;
    }
  }
  if (!referenced) orphans.push(rel);
}

// Self-check: a corpus that failed to load would make everything look
// orphaned. Refuse to report in that state.
if (corpus.size < 50) {
  console.error(
    `[check-orphan-modules] FAIL reference corpus is only ${corpus.size} files - the scan is broken.`,
  );
  process.exit(1);
}

const unexpected = orphans.filter((o) => !allowed.has(o));
const staleAllowlist = [...allowed.keys()].filter((p) => !orphans.includes(p));

let failures = 0;
for (const o of unexpected) {
  console.error(
    `[check-orphan-modules] FAIL ${o} is referenced nowhere in src/, scripts/, public/ or the root config files. Wire it up, delete it, or add it to orphan-allowlist.json with a reason.`,
  );
  failures++;
}
for (const p of staleAllowlist) {
  console.error(
    `[check-orphan-modules] FAIL ${p} is allowlisted but is no longer an orphan (or no longer exists). Remove the entry - the allowlist is shrink-only.`,
  );
  failures++;
}

if (failures > 0) {
  console.error(`[check-orphan-modules] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-orphan-modules] ok - every module under src/{${SCANNED.join(",")}} is reachable (${srcFiles.length} files scanned, ${allowed.size} allowlisted).`,
);
