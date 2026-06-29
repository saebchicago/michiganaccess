import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../../..");
const fixture = resolve(projectRoot, "data/fixtures/ejscreen-zcta-sample.csv");
const script = resolve(projectRoot, "scripts/ingest-ejscreen-csv.mjs");
const generated = resolve(projectRoot, "src/data/ejscreen.generated.ts");

describe("ingest-ejscreen-csv.mjs", () => {
  it("fixture exists with Michigan ZCTA sample rows", () => {
    expect(existsSync(fixture)).toBe(true);
    const raw = readFileSync(fixture, "utf-8");
    expect(raw).toContain("48201");
    expect(raw).toContain("ZCTA5CE10");
  });

  it("dry-run parses fixture without writing output", () => {
    const before = existsSync(generated) ? readFileSync(generated, "utf-8") : "";
    const out = execSync(`node "${script}" --dry-run "${fixture}"`, {
      cwd: projectRoot,
      encoding: "utf-8",
    });
    expect(out).toContain("Parsed 3 Michigan ZCTA records");
    expect(out).toContain("Dry run");
    if (before) {
      expect(readFileSync(generated, "utf-8")).toBe(before);
    }
  });
});