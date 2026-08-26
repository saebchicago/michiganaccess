#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://accessmi.org";
const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const distDir = path.join(projectRoot, "dist");
const metaPath = path.join(projectRoot, "src/config/extraRouteMeta.json");

async function main() {
  const entries = JSON.parse(await readFile(metaPath, "utf8"));
  const failures = [];

  for (const meta of entries) {
    const file = path.join(distDir, meta.path.replace(/^\//, ""), "index.html");
    try {
      await stat(file);
      const html = await readFile(file, "utf8");
      const canonical = `${SITE_URL}${meta.path.replace(/\/$/, "")}/`;
      if (!html.includes(`<title>${meta.title}</title>`)) failures.push(`${meta.path}: title`);
      if (!html.includes(`rel="canonical" href="${canonical}"`)) failures.push(`${meta.path}: canonical`);
      if (!html.includes("data-accessmi-prerender")) failures.push(`${meta.path}: noscript summary`);
      if (!html.includes(`property="og:url" content="${canonical}"`)) failures.push(`${meta.path}: og:url`);
    } catch {
      failures.push(`${meta.path}: missing output`);
    }
  }

  if (failures.length) {
    console.error("[check-extra-prerender] FAIL:");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }
  console.log(`[check-extra-prerender] ok - ${entries.length} flagship route(s) have static metadata.`);
}

main().catch((error) => {
  console.error("[check-extra-prerender] failed:", error);
  process.exit(1);
});
