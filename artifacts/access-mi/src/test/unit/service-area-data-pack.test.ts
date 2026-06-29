import { describe, it, expect } from "vitest";
import { buildServiceAreaDataPackCsv } from "@/utils/generateServiceAreaDataPack";

describe("generateServiceAreaDataPack", () => {
  it("builds CHNA-aligned pack with provenance header", () => {
    const csv = buildServiceAreaDataPackCsv({
      zips: ["48201", "48104"],
      label: "Detroit core sample",
      exportedAt: "2026-06-29T12:00:00.000Z",
    });

    expect(csv).toContain("# AccessMI Service Area Data Pack");
    expect(csv).toContain("accessmi-service-area-pack-v1");
    expect(csv).toContain("ZIP,City,County,Population");
    expect(csv).toContain("48201");
    expect(csv).toContain("Detroit core sample");
  });
});