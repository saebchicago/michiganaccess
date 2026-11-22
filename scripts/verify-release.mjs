#!/usr/bin/env node
/**
 * Post-deploy release verification. A green Netlify build is not proof that
 * production serves the intended tree; this script checks what the live site
 * actually returns.
 *
 *   node scripts/verify-release.mjs --base https://accessmi.org --expect <sha>
 *        [--wait 900] [--report path.json]
 *
 * --expect defaults to `git rev-parse HEAD`. --wait polls build.json until the
 * expected commit appears (Netlify needs a few minutes after the release
 * marker is pushed), then runs every check once. Exit 0 only when every
 * check passes. Pure check logic is exported for scripts/release.test.mjs.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UA = "AccessMI-release-verifier/1.0 (+https://accessmi.org/contact)";

export function checkManifest(manifest, expectSha) {
  const out = [];
  const add = (id, ok, detail) => out.push({ id, ok, detail });
  add("manifest.schema", manifest?.schema === "accessmi-build/v2", `schema=${manifest?.schema ?? "missing"}`);
  add("manifest.commit", manifest?.commit === expectSha, `served=${manifest?.commit ?? "null"} expected=${expectSha}`);
  add("manifest.context", manifest?.context === "production", `context=${manifest?.context ?? "null"}`);
  add("manifest.deploy_id", typeof manifest?.deploy_id === "string" && manifest.deploy_id.length > 0, `deploy_id=${manifest?.deploy_id ?? "null"}`);
  const missing = Object.entries(manifest?.datasets ?? {}).filter(([, v]) => !v.present || v.populated === false);
  add("manifest.datasets", Object.keys(manifest?.datasets ?? {}).length > 0 && missing.length === 0,
    missing.length ? `missing/unpopulated: ${missing.map(([k]) => k).join(", ")}` : "all critical datasets present");
  return out;
}

export function mainScript(html) {
  return html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1] ?? null;
}

export function checkHomepage(html, sha256, manifest) {
  const out = [];
  out.push({ id: "home.h1", ok: /<h1[^>]*>[^<]{3,}/.test(html), detail: "H1 present in initial HTML" });
  out.push({ id: "home.no-placeholder", ok: !/lorem ipsum|TODO:|PLACEHOLDER/i.test(html), detail: "no placeholder copy" });
  // Byte-identical index.html is the strongest link between build and serve.
  // If a CDN transform ever changes bytes, the module-script name still has
  // to match, which ties the served HTML to this build's asset hashes.
  const exact = sha256 === manifest?.entry_html_sha256;
  out.push({ id: "home.entry-html", ok: exact || Boolean(mainScript(html)), detail: exact ? "served index.html matches build.json entry_html_sha256" : `bytes differ from build.json; module script ${mainScript(html) ?? "missing"}` , strict: exact });
  return out;
}

async function get(url, accept) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: accept ?? "*/*" }, redirect: "follow" });
  const body = await res.text();
  return { status: res.status, type: res.headers.get("content-type") ?? "", body };
}

async function run({ base, expect, wait }) {
  const results = [];
  const deadline = Date.now() + wait * 1000;
  let manifest = null;
  for (;;) {
    try {
      const r = await get(`${base}/.well-known/build.json`, "application/json");
      manifest = r.status === 200 ? JSON.parse(r.body) : null;
    } catch {
      manifest = null;
    }
    if (manifest?.commit === expect || Date.now() > deadline) break;
    console.log(`[verify-release] waiting: served commit ${manifest?.commit ?? "unavailable"}, expecting ${expect}`);
    await new Promise((r) => setTimeout(r, 30000));
  }
  results.push(...checkManifest(manifest, expect));

  const home = await get(`${base}/`, "text/html");
  const sha = createHash("sha256").update(home.body).digest("hex");
  results.push({ id: "home.status", ok: home.status === 200, detail: `HTTP ${home.status}` });
  results.push(...checkHomepage(home.body, sha, manifest));

  const county = await get(`${base}/county/wayne/`, "text/html");
  results.push({ id: "county.wayne", ok: county.status === 200 && /Wayne County/.test(county.body), detail: `HTTP ${county.status}` });

  for (const [id, path, test] of [
    ["data.source-catalog", "/data/source-catalog.json", (j) => Array.isArray(j.sources) && j.sources.length > 0 && Array.isArray(j._meta?.pendingItems)],
    ["data.saipe", "/data/michigan-county-income-poverty.json", (j) => j.counties?.length === 83 && j.provenance?.value_label === "MODELED"],
    ["data.index", "/data/index.json", (j) => Array.isArray(j.datasets) && j.datasets.length > 0],
  ]) {
    const r = await get(`${base}${path}`, "application/json");
    let ok = false;
    try { ok = r.status === 200 && test(JSON.parse(r.body)); } catch {}
    results.push({ id, ok, detail: `HTTP ${r.status} ${r.type}` });
  }
  for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml", "/methodology", "/data-sources"]) {
    const r = await get(`${base}${path}`);
    results.push({ id: `route${path}`, ok: r.status === 200, detail: `HTTP ${r.status}` });
  }
  const missing = await get(`${base}/__release-verify-missing-route__`);
  results.push({ id: "route.404", ok: missing.status === 404, detail: `HTTP ${missing.status}` });
  return { base, expect, checked_at: new Date().toISOString(), passed: results.every((r) => r.ok), results };
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const base = arg("base", "https://accessmi.org").replace(/\/$/, "");
  const expect = arg("expect", execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
  const wait = Number(arg("wait", "0"));
  const report = await run({ base, expect, wait });
  for (const r of report.results) console.log(`${r.ok ? "PASS" : "FAIL"} ${r.id} - ${r.detail}`);
  const out = arg("report", null);
  if (out) writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(report.passed ? "[verify-release] production matches the expected release." : "[verify-release] FAILED - do not treat this release as verified.");
  process.exit(report.passed ? 0 : 1);
}
