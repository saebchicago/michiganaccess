#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

async function main() {
  const registryText = await readFile(join(root, "src/data/sourcesRegistry.ts"), "utf8");

  // Collapse multiline string continuations so the regex can match them on one logical line.
  // Pattern: `field:\n        "value"` -> `field: "value"`
  const collapsed = registryText.replace(/:\s*\n\s*"/g, ': "');

  // Extract entries: blocks with name, org, url, powers, frequency fields.
  // [^{}]* avoids crossing nested braces, and the field order matches the interface.
  const entries = [];
  const entryRegex = /\{[^{}]*name:\s*"([^"]+)"[^{}]*org:\s*"([^"]+)"[^{}]*url:\s*"([^"]+)"[^{}]*powers:\s*"([^"]+)"[^{}]*frequency:\s*"([^"]+)"[^{}]*\}/g;
  let m;
  while ((m = entryRegex.exec(collapsed)) !== null) {
    const [, name, org, url, powers, frequency] = m;
    entries.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      agency: org,
      url,
      description: powers,
      updateFrequency: frequency,
      license: null,
      licenseReviewStatus: "pending",
      vintage: null,
      geographyLevel: null,
      integrityTier: null,
      lastVerified: null,
      monitoringStatus: "not-yet-monitored",
    });
  }

  if (entries.length !== 43) {
    console.error(`Expected 43 entries, got ${entries.length}`);
    process.exit(1);
  }

  const catalog = {
    _meta: {
      generated: new Date().toISOString(),
      source: "src/data/sourcesRegistry.ts",
      entryCount: entries.length,
      schema: "v1",
      note: "Machine-readable source catalog. license fields are null pending legal review.",
    },
    sources: entries,
  };

  const json = JSON.stringify(catalog, null, 2);

  // Write to src/data (for imports)
  await writeFile(join(root, "src/data/source-catalog.generated.json"), json, "utf8");

  // Write to public/data (for HTTP serving)
  await mkdir(join(root, "public/data"), { recursive: true });
  await writeFile(join(root, "public/data/source-catalog.json"), json, "utf8");

  console.log(`Generated source catalog: ${entries.length} entries`);
}

main().catch(e => { console.error(e); process.exit(1); });
