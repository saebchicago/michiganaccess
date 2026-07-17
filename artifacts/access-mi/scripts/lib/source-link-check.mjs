#!/usr/bin/env node
/**
 * Shared helpers for checking whether the citation URLs in
 * src/data/sourceManifest.ts and src/data/sourcesRegistry.ts still
 * resolve. Those two files carry no automated ingestion pipeline (unlike
 * the sources tracked in sourceHealth.ts/build-source-health.mjs) - they
 * are narrative numeric claims and reference-only source links, so the
 * only thing that can be checked mechanically is "is the URL still
 * alive," not "did the underlying figure change."
 *
 * This module only reads and reports. It never writes to
 * sourceManifest.ts or sourcesRegistry.ts - both are sacrosanct files;
 * a dead or redirected link needs a human to find the correct
 * replacement URL, not an automated edit.
 */
import { readFile } from "node:fs/promises";

/** Extracts every `url: "..."` occurrence from a TS source file's text,
 * paired with the nearest preceding `context:`/`name:` label for
 * reporting, without parsing the file as TypeScript (matches the
 * regex-over-source-text approach already used by check-counts.mjs).
 *
 * Works over the whole file text by string offset rather than
 * line-by-line, since entries in sourceManifest.ts are single-line
 * objects (label and url on the same line) while entries in
 * sourcesRegistry.ts are multi-line (label on an earlier line) - a
 * per-line scan misses one shape or the other. */
export function extractUrlEntries(sourceText) {
  const labelRe = /(?:context|name)\s*:\s*"([^"]*)"/g;
  const urlRe = /url\s*:\s*"([^"]*)"/g;

  const labels = [];
  let m;
  while ((m = labelRe.exec(sourceText)) !== null) {
    labels.push({ index: m.index, value: m[1] });
  }

  const entries = [];
  while ((m = urlRe.exec(sourceText)) !== null) {
    let nearest = null;
    for (const label of labels) {
      if (label.index <= m.index) nearest = label;
      else break;
    }
    entries.push({ url: m[1], label: nearest?.value ?? "(unlabeled)" });
  }
  return entries;
}

/** Reads both registry files and returns a deduplicated URL -> labels map. */
export async function collectSourceUrls({
  sourceManifestPath,
  sourcesRegistryPath,
}) {
  const [manifestText, registryText] = await Promise.all([
    readFile(sourceManifestPath, "utf8"),
    readFile(sourcesRegistryPath, "utf8"),
  ]);
  const all = [
    ...extractUrlEntries(manifestText),
    ...extractUrlEntries(registryText),
  ];
  const byUrl = new Map();
  for (const { url, label } of all) {
    if (!byUrl.has(url)) byUrl.set(url, new Set());
    byUrl.get(url).add(label);
  }
  return byUrl;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/** Classifies a single URL by attempting HEAD first (cheaper), falling
 * back to GET when the host rejects HEAD (a common anti-bot posture on
 * .gov sites), never throwing - every outcome is captured in the result
 * object so a caller can check hundreds of URLs without a try/catch
 * around each one. */
export async function checkUrl(url, { timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "accessmi-source-link-check/1.0" },
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await attempt("HEAD");
    if (res.status === 405 || res.status === 501) {
      res = await attempt("GET");
    }
    const finalUrl = res.url && res.url !== url ? res.url : null;
    if (res.status >= 200 && res.status < 300) {
      return { url, status: "ok", httpStatus: res.status, finalUrl };
    }
    if (res.status >= 300 && res.status < 400) {
      return { url, status: "redirect", httpStatus: res.status, finalUrl };
    }
    if (res.status >= 400 && res.status < 500) {
      return { url, status: "client-error", httpStatus: res.status, finalUrl };
    }
    return { url, status: "server-error", httpStatus: res.status, finalUrl };
  } catch (err) {
    const isAbort = err?.name === "AbortError";
    return {
      url,
      status: isAbort ? "timeout" : "network-error",
      httpStatus: null,
      finalUrl: null,
      error: String(err?.message ?? err),
    };
  }
}

const DEFAULT_CONCURRENCY = 6;

/** Runs checkUrl over every entry in a URL map with bounded concurrency
 * (external hosts, mostly .gov - deliberately not hammering them with
 * ~70 simultaneous requests). Returns results in Map-iteration order. */
export async function checkAllUrls(byUrl, opts = {}) {
  const { concurrency = DEFAULT_CONCURRENCY, ...checkOpts } = opts;
  const entries = [...byUrl.entries()];
  const results = new Array(entries.length);
  let next = 0;

  async function worker() {
    while (next < entries.length) {
      const i = next++;
      const [url, labels] = entries[i];
      const result = await checkUrl(url, checkOpts);
      results[i] = { ...result, contexts: [...labels] };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, entries.length) }, worker),
  );
  return results;
}
