#!/usr/bin/env node
/**
 * Agent-consumer evaluation harness.
 *
 * Runs scripts/lib/agent-consumer.mjs, a naive automated reader that starts
 * from /llms.txt and knows nothing else, through ten capabilities plus
 * intentional refusals. Each case passes or fails; there is no score.
 *
 *   node scripts/check-agent-readiness.mjs                 # public/ (+ dist/ for build.json)
 *   node scripts/check-agent-readiness.mjs --base https://accessmi.org
 *   ... --report docs/agent-readiness/report.json
 *
 * Local mode is deterministic and runs in `pnpm build` and CI. Live mode
 * reads the deployed site; results depend on what production serves.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareValues, describe, discover, getJson, readCountyValue, reusePosition } from "./lib/agent-consumer.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const argv = process.argv.slice(2);
const flag = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const base = flag("base")?.replace(/\/$/, "") ?? null;
const reportPath = flag("report");

function localFetcher() {
  const roots = [path.join(ROOT, "public"), path.join(ROOT, "dist")];
  return async (p) => {
    const rel = p.replace(/^\//, "");
    for (const r of roots) {
      const f = path.join(r, rel);
      if (existsSync(f)) {
        return { status: 200, contentType: f.endsWith(".json") ? "application/json" : "text/plain", body: readFileSync(f, "utf8") };
      }
    }
    return { status: 404, contentType: "text/html", body: "<!doctype html><title>Not found</title>" };
  };
}

function liveFetcher(origin) {
  return async (p) => {
    try {
      const res = await fetch(`${origin}${p}`, { headers: { "user-agent": "AccessMI-agent-readiness-harness/1.0 (+https://accessmi.org/contact)" } });
      return { status: res.status, contentType: res.headers.get("content-type") ?? "", body: await res.text() };
    } catch (e) {
      return { status: 0, contentType: "", body: String(e) };
    }
  };
}

const fetcher = base ? liveFetcher(base) : localFetcher();
const cases = [];
const record = (id, capability, ok, detail, status = ok ? "pass" : "fail") => cases.push({ id, capability, status, detail });

const WAYNE = "26163";
const OAKLAND = "26125";
const KEWEENAW = "26083";

const disc = await discover(fetcher);
record("C1", "Discover a supported public dataset from llms.txt", disc.ok && disc.index.datasets?.some((d) => d.status === "supported"),
  disc.ok ? `index ${disc.indexPath}: ${disc.index.datasets.filter((d) => d.status === "supported").length} supported datasets` : disc.reason);

if (disc.ok) {
  const index = disc.index;
  const saipe = await describe(fetcher, index, "michigan-county-income-poverty");
  record("C2", "Retrieve without credentials and validate against the published schema", saipe.ok && index._meta?.access?.credentials === "none",
    saipe.ok ? `credentials=${index._meta.access.credentials}; schema valid` : saipe.refusal + (saipe.schemaErrors ? `: ${saipe.schemaErrors.slice(0, 3).join("; ")}` : ""));

  const others = [];
  for (const d of index.datasets.filter((x) => x.status === "supported" && x.id !== "build-manifest")) {
    const r = await describe(fetcher, index, d.id);
    others.push(r.ok ? `${d.id} ok` : `${d.id}: ${r.refusal}${r.schemaErrors ? ` (${r.schemaErrors.slice(0, 2).join("; ")})` : ""}`);
  }
  record("C2b", "Every supported dataset matches its published schema", others.every((o) => o.endsWith(" ok")), others.join("; "));

  if (saipe.ok) {
    record("C3", "Identify the original source", /^https:\/\/www\.census\.gov\//.test(saipe.sourceUrl ?? "") && /^https:\/\/www2\.census\.gov\//.test(saipe.downloadUrl ?? ""),
      `source=${saipe.sourceUrl} download=${saipe.downloadUrl}`);
    record("C4", "Determine reporting year and geography (retrieval date kept separate)",
      Number.isInteger(saipe.releaseVersion) && saipe.geographyUnit === "county" && Boolean(saipe.retrievedAt) && !String(saipe.retrievedAt).startsWith(String(saipe.releaseVersion) + "-"),
      `estimate year=${saipe.releaseVersion}, geography=${saipe.geographyUnit}, retrieved=${saipe.retrievedAt}`);
    record("C5", "Distinguish observed from modeled data", saipe.label === "MODELED" && saipe.labelDeclaredMatches && saipe.data.measures.every((m) => m.value_label === saipe.label),
      `dataset label=${saipe.label}; index declares ${saipe.entry.epistemic_label}`);

    const nullCells = saipe.data.counties.flatMap((c) => Object.entries(c.values).filter(([, v]) => v === null).map(([k]) => `${c.countyFips}:${k}`));
    const noCi = saipe.data.measures.filter((m) => saipe.data.counties.every((c) => !c.confidence?.[m.id])).map((m) => m.id);
    // Fixture: a suppressed cell must be refused, never read as zero.
    const suppressed = structuredClone(saipe);
    suppressed.data.counties.find((c) => c.countyFips === KEWEENAW).values.povertyPct = null;
    const refusal = readCountyValue(suppressed, KEWEENAW, "povertyPct");
    record("C6", "Identify unavailable or suppressed values", !refusal.ok && /not zero/.test(refusal.refusal) && /never zero/.test(saipe.entry.missingness ?? ""),
      `${nullCells.length} null cells in the live file; suppressed fixture refused: "${refusal.refusal}"; measures without published bounds: ${noCi.join(", ") || "none"}`);

    // C7: incompatible denominators or geographies must be refused.
    const wayne = { ...readCountyValue(saipe, WAYNE, "povertyPct"), program: "SAIPE" };
    const zctaFixture = { ok: true, value: 30.1, unit: "percent", period: 2024, interval: [28, 32], program: "ACS 5-year", geography: { unit: "zcta", id: "48201", name: "ZCTA 48201" } };
    const acsCounty = { ...wayne, program: "ACS 5-year", period: "2020-2024" };
    const geoRefuse = compareValues(wayne, zctaFixture);
    const periodRefuse = compareValues(wayne, acsCounty);
    const unitRefuse = compareValues(wayne, { ...readCountyValue(saipe, OAKLAND, "medianHouseholdIncome"), program: "SAIPE" });
    record("C7", "Detect incompatible geographies, periods and units (intentional refusal)",
      geoRefuse.verdict === "refuse" && periodRefuse.verdict === "refuse" && unitRefuse.verdict === "refuse",
      `county vs ZCTA: ${geoRefuse.reason}; SAIPE 2024 vs ACS 2020-2024: ${periodRefuse.reason}; percent vs dollars: ${unitRefuse.reason}`);

    // C8: caveats recoverable, and uncertainty changes the conclusion.
    const oakland = { ...readCountyValue(saipe, OAKLAND, "povertyPct"), program: "SAIPE" };
    const cmp = compareValues(wayne, oakland);
    const overlapFixture = compareValues({ ...wayne, interval: [10, 14] }, { ...oakland, interval: [12, 16] });
    const noCiFixture = compareValues({ ...wayne, interval: null }, oakland);
    const catalog = await getJson(fetcher, "/data/source-catalog.json");
    const pending = catalog.ok ? catalog.json._meta?.pendingItems ?? [] : [];
    record("C8", "Recover material methodological caveats",
      (saipe.entry.comparability?.length ?? 0) > 0 && /overlap/i.test(saipe.entry.uncertainty ?? "") && pending.some((p) => p.id === "mixed-acs-periods") &&
        overlapFixture.verdict === "no_established_difference" && noCiFixture.verdict === "no_established_difference" && cmp.verdict !== "refuse",
      `${saipe.entry.comparability.length} comparability notes; ${pending.length} catalog pendingItems; Wayne vs Oakland poverty: ${cmp.verdict} (${cmp.reason}); overlapping fixture: ${overlapFixture.verdict}; missing-interval fixture: ${noCiFixture.verdict}`);

    const reuse = reusePosition(index, saipe.entry);
    record("C9", "Understand whether automated reuse is permitted",
      reuse.accessmiReads === "permitted" && reuse.upstreamTerms === "not_established" && reuse.robotsIsNotALicense && Boolean(reuse.rateLimit),
      `AccessMI reads: ${reuse.accessmiReads}; upstream terms: ${reuse.upstreamTerms}; robots.txt treated as not a license: ${reuse.robotsIsNotALicense}`);
  } else {
    for (const id of ["C3", "C4", "C5", "C6", "C7", "C8", "C9"]) record(id, "(depends on C2)", false, "skipped because the dataset could not be described", "not_executed");
  }

  // C10: fail safely.
  const missing = await describe(fetcher, index, "does-not-exist");
  const unsupported = await describe(fetcher, index, "sam-exclusions");
  const brokenIndex = { ...index, datasets: index.datasets.map((d) => (d.id === "michigan-county-income-poverty" ? { ...d, path: "/data/__missing__.json" } : d)) };
  const brokenPath = await describe(fetcher, brokenIndex, "michigan-county-income-poverty");
  const badData = { ...index, datasets: [{ ...index.datasets.find((d) => d.id === "michigan-county-income-poverty"), path: "/data/source-catalog.json" }] };
  const schemaMismatch = await describe(fetcher, badData, "michigan-county-income-poverty");
  record("C10", "Fail safely when information is missing",
    !missing.ok && !unsupported.ok && /empty list does NOT mean/.test(unsupported.refusal) && !brokenPath.ok && !schemaMismatch.ok,
    `unknown id: "${missing.refusal}"; unsupported: "${unsupported.refusal}"; missing file: "${brokenPath.refusal}"; wrong file: "${schemaMismatch.refusal}"`);

  const build = await getJson(fetcher, "/.well-known/build.json");
  if (build.ok) {
    record("P1", "Live build provenance is machine-readable", build.json.schema === "accessmi-build/v2" && /^[0-9a-f]{40}$/.test(build.json.commit ?? ""),
      `schema=${build.json.schema ?? "missing"} commit=${build.json.commit ?? "missing"}`);
  } else {
    record("P1", "Live build provenance is machine-readable", false, `build.json unavailable (${build.reason}); local mode needs dist/ from a build`, "not_executed");
  }
}

const failed = cases.filter((c) => c.status === "fail");
const report = {
  harness: "scripts/check-agent-readiness.mjs",
  mode: base ? `live ${base}` : "local public/ and dist/",
  ran_at: new Date().toISOString(),
  totals: { pass: cases.filter((c) => c.status === "pass").length, fail: failed.length, not_executed: cases.filter((c) => c.status === "not_executed").length },
  cases,
};
for (const c of cases) console.log(`${c.status.toUpperCase().padEnd(12)} ${c.id} ${c.capability} - ${c.detail}`);
if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (failed.length) {
  console.error(`[check-agent-readiness] FAIL - ${failed.length} case(s) failed.`);
  process.exit(1);
}
console.log(`[check-agent-readiness] ok - ${report.totals.pass} passed, ${report.totals.not_executed} not executed.`);
