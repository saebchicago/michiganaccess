#!/usr/bin/env node
/**
 * Guard the deliberately small static-metadata extension set.
 *
 * An entry may be either a flagship route composed directly in App.tsx or a
 * metadata correction for a route in the legacy config table. Every entry must
 * still be a real route, be represented by the discovery manifest, and have an
 * inbound content/navigation link. This keeps the extension from becoming an
 * ungoverned second route system.
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
  const [metaRaw, app, routes, manifest] = await Promise.all([
    readFile(path.join(srcDir, "config/extraRouteMeta.json"), "utf8"),
    readFile(path.join(srcDir, "App.tsx"), "utf8"),
    readFile(path.join(srcDir, "config/routes.ts"), "utf8"),
    readFile(path.join(srcDir, "routes/manifest.ts"), "utf8"),
  ]);
  const entries = JSON.parse(metaRaw);
  const files = await collectSource(srcDir);
  const failures = [];

  for (const entry of entries) {
    const appLiteral = `path=\"${entry.path}\"`;
    const configLiteral = `path: \"${entry.path}\"`;
    if (!app.includes(appLiteral) && !routes.includes(configLiteral)) {
      failures.push(`${entry.path}: not registered in App.tsx or config/routes.ts`);
    }

    // Direct flagship routes are literal in manifest.ts; legacy routes are
    // composed into the manifest from APP_ROUTES. Validate the latter by the
    // config registration above and the APP_ROUTES composition contract.
    const directManifest = manifest.includes(`path: \"${entry.path}\"`);
    const composedLegacy = routes.includes(configLiteral) && manifest.includes("APP_ROUTES.map");
    if (!directManifest && !composedLegacy) {
      failures.push(`${entry.path}: missing from route manifest`);
    }

    let inbound = 0;
    for (const file of files) {
      const base = path.basename(file);
      // A route linking to itself is not discoverability.
      if (
        (entry.path === "/opportunity" && base === "OpportunityAtlasPage.tsx") ||
        (entry.path === "/map/layers" && base === "DeepMapPage.tsx")
      ) {
        continue;
      }
      const src = await readFile(file, "utf8");
      if (
        src.includes(`to=\"${entry.path}\"`) ||
        src.includes(`href=\"${entry.path}\"`) ||
        src.includes(`href: \"${entry.path}\"`)
      ) {
        inbound += 1;
      }
    }
    if (inbound === 0) failures.push(`${entry.path}: no inbound content/navigation link`);
  }

  if (failures.length) {
    console.error("[check-extra-routes] FAIL:");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }

  console.log(
    `[check-extra-routes] ok - ${entries.length} metadata extension route(s) registered, discoverable, linked, and guarded.`,
  );
}

main().catch((error) => {
  console.error("[check-extra-routes] failed:", error);
  process.exit(1);
});
