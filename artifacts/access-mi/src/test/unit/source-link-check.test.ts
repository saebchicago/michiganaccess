import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  extractUrlEntries,
  collectSourceUrls,
  checkUrl,
  checkAllUrls,
} from "../../../scripts/lib/source-link-check.mjs";

describe("extractUrlEntries", () => {
  it("pairs a url line with the nearest preceding context/name label", () => {
    const src = `
      { context: "FQHC patients served 2024", source: "HRSA UDS 2024", url: "https://data.hrsa.gov/tools", verified: true },
      { name: "CDC PLACES", url: "https://www.cdc.gov/places/", frequency: "Annual" },
    `;
    const entries = extractUrlEntries(src);
    expect(entries).toEqual([
      { url: "https://data.hrsa.gov/tools", label: "FQHC patients served 2024" },
      { url: "https://www.cdc.gov/places/", label: "CDC PLACES" },
    ]);
  });

  it("labels a url with no preceding context/name as unlabeled", () => {
    const src = `{ url: "https://example.com" }`;
    expect(extractUrlEntries(src)).toEqual([
      { url: "https://example.com", label: "(unlabeled)" },
    ]);
  });

  it("returns an empty array for text with no url fields", () => {
    expect(extractUrlEntries("export const x = 1;")).toEqual([]);
  });
});

describe("collectSourceUrls", () => {
  let dir: string | null = null;
  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
    dir = null;
  });

  it("dedupes a URL shared across both registry files and unions the labels", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "source-link-check-"));
    const manifestPath = path.join(dir, "manifest.ts");
    const registryPath = path.join(dir, "registry.ts");
    await writeFile(
      manifestPath,
      `{ context: "claim A", url: "https://shared.example.com" }`,
      "utf8",
    );
    await writeFile(
      registryPath,
      `{ name: "registry entry", url: "https://shared.example.com" }`,
      "utf8",
    );

    const byUrl = await collectSourceUrls({
      sourceManifestPath: manifestPath,
      sourcesRegistryPath: registryPath,
    });
    expect(byUrl.size).toBe(1);
    expect([...byUrl.get("https://shared.example.com")!].sort()).toEqual([
      "claim A",
      "registry entry",
    ]);
  });
});

function fakeResponse(status: number, url?: string) {
  return { status, url: url ?? "" } as Response;
}

describe("checkUrl", () => {
  it("classifies a 200 as ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(200));
    const result = await checkUrl("https://example.com", { fetchImpl });
    expect(result).toMatchObject({ url: "https://example.com", status: "ok", httpStatus: 200 });
  });

  it("classifies a 301 as redirect and records the final URL", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(fakeResponse(301, "https://example.com/new"));
    const result = await checkUrl("https://example.com/old", { fetchImpl });
    expect(result).toMatchObject({
      status: "redirect",
      httpStatus: 301,
      finalUrl: "https://example.com/new",
    });
  });

  it("classifies a 404 as client-error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(404));
    const result = await checkUrl("https://example.com/gone", { fetchImpl });
    expect(result).toMatchObject({ status: "client-error", httpStatus: 404 });
  });

  it("classifies a 500 as server-error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(500));
    const result = await checkUrl("https://example.com/broken", { fetchImpl });
    expect(result).toMatchObject({ status: "server-error", httpStatus: 500 });
  });

  it("retries with GET when HEAD returns 405", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse(405))
      .mockResolvedValueOnce(fakeResponse(200));
    const result = await checkUrl("https://example.com/head-blocked", { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({ method: "HEAD" });
    expect(fetchImpl.mock.calls[1][1]).toMatchObject({ method: "GET" });
    expect(result.status).toBe("ok");
  });

  it("classifies a thrown AbortError as timeout, not a crash", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(
      Object.assign(new Error("The operation was aborted"), { name: "AbortError" }),
    );
    const result = await checkUrl("https://example.com/slow", { fetchImpl, timeoutMs: 5 });
    expect(result).toMatchObject({ url: "https://example.com/slow", status: "timeout", httpStatus: null });
  });

  it("classifies any other thrown error as network-error, not a crash", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
    const result = await checkUrl("https://example.com/dns-fail", { fetchImpl });
    expect(result).toMatchObject({ status: "network-error", httpStatus: null });
    expect(result.error).toContain("ENOTFOUND");
  });
});

describe("checkAllUrls", () => {
  it("checks every URL in the map and attaches its context labels", async () => {
    const byUrl = new Map([
      ["https://a.example.com", new Set(["claim A"])],
      ["https://b.example.com", new Set(["claim B", "claim B2"])],
    ]);
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(200));
    const results = await checkAllUrls(byUrl, { fetchImpl });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ url: "https://a.example.com", contexts: ["claim A"] });
    expect(results[1].contexts.sort()).toEqual(["claim B", "claim B2"]);
  });

  it("does not let one failing URL block the others", async () => {
    const byUrl = new Map([
      ["https://ok.example.com", new Set(["ok"])],
      ["https://dead.example.com", new Set(["dead"])],
    ]);
    const fetchImpl = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("dead")) throw new Error("connection refused");
      return fakeResponse(200);
    });
    const results = await checkAllUrls(byUrl, { fetchImpl });
    const byStatus = Object.fromEntries(results.map((r) => [r.url, r.status]));
    expect(byStatus["https://ok.example.com"]).toBe("ok");
    expect(byStatus["https://dead.example.com"]).toBe("network-error");
  });
});
