import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";

function localSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

let pkg = {};
try {
  pkg = JSON.parse(readFileSync("package.json", "utf8"));
} catch {}

const manifest = {
  project: process.env.SITE_NAME || pkg.name || null,
  version: pkg.version || null,
  commit: process.env.COMMIT_REF || process.env.GITHUB_SHA || localSha(),
  branch: process.env.BRANCH || process.env.HEAD || null,
  context: process.env.CONTEXT || "local",
  deploy_id: process.env.DEPLOY_ID || null,
  built_at: new Date().toISOString(),
};

const dir = join(outDir, ".well-known");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "build.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${join(dir, "build.json")} for ${manifest.commit || "unknown commit"}`);
