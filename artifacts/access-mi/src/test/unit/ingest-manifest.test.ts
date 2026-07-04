import { describe, it, expect, afterEach, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  redactUrl,
  sha256,
  assertShapeOk,
  createManifestEntry,
  writeManifest,
  summarizeSourceHealth,
  fetchAndRecord,
  PAYLOAD_CAP_BYTES,
} from "../../../scripts/lib/ingest-manifest.mjs";

describe("redactUrl", () => {
  it("redacts a Census-style key= query parameter", () => {
    const url = "https://api.census.gov/data/2022/acs/acs5?get=NAME&key=SECRET123";
    expect(redactUrl(url)).not.toContain("SECRET123");
    expect(redactUrl(url)).toContain("key=REDACTED");
  });

  it("redacts a SAM.gov-style api_key= query parameter", () => {
    const url = "https://api.sam.gov/entity-information/v3/exclusions?api_key=TOPSECRET&classification=Firm";
    expect(redactUrl(url)).not.toContain("TOPSECRET");
    expect(redactUrl(url)).toContain("api_key=REDACTED");
  });

  it("redacts multiple occurrences of a key parameter", () => {
    const url = "https://example.com/a?api_key=FIRST&b=1&api_key=SECOND";
    const redacted = redactUrl(url);
    expect(redacted).not.toContain("FIRST");
    expect(redacted).not.toContain("SECOND");
  });

  it("leaves a URL with no credential parameters unchanged", () => {
    const url = "https://data.cdc.gov/resource/abcd-1234.json?$limit=100";
    expect(redactUrl(url)).toBe(url);
  });

  it("falls back to regex redaction for a non-parseable URL string", () => {
    const notAUrl = "not a real url ?key=SECRET&other=1";
    expect(redactUrl(notAUrl)).not.toContain("SECRET");
  });
});

describe("sha256", () => {
  it("is deterministic for the same input", () => {
    expect(sha256("hello")).toBe(sha256("hello"));
  });

  it("differs for different input", () => {
    expect(sha256("hello")).not.toBe(sha256("world"));
  });

  it("accepts a Buffer identically to the equivalent string", () => {
    expect(sha256(Buffer.from("hello", "utf8"))).toBe(sha256("hello"));
  });
});

describe("assertShapeOk", () => {
  it("throws when the payload is an HTML error page (the 200-masked-error case)", () => {
    const html = "<!DOCTYPE html><html><body>Access Denied</body></html>";
    expect(() =>
      assertShapeOk({ label: "test-source", text: html, contentType: "text/html" }),
    ).toThrow(/looks like an HTML page/);
  });

  it("throws when the payload is an empty string", () => {
    expect(() =>
      assertShapeOk({ label: "test-source", text: "", contentType: "application/json", minBytes: 10 }),
    ).toThrow(/below the expected minimum/);
  });

  it("throws when the payload is below the configured minimum size", () => {
    expect(() =>
      assertShapeOk({ label: "test-source", text: "{}", contentType: "application/json", minBytes: 1000 }),
    ).toThrow(/below the expected minimum/);
  });

  it("does not throw for a plausible JSON payload", () => {
    expect(() =>
      assertShapeOk({
        label: "test-source",
        text: JSON.stringify({ ok: true, rows: [1, 2, 3] }),
        contentType: "application/json",
        minBytes: 5,
      }),
    ).not.toThrow();
  });

  it("does not throw for XML content starting with a declaration", () => {
    expect(() =>
      assertShapeOk({
        label: "test-source",
        text: '<?xml version="1.0"?><root>ok</root>',
        contentType: "application/xml",
        minBytes: 5,
      }),
    ).not.toThrow();
  });
});

