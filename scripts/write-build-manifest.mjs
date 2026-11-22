import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Writes dist/.well-known/build.json: the release-provenance record that the
// "Publish production release" workflow and scripts/verify-release.mjs read
// back from production. Fail-closed rules (production context only):
//   - the commit must be a full 40-hex SHA (COMMIT_REF from Netlify);
//   - it must match the checked-out HEAD, so the record describes the tree
//     that was actually built;
//   - dist/index.html must exist and the critical generated datasets must be
//     present and populated.
// Outside production these problems are reported as warnings so local and
// preview builds still work.

const SHA_RE = /^[0-9a-f]{40}$/;

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Hash of every file under dir, keyed by relative path: one digest for the whole published tree. */
export function hashTree(dir) {
  const files = [];
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  const h = createHash("sha256");
  for (const f of files) {
    const rel = relative(dir, f).split("\\").join("/");
    if (rel === ".well-known/build.json") continue;
    h.update(`${rel}\0${sha256File(f)}\n`);
  }
  return { digest: h.digest("hex"), files: files.length };
}

/** The src of the page's module script (Vite's content-hashed entry bundle). */
export function moduleScript(html) {
  return html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1] ?? null;
}

/** Pure validation, exported for tests. Returns a list of problems. */
export function validateManifest(manifest, { headSha } = {}) {
  const problems = [];
  if (!manifest.commit || !SHA_RE.test(manifest.commit)) {
    problems.push(`commit is missing or not a full SHA: ${manifest.commit ?? "null"}`);
  } else if (headSha && manifest.commit !== headSha) {
    problems.push(`commit ${manifest.commit} does not match checked-out HEAD ${headSha}`);
  }
  if (!manifest.entry_html_sha256) problems.push("dist/index.html is missing");
  else if (!manifest.entry_module_script) problems.push("dist/index.html has no module script");
  for (const [file, info] of Object.entries(manifest.datasets ?? {})) {
    if (!info.present) problems.push(`critical dataset missing: ${file}`);
    else if (info.populated === false) problems.push(`critical dataset not populated: ${file}`);
  }
  return problems;
}

// Datasets whose absence or stub state broke production before (see
// check-build-parity.mjs) or that are published as agent-facing exports.
const CRITICAL_DATASETS = [
  "artifacts/access-mi/src/data/alice-county.generated.json",
  "artifacts/access-mi/src/data/provenance-index.generated.json",
  "artifacts/access-mi/src/data/source-catalog.generated.json",
  "artifacts/access-mi/src/data/verifiedHealthFacilities.json",
  "artifacts/access-mi/public/data/michigan-county-income-poverty.json",
];

function datasetInfo(path) {
  if (!existsSync(path)) return { present: false };
  const info = { present: true, sha256: sha256File(path) };
  try {
    const json = JSON.parse(readFileSync(path, "utf8"));
    const prov = json.provenance ?? json._meta ?? null;
    if (prov) {
      if ("populated" in prov) info.populated = prov.populated;
      info.ingested_at = prov.ingested_at ?? prov.fetched_at ?? prov.generated ?? null;
      if (prov.estimate_year != null) info.estimate_year = prov.estimate_year;
      if (prov.value_label) info.value_label = prov.value_label;
    }
  } catch {
    info.parse_error = true;
  }
  return info;
}

function main() {
  const outDir = process.argv[2] || "dist";
  const context = process.env.CONTEXT || "local";
  const headSha = git(["rev-parse", "HEAD"]);

  let pkg = {};
  try {
    pkg = JSON.parse(readFileSync("package.json", "utf8"));
  } catch {}

  const provIndexPath = "artifacts/access-mi/src/data/provenance-index.generated.json";
  let ingestedAt = null;
  try {
    ingestedAt = JSON.parse(readFileSync(provIndexPath, "utf8")).ingestedAt ?? null;
  } catch {}

  const entry = join(outDir, "index.html");
  const tree = existsSync(outDir) ? hashTree(outDir) : { digest: null, files: 0 };

  const manifest = {
    schema: "accessmi-build/v2",
    project: process.env.SITE_NAME || pkg.name || null,
    commit: process.env.COMMIT_REF || process.env.GITHUB_SHA || headSha,
    source_tree: git(["rev-parse", "HEAD^{tree}"]),
    branch: process.env.BRANCH || process.env.HEAD || null,
    context,
    deploy_id: process.env.DEPLOY_ID || null,
    build_id: process.env.BUILD_ID || null,
    built_at: new Date().toISOString(),
    node: process.version,
    package_manager: pkg.packageManager ?? null,
    lockfile_sha256: existsSync("pnpm-lock.yaml") ? sha256File("pnpm-lock.yaml") : null,
    entry_html_sha256: existsSync(entry) ? sha256File(entry) : null,
    // Fallback identity for verify-release when a CDN alters index.html
    // bytes: the content-hashed entry bundle the page must still load.
    entry_module_script: existsSync(entry) ? moduleScript(readFileSync(entry, "utf8")) : null,
    published_tree: tree,
    datasets: Object.fromEntries(CRITICAL_DATASETS.map((p) => [p, datasetInfo(p)])),
    dataset_ingested_at: ingestedAt,
  };

  const problems = validateManifest(manifest, { headSha });
  if (problems.length > 0) {
    const level = context === "production" ? "ERROR" : "WARN";
    for (const p of problems) console.error(`[write-build-manifest] ${level} ${p}`);
    if (context === "production") {
      console.error("[write-build-manifest] Refusing to publish: release provenance cannot be verified.");
      process.exit(1);
    }
  }

  const dir = join(outDir, ".well-known");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "build.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${join(dir, "build.json")} for ${manifest.commit || "unknown commit"} (${tree.files} files, tree ${tree.digest?.slice(0, 12)})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
