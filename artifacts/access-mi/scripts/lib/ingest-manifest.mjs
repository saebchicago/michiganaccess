#!/usr/bin/env node
/**
 * Shared archival-manifest utilities for the data-ingestion scripts.
 *
 * Every ingest script (build-*.mjs, refresh-*.mjs) that fetches an
 * external source can call fetchAndRecord() in place of a bare fetch(),
 * or call createManifestEntry() directly if it already holds the raw
 * payload for its own reasons (binary formats, custom node:http calls).
 * At the end of a run, call writeManifest() once with the accumulated
 * entries to produce one JSON file per build run under
 * ingest-manifest/<build-id>.json, with small payloads (<= PAYLOAD_CAP_BYTES)
 * archived gzip-compressed alongside it under ingest-manifest/payloads/.
 *
 * This module observes and records. It does not change what data is
 * fetched, how it is parsed, or how figures are computed - callers keep
 * their own fetch calls and validation; this only adds a parallel
 * recording path plus a shared, stricter shape guard than the various
 * one-off assertNotHtml-style checks scattered across scripts today.
 *
 * Failure is loud by design: assertShapeOk() and fetchAndRecord() throw
 * on a bad payload rather than returning a boolean or a null. Callers
 * that want a soft-fail path (e.g. an optional/advisory source) must
 * catch explicitly - this module never swallows an error itself.
 */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { writeFile, mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** Raw payloads at or under this size are archived (gzip-compressed)
 * alongside the manifest. Larger payloads (FARS/SNAP bulk ZIPs) are
 * recorded (checksum, size, status) but not archived, per the owner's
 * storage decision: manifest in-repo, payloads in-repo under a cap. */
export const PAYLOAD_CAP_BYTES = 2 * 1024 * 1024; // 2 MB

export const MANIFEST_DIR = "ingest-manifest";

/** Query-string parameter names known to carry API credentials across
 * this pipeline's sources. Extend this list, do not work around it. */
const REDACT_PARAMS = ["key", "api_key", "apikey"];

/** Redact known credential query parameters from a URL string. Falls
 * back to a regex pass for strings that are not valid absolute URLs
 * (defensive - every caller in this pipeline passes a real URL). */
export function redactUrl(url) {
  try {
    const parsed = new URL(url);
    for (const param of REDACT_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, "REDACTED");
      }
    }
    return parsed.toString();
  } catch {
    return String(url).replace(
      /([?&](?:key|api_key|apikey)=)[^&]+/gi,
      "$1REDACTED",
    );
  }
}