describe("createManifestEntry", () => {
  it("redacts the recorded request_url", () => {
    const entry = createManifestEntry({
      sourceId: "test-source",
      url: "https://api.census.gov/data?key=SECRET",
      status: 200,
      contentType: "application/json",
      payload: "{}",
      valid: true,
    });
    expect(entry.request_url).not.toContain("SECRET");
  });

  it("computes byte_size and sha256 from the payload", () => {
    const entry = createManifestEntry({
      sourceId: "test-source",
      url: "https://example.com/data.json",
      status: 200,
      contentType: "application/json",
      payload: "hello",
      valid: true,
    });
    expect(entry.byte_size).toBe(5);
    expect(entry.sha256).toBe(sha256("hello"));
  });

  it("marks payload_stored false for an invalid entry even if small", () => {
    const entry = createManifestEntry({
      sourceId: "test-source",
      url: "https://example.com/data.json",
      status: 200,
      contentType: "text/html",
      payload: "<html>error</html>",
      valid: false,
      invalidReason: "looked like HTML",
    });
    expect(entry.valid).toBe(false);
    expect(entry.invalid_reason).toBe("looked like HTML");
  });

  it("does not attach a storable payload buffer for an empty payload", () => {
    const entry = createManifestEntry({
      sourceId: "test-source",
      url: "https://example.com/data.json",
      status: 200,
      contentType: "application/json",
      payload: "",
      valid: true,
    });
    // Internal field is non-enumerable; JSON.stringify must not see it.
    expect(JSON.stringify(entry)).not.toContain("_payloadBuffer");
  });
});

describe("fetchAndRecord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to a plain GET with no method/body when neither is passed", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json"]]),
      text: async () => JSON.stringify({ ok: true, rows: [1, 2, 3] }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const entries: unknown[] = [];
    await fetchAndRecord({
      sourceId: "test-get",
      url: "https://example.com/data",
      headers: { accept: "application/json" },
      minBytes: 1,
      entries,
    });

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/data", {
      headers: { accept: "application/json" },
      method: undefined,
      body: undefined,
    });
  });

  it("passes method and body through to fetch for a POST request", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json"]]),
      text: async () => JSON.stringify({ status: "REQUEST_SUCCEEDED", data: [] }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const entries: unknown[] = [];
    const requestBody = JSON.stringify({ seriesid: ["ABC123"] });
    await fetchAndRecord({
      sourceId: "test-post",
      url: "https://example.com/api",
      headers: { "content-type": "application/json" },
      method: "POST",
      body: requestBody,
      minBytes: 1,
      entries,
    });

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/api", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: requestBody,
    });
    expect(entries).toHaveLength(1);
    expect((entries[0] as { valid: boolean }).valid).toBe(true);
  });
});

describe("writeManifest", () => {
  let dir: string;

  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it("writes a manifest JSON file with redacted URLs and archives small valid payloads", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));
    const entries = [
      createManifestEntry({
        sourceId: "small-source",
        url: "https://api.census.gov/data?key=SECRET",
        status: 200,
        contentType: "application/json",
        payload: JSON.stringify({ hello: "world" }),
        vintage: "2024",
        valid: true,
      }),
    ];

    const manifestPath = await writeManifest({ projectRoot: dir, buildId: "test-build-1", entries });
    const written = JSON.parse(await readFile(manifestPath, "utf8"));

    expect(written.schema).toBe("ingest-manifest.v1");
    expect(written.entries).toHaveLength(1);
    expect(written.entries[0].request_url).not.toContain("SECRET");
    expect(written.entries[0].payload_stored).toBe(true);
    expect(written.entries[0].payload_path).toMatch(/^payloads\/small-source-/);

    // The archived payload file should actually exist.
    const archivedPath = path.join(dir, "ingest-manifest", written.entries[0].payload_path);
    const stat = await import("node:fs/promises").then((fs) => fs.stat(archivedPath));
    expect(stat.size).toBeGreaterThan(0);
  });

  it("does not archive a payload larger than PAYLOAD_CAP_BYTES", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));
    const bigPayload = "x".repeat(PAYLOAD_CAP_BYTES + 1);
    const entries = [
      createManifestEntry({
        sourceId: "big-source",
        url: "https://example.com/big.csv",
        status: 200,
        contentType: "text/csv",
        payload: bigPayload,
        valid: true,
      }),
    ];

    const manifestPath = await writeManifest({ projectRoot: dir, buildId: "test-build-2", entries });
    const written = JSON.parse(await readFile(manifestPath, "utf8"));

    expect(written.entries[0].payload_stored).toBe(false);
    expect(written.entries[0].payload_path).toBeNull();
    expect(written.entries[0].byte_size).toBe(bigPayload.length);
  });

  it("never sets payload_stored for an invalid entry, regardless of size", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));
    const entries = [
      createManifestEntry({
        sourceId: "invalid-source",
        url: "https://example.com/data.json",
        status: 200,
        contentType: "text/html",
        payload: "<!DOCTYPE html><html>error</html>",
        valid: false,
        invalidReason: "looked like HTML",
      }),
    ];

    const manifestPath = await writeManifest({ projectRoot: dir, buildId: "test-build-3", entries });
    const written = JSON.parse(await readFile(manifestPath, "utf8"));

    expect(written.entries[0].valid).toBe(false);
    expect(written.entries[0].payload_stored).toBe(false);
  });
});

