#!/usr/bin/env node
/**
 * Checks whether every citation URL in src/data/sourceManifest.ts and
 * src/data/sourcesRegistry.ts still resolves, and writes a report to
 * src/data/sourceLinkHealth.generated.json.
 *
 * This is deliberately NOT wired into `pnpm build` - external .gov/.org
 * hosts are flaky and rate-limit-prone, and a transient timeout on one
 * of ~70 third-party URLs should never block a deploy. Instead this runs
 * on a schedule (.github/workflows/source-link-check.yml) and opens a PR
 * only when it finds a URL that is dead now and was not dead in the
 * previous run, so a human reviews and fixes the citation - this script
 * never edits sourceManifest.ts or sourcesRegistry.ts itself; both are
 * sacrosanct files.
 *
 * Usage:
 *   node artifacts/access-mi/scripts/check-source-links.mjs
 *   node artifacts/access-mi/scripts/check-source-links.mjs --fail-on-dead
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectSourceUrls, checkAllUrls } from "./lib/source-link-check.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const sourceManifestPath = path.join(projectRoot, "src/data/sourceManifest.ts");
const sourcesRegistryPath = path.join(projectRoot, "src/data/sourcesRegistry.ts");
const outPath = path.join(projectRoot, "src/data/sourceLinkHealth.generated.json");

const DEAD_STATUSES = new Set(["client-error", "server-error"]);

async function loadPreviousReport() {
  try {
    const text = await readFile(outPath, "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const failOnDead = process.argv.includes("--fail-on-dead");

  const byUrl = await collectSourceUrls({ sourceManifestPath, sourcesRegistryPath });
  console.log(`[check-source-links] checking ${byUrl.size} unique URL(s)...`);

  const results = await checkAllUrls(byUrl);
  const previous = await loadPreviousReport();
  const previousDeadUrls = new Set(
    (previous?.results ?? [])
      .filter((r) => DEAD_STATUSES.has(r.status))
      .map((r) => r.url),
  );

  const dead = results.filter((r) => DEAD_STATUSES.has(r.status));
  const newlyDead = dead.filter((r) => !previousDeadUrls.has(r.url));
  const timedOut = results.filter((r) => r.status === "timeout" || r.status === "network-error");
  const redirected = results.filter((r) => r.status === "redirect");

  const payload = {
    schema: "sourceLinkHealth.v1",
    generated_at: new Date().toISOString(),
    checked: results.length,
    dead: dead.length,
    timed_out: timedOut.length,
    redirected: redirected.length,
    results,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `[check-source-links] wrote ${path.relative(projectRoot, outPath)} ` +
      `(${results.length} checked, ${dead.length} dead, ${timedOut.length} timed out, ${redirected.length} redirected)`,
  );

  for (const r of dead) {
    const flag = newlyDead.includes(r) ? "NEW " : "";
    console.warn(
      `[check-source-links]   ${flag}DEAD (${r.httpStatus}): ${r.url} [${r.contexts.join("; ")}]`,
    );
  }
  for (const r of timedOut) {
    console.warn(
      `[check-source-links]   UNREACHABLE (${r.status}): ${r.url} [${r.contexts.join("; ")}] - ${r.error ?? ""}`,
    );
  }

  if (failOnDead && newlyDead.length > 0) {
    console.error(`[check-source-links] ${newlyDead.length} newly-dead link(s) found.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[check-source-links] failed:", err);
  process.exit(1);
});
