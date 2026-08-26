import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const dashboardPath = path.resolve(
  process.cwd(),
  "src/components/tools/DisasterHistoryDashboard.tsx",
);
const pagePath = path.resolve(process.cwd(), "src/pages/DisasterHistoryPage.tsx");

describe("disaster history accessibility regressions", () => {
  it("keeps both disaster filters explicitly labeled", () => {
    const source = fs.readFileSync(dashboardPath, "utf8");

    expect(source).toContain('htmlFor="disaster-incident-type"');
    expect(source).toContain('id="disaster-incident-type"');
    expect(source).toContain('htmlFor="disaster-county"');
    expect(source).toContain('id="disaster-county"');
  });

  it("does not reintroduce low-opacity trend-card text", () => {
    const source = fs.readFileSync(pagePath, "utf8");

    expect(source).not.toContain("text-muted-foreground/70");
    expect(source).not.toContain("text-muted-foreground/80");
  });
});