describe("summarizeSourceHealth", () => {
  let dir: string;

  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it("returns an empty object when no manifest directory exists yet", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));
    const health = await summarizeSourceHealth({ projectRoot: dir });
    expect(health).toEqual({});
  });

  it("reports the latest attempt per source across multiple build runs", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));

    await writeManifest({
      projectRoot: dir,
      buildId: "build-2026-01-01T00-00-00-000Z",
      entries: [
        createManifestEntry({
          sourceId: "census-acs5-b28002-broadband-county",
          url: "https://example.com/a",
          status: 200,
          contentType: "application/json",
          payload: "{}",
          valid: true,
        }),
      ],
    });
    await writeManifest({
      projectRoot: dir,
      buildId: "build-2026-02-01T00-00-00-000Z",
      entries: [
        createManifestEntry({
          sourceId: "census-acs5-b28002-broadband-county",
          url: "https://example.com/a",
          status: 403,
          contentType: "text/plain",
          payload: "Forbidden",
          valid: false,
          invalidReason: "HTTP 403",
        }),
      ],
    });

    const health = await summarizeSourceHealth({ projectRoot: dir });
    const entry = health["census-acs5-b28002-broadband-county"];
    expect(entry.latest_valid).toBe(false);
    expect(entry.invalid_reason).toBe("HTTP 403");
    // The last VALID attempt was the first (January) build run, even
    // though the most recent attempt overall (February) failed.
    expect(entry.last_valid_retrieved_at).not.toBeNull();
  });

  it("clears invalid_reason once a source recovers in a later build", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ingest-manifest-test-"));

    await writeManifest({
      projectRoot: dir,
      buildId: "build-2026-01-01T00-00-00-000Z",
      entries: [
        createManifestEntry({
          sourceId: "nhtsa-fars-2024",
          url: "https://example.com/fars",
          status: 403,
          contentType: "text/plain",
          payload: "Forbidden",
          valid: false,
          invalidReason: "HTTP 403",
        }),
      ],
    });
    await writeManifest({
      projectRoot: dir,
      buildId: "build-2026-02-01T00-00-00-000Z",
      entries: [
        createManifestEntry({
          sourceId: "nhtsa-fars-2024",
          url: "https://example.com/fars",
          status: 200,
          contentType: "application/zip",
          payload: Buffer.alloc(2000, 1),
          valid: true,
        }),
      ],
    });

    const health = await summarizeSourceHealth({ projectRoot: dir });
    const entry = health["nhtsa-fars-2024"];
    expect(entry.latest_valid).toBe(true);
    expect(entry.invalid_reason).toBeNull();
  });
});
