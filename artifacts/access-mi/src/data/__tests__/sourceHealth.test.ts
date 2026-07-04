import { describe, it, expect } from "vitest";
import { getSourceHealth, SOURCE_HEALTH_GENERATED_AT } from "../sourceHealth";

describe("sourceHealth", () => {
  it("exposes a generated_at timestamp", () => {
    expect(SOURCE_HEALTH_GENERATED_AT).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it("returns null for a source_id with no recorded ingest attempt", () => {
    expect(getSourceHealth("no-such-source")).toBeNull();
  });
});