export function sha256(bufferOrString) {
  const buf = Buffer.isBuffer(bufferOrString)
    ? bufferOrString
    : Buffer.from(bufferOrString ?? "", "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Shape validation for text payloads: does this look like the expected
 * data format, or an HTML error page riding a 200 status? Throws with a
 * message naming the source on failure - never returns false silently.
 */
export function assertShapeOk({ label, text, contentType, minBytes = 1 }) {
  const trimmed = (text ?? "").trimStart();
  const looksHtml =
    /^<!doctype html/i.test(trimmed) ||
    /^<html/i.test(trimmed) ||
    (trimmed.startsWith("<") && !trimmed.startsWith("<?xml"));
  if (looksHtml) {
    throw new Error(
      `[ingest-manifest] ${label}: payload looks like an HTML page ` +
        `(content-type=${contentType ?? "unknown"}), not the expected data ` +
        `shape. First 200 chars: ${trimmed.slice(0, 200)}`,
    );
  }
  const byteSize = Buffer.byteLength(text ?? "", "utf8");
  if (byteSize < minBytes) {
    throw new Error(
      `[ingest-manifest] ${label}: payload is ${byteSize} bytes, below the ` +
        `expected minimum of ${minBytes}. Refusing to treat as valid.`,
    );
  }
}

/**
 * Build one manifest entry from an already-retrieved payload. Callers
 * that hold a binary Buffer (ZIP/xlsx sources) pass it directly; text
 * payloads may be passed as a string. `valid`/`invalidReason` reflect the
 * caller's own shape validation - this function does not re-validate.
 */
export function createManifestEntry({
  sourceId,
  url,
  status,
  contentType,
  payload,
  vintage,
  valid,
  invalidReason,
}) {
  const buf = Buffer.isBuffer(payload)
    ? payload
    : Buffer.from(payload ?? "", "utf8");
  const entry = {
    source_id: sourceId,
    request_url: redactUrl(url),
    retrieved_at: new Date().toISOString(),
    http_status: status ?? null,
    content_type: contentType ?? null,
    byte_size: buf.length,
    sha256: sha256(buf),
    source_vintage: vintage ?? null,
    valid: Boolean(valid),
    invalid_reason: invalidReason ?? null,
    payload_stored: false,
    payload_path: null,
  };
  if (entry.valid && buf.length > 0 && buf.length <= PAYLOAD_CAP_BYTES) {
    // Internal field, stripped before the entry is written to disk.
    Object.defineProperty(entry, "_payloadBuffer", {
      value: buf,
      enumerable: false,
    });
  }
  return entry;
}

/**
 * Convenience wrapper: fetch a URL, hold the raw payload, validate its
 * shape, push a manifest entry into `entries`, and return the raw
 * payload (text or Buffer) for the caller to parse. Throws on a failed
 * fetch or a failed shape check - always after recording the manifest
 * entry for the failed attempt, so a bad source is never silently
 * missing from the manifest.
 */
export async function fetchAndRecord({
  sourceId,
  url,
  headers,
  method,
  body,
  vintage,
  minBytes = 1,
  binary = false,
  entries,
}) {
  if (!Array.isArray(entries)) {
    throw new Error(
      `[ingest-manifest] fetchAndRecord(${sourceId}): 'entries' array is required`,
    );
  }
  const res = await fetch(url, { headers, method, body });
  const status = res.status;
  const contentType = res.headers.get("content-type");
  const payload = binary
    ? Buffer.from(await res.arrayBuffer())
    : await res.text();

  if (!res.ok) {
    entries.push(
      createManifestEntry({
        sourceId,
        url,
        status,
        contentType,
        payload,
        vintage,
        valid: false,
        invalidReason: `HTTP ${status}`,
      }),
    );
    throw new Error(`[${sourceId}] fetch failed: HTTP ${status}`);
  }

  let valid = true;
  let invalidReason = null;
  try {
    if (binary) {
      if (payload.length < minBytes) {
        throw new Error(
          `payload is ${payload.length} bytes, below the expected minimum of ${minBytes}`,
        );
      }
    } else {
      assertShapeOk({ label: sourceId, text: payload, contentType, minBytes });
    }
  } catch (err) {
    valid = false;
    invalidReason = err.message;
  }

  entries.push(
    createManifestEntry({
      sourceId,
      url,
      status,
      contentType,
      payload,
      vintage,
      valid,
      invalidReason,
    }),
  );

  if (!valid) {
    throw new Error(`[${sourceId}] shape validation failed: ${invalidReason}`);
  }
  return payload;
}

/**
 * Write the accumulated manifest entries for one build run. Archives
 * (gzip-compressed) any entry whose payload is valid and at or under
 * PAYLOAD_CAP_BYTES; larger or invalid payloads are recorded (checksum,
 * size, status) without a stored copy.
 */
export async function writeManifest({ projectRoot, buildId, entries }) {
  if (!projectRoot) throw new Error("[ingest-manifest] projectRoot is required");
  if (!buildId) throw new Error("[ingest-manifest] buildId is required");

  const dir = path.join(projectRoot, MANIFEST_DIR);
  await mkdir(dir, { recursive: true });

  const written = [];
  for (const entry of entries) {
    const buf = entry._payloadBuffer;
    const rest = { ...entry };
    delete rest._payloadBuffer;
    if (buf) {
      const payloadsDir = path.join(dir, "payloads");
      await mkdir(payloadsDir, { recursive: true });
      const fileName = `${entry.source_id}-${entry.sha256.slice(0, 12)}.gz`;
      await writeFile(path.join(payloadsDir, fileName), gzipSync(buf));
      rest.payload_stored = true;
      rest.payload_path = path.posix.join("payloads", fileName);
    }
    written.push(rest);
  }

  const manifest = {
    schema: "ingest-manifest.v1",
    build_id: buildId,
    generated_at: new Date().toISOString(),
    payload_cap_bytes: PAYLOAD_CAP_BYTES,
    entries: written,
  };

  const manifestPath = path.join(dir, `${buildId}.json`);
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifestPath;
}

/**
 * Scan every ingest-manifest/*.json file and resolve, per source_id, the
 * most recent entry and the most recent *valid* entry. This is what lets
 * the app answer "is this source's latest refresh attempt healthy, and
 * if not, when did we last successfully retrieve it" without the app
 * needing to read every historical manifest file itself.
 *
 * Returns a plain object keyed by source_id:
 *   {
 *     [sourceId]: {
 *       latest_valid: boolean,       // was the most recent attempt valid?
 *       latest_retrieved_at: string, // ISO timestamp of the most recent attempt
 *       last_valid_retrieved_at: string | null, // ISO timestamp of the last
 *                                                // attempt that was valid, or
 *                                                // null if none ever were
 *       invalid_reason: string | null,
 *     }
 *   }
 */
export async function summarizeSourceHealth({ projectRoot }) {
  const dir = path.join(projectRoot, MANIFEST_DIR);
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return {};
  }

  const bySource = {};
  for (const file of files.sort()) {
    let manifest;
    try {
      manifest = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    } catch {
      continue; // corrupt/partial manifest file - skip, do not fail the summary
    }
    for (const entry of manifest.entries ?? []) {
      const existing = bySource[entry.source_id] ?? {
        latest_valid: false,
        latest_retrieved_at: null,
        last_valid_retrieved_at: null,
        invalid_reason: null,
      };
      // Files are processed in sorted (chronological, since build_id embeds
      // an ISO timestamp) order, so the last write for a source_id wins.
      existing.latest_valid = entry.valid;
      existing.latest_retrieved_at = entry.retrieved_at;
      existing.invalid_reason = entry.valid ? null : entry.invalid_reason;
      if (entry.valid) existing.last_valid_retrieved_at = entry.retrieved_at;
      bySource[entry.source_id] = existing;
    }
  }
  return bySource;
}
