#!/usr/bin/env node
/**
 * Summarize ingest-manifest/*.json into src/data/sourceHealth.generated.json
 * so the running app can answer "is this source's latest ingest attempt
 * healthy, and if not, when did we last successfully retrieve it" without
 * shipping every historical manifest file to the client.
 *
 * Run this after any ingest script (build-*.mjs / refresh-*.mjs) that
 * writes to ingest-manifest/. Safe to run with an empty or missing
 * manifest directory - writes an empty summary rather than failing, since
 * a repo that has never run an ingest script yet (a fresh clone before
 * any --apply run) should still build.
 *
 * Usage:
 *   node artifacts/access-mi/scripts/build-source-health.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeSourceHealth } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outPath = path.join(projectRoot, "src/data/sourceHealth.generated.json");

async function main() {
  const bySource = await summarizeSourceHealth({ projectRoot });
  const sourceCount = Object.keys(bySource).length;
  const unhealthy = Object.entries(bySource).filter(([, v]) => !v.latest_valid);

  const payload = {
    schema: "sourceHealth.v1",
    generated_at: new Date().toISOString(),
    sources: bySource,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `[build-source-health] wrote ${path.relative(projectRoot, outPath)} (${sourceCount} sources, ${unhealthy.length} unhealthy)`,
  );
  for (const [sourceId, status] of unhealthy) {
    console.warn(
      `[build-source-health]   UNHEALTHY: ${sourceId} - ${status.invalid_reason} (last valid: ${status.last_valid_retrieved_at ?? "never"})`,
    );
  }
}

main().catch((err) => {
  console.error("[build-source-health] failed:", err);
  process.exit(1);
});
