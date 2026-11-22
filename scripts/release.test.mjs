// node --test scripts/release.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateManifest } from "./write-build-manifest.mjs";
import { checkManifest, checkHomepage, mainScript } from "./verify-release.mjs";
import { shouldNetlifyBuild } from "./netlify-ignore-build.mjs";

const SHA = "a".repeat(40);
const good = {
  schema: "accessmi-build/v2",
  commit: SHA,
  context: "production",
  deploy_id: "abc123",
  entry_html_sha256: "f".repeat(64),
  entry_module_script: "/assets/index-AB.js",
  datasets: { "x.json": { present: true, populated: true } },
};

test("manifest validation fails closed on short or mismatched commits", () => {
  assert.deepEqual(validateManifest(good, { headSha: SHA }), []);
  assert.match(validateManifest({ ...good, commit: "deadbeef" })[0], /not a full SHA/);
  assert.match(validateManifest(good, { headSha: "b".repeat(40) })[0], /does not match/);
  assert.match(validateManifest({ ...good, entry_html_sha256: null }).join(), /index.html is missing/);
  assert.match(validateManifest({ ...good, datasets: { "s.json": { present: true, populated: false } } }).join(), /not populated/);
  assert.match(validateManifest({ ...good, datasets: { "s.json": { present: false } } }).join(), /missing/);
});

test("verifier rejects a production build.json for another commit or context", () => {
  assert.ok(checkManifest(good, SHA).every((r) => r.ok));
  assert.equal(checkManifest(good, "b".repeat(40)).find((r) => r.id === "manifest.commit").ok, false);
  assert.equal(checkManifest({ ...good, context: "deploy-preview" }, SHA).find((r) => r.id === "manifest.context").ok, false);
  assert.equal(checkManifest(null, SHA).every((r) => r.ok), false);
});

test("homepage checks require an H1 and tie served HTML to the build", () => {
  const html = '<html><h1>Michigan data</h1><script type="module" crossorigin src="/assets/index-AB.js"></script></html>';
  assert.equal(mainScript(html), "/assets/index-AB.js");
  assert.ok(checkHomepage(html, good.entry_html_sha256, good).every((x) => x.ok));
  assert.equal(checkHomepage("<html></html>", "0", good).find((x) => x.id === "home.h1").ok, false);
});

test("transformed HTML passes only when it loads this build's entry bundle", () => {
  const entry = (r) => r.find((x) => x.id === "home.entry-html").ok;
  const same = '<h1>Michigan data</h1><!-- injected --><script type="module" src="/assets/index-AB.js"></script>';
  const stale = '<h1>Michigan data</h1><script type="module" src="/assets/old-release.js"></script>';
  assert.equal(entry(checkHomepage(same, "different-hash", good)), true);
  assert.equal(entry(checkHomepage(stale, "different-hash", good)), false);
  assert.equal(entry(checkHomepage("<h1>Michigan data</h1>", "different-hash", good)), false);
  // A manifest that records no entry bundle cannot vouch for transformed HTML.
  assert.equal(entry(checkHomepage(same, "different-hash", { ...good, entry_module_script: null })), false);
  assert.match(validateManifest({ ...good, entry_module_script: null }).join(), /no module script/);
});

test("netlify ignore policy only builds production for release markers", () => {
  assert.equal(shouldNetlifyBuild("deploy-preview", "anything"), true);
  assert.equal(shouldNetlifyBuild("production", "chore(release): publish production 2026-11-22"), true);
  assert.equal(shouldNetlifyBuild("production", "data: facility refresh"), false);
});
