import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("check-secrets.mjs", () => {
  it("passes secret hygiene gate on tracked files", () => {
    const out = execSync("node scripts/check-secrets.mjs", {
      cwd: repoRoot,
      encoding: "utf-8",
    });
    expect(out).toContain("Secret hygiene check passed");
  });
});