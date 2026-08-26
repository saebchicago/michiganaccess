#!/usr/bin/env node
/**
 * Guard the intentionally tiny set of flagship routes that are composed
 * outside the legacy literal route table. Each extra route must be:
 *   1. registered as a real App route,
 *   2. present in the discovery manifest,
 *   3. linked from another source module, and
 *   4. backed by static metadata.
 *
 * This prevents a temporary consolidation seam from becoming an ungoverned
 * second route system.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const srcDir = path.join(root, "src");

async function collectSource(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "test" || entry.name === "__tests__") continue;
      await collectSource(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const [metaRaw, app, manifest] = await Promise.all([
    readFile(path.join(srcDir, "config/extraRouteMeta.json"), "utf8"),
    readFile(path.join(srcDir, "App.tsx"), "utf8"),
    readFile(path.join(srcDir, "routes/manifest.ts"), "utf8"),
  ]);
  const entries = JSON.parse(metaRaw);
  const files = await collectSource(srcDir);
  const failures = [];

  for (const entry of entries) {
    const routeLiteral = `path=\"${entry.path}\"`;
    if (!app.includes(routeLiteral)) failures.push(`${entry.path}: not registered in App.tsx`);
    if (!manifest.includes(`path: \"${entry.path}\"`)) failures.push(`${entry.path}: missing from route manifest`);

    let inbound = 0;
    for (const file of files) {
      if (file.endsWith("OpportunityAtlasPage.tsx")) continue;
      const src = await readFile(file, "utf8");
      if (src.includes(`to=\"${entry.path}\"`) || src.includes(`href=\"${entry.path}\"`) || src.includes(`href: \"${entry.path}\"`)) {
        inbound += 1;
      }
    }
    if (inbound === 0) failures.push(`${entry.path}: no inbound content link`);
  }

  if (failures.length) {
    console.error("[check-extra-routes] FAIL:");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }

  console.log(`[check-extra-routes] ok - ${entries.length} flagship route(s) registered, discoverable, linked, and metadata-backed.`);
}

main().catch((error) => {
  console.error("[check-extra-routes] failed:", error);
  process.exit(1);
});
