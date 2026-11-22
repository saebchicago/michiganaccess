// Deterministic tests for the independent agent consumer used by
// scripts/check-agent-readiness.mjs. Fixtures are the committed public files.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe as suite, expect, it } from "vitest";
// @ts-expect-error - plain ESM script without type declarations
import { compareValues, describe, discover, readCountyValue, reusePosition, validate } from "../../../scripts/lib/agent-consumer.mjs";

const PUBLIC = path.resolve(__dirname, "../../../public");
const fetcher = async (p: string) => {
  const f = path.join(PUBLIC, p.replace(/^\//, ""));
  return existsSync(f)
    ? { status: 200, contentType: "application/json", body: readFileSync(f, "utf8") }
    : { status: 404, contentType: "text/html", body: "<!doctype html>" };
};

suite("agent consumer", () => {
  it("discovers the data index from llms.txt and describes SAIPE with its meaning intact", async () => {
    const disc = await discover(fetcher);
    expect(disc.ok).toBe(true);
    const d = await describe(fetcher, disc.index, "michigan-county-income-poverty");
    expect(d.ok).toBe(true);
    expect(d.label).toBe("MODELED");
    expect(d.geographyUnit).toBe("county");
    expect(Number.isInteger(d.releaseVersion)).toBe(true);
    expect(d.sourceUrl).toMatch(/^https:\/\/www\.census\.gov\//);
  });

  it("refuses null cells instead of reading them as zero", async () => {
    const disc = await discover(fetcher);
    const d = await describe(fetcher, disc.index, "michigan-county-income-poverty");
    d.data.counties[0].values.povertyPct = null;
    const r = readCountyValue(d, d.data.counties[0].countyFips, "povertyPct");
    expect(r.ok).toBe(false);
    expect(r.refusal).toMatch(/not zero/);
  });

  it("refuses cross-geography, cross-period and cross-unit comparisons", () => {
    const base = { ok: true, value: 20, unit: "percent", period: 2024, interval: [18, 22], geography: { unit: "county", id: "26163", name: "Wayne" } };
    expect(compareValues(base, { ...base, geography: { unit: "zcta", id: "48201", name: "48201" } }).verdict).toBe("refuse");
    expect(compareValues(base, { ...base, period: "2020-2024" }).verdict).toBe("refuse");
    expect(compareValues(base, { ...base, unit: "dollars" }).verdict).toBe("refuse");
    expect(compareValues(base, { ...base, value: 21, interval: [19, 23], geography: { unit: "county", id: "26125", name: "Oakland" } }).verdict).toBe("no_established_difference");
    expect(compareValues(base, { ...base, interval: null }).verdict).toBe("no_established_difference");
  });

  it("does not treat robots.txt or a blank license as permission for upstream reuse", async () => {
    const disc = await discover(fetcher);
    const entry = disc.index.datasets.find((d: { id: string }) => d.id === "michigan-county-income-poverty");
    const pos = reusePosition(disc.index, entry);
    expect(pos.upstreamTerms).toBe("not_established");
    expect(pos.robotsIsNotALicense).toBe(true);
  });

  it("fails safely on unsupported, missing and schema-mismatched datasets", async () => {
    const disc = await discover(fetcher);
    expect((await describe(fetcher, disc.index, "sam-exclusions")).ok).toBe(false);
    expect((await describe(fetcher, disc.index, "nope")).ok).toBe(false);
    const wrong = { ...disc.index, datasets: [{ ...disc.index.datasets[0], path: "/data/manifest.json" }] };
    expect((await describe(fetcher, wrong, disc.index.datasets[0].id)).ok).toBe(false);
    expect(validate({ type: "object", required: ["a"] }, {})).toEqual(["$.a: required"]);
  });
});
