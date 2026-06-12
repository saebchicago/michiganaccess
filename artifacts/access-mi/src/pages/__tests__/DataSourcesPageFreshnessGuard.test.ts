import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../../..");

function readSourceFile(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

describe("DataSourcesPage  -  machine-generated dates only", () => {
  it("DataSourcesPage.tsx contains no hard-coded date literals (YYYY-MM-DD)", () => {
    const src = readSourceFile("src/pages/DataSourcesPage.tsx");
    expect(src).not.toMatch(/20\d\d-\d\d-\d\d/);
  });

  it("DataSourcesPage.tsx imports verifiedHealthFacilities for machine-generated dates", () => {
    const src = readSourceFile("src/pages/DataSourcesPage.tsx");
    expect(src).toContain("verifiedHealthFacilities");
  });

  it("DataSourcesPage.tsx reads fetched_at from provenance (not a hand-typed string)", () => {
    const src = readSourceFile("src/pages/DataSourcesPage.tsx");
    expect(src).toContain("provenance.fetched_at");
  });
});
