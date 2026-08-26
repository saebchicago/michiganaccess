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

  it("keeps the known contrast fixes in place", () => {
    const pageSource = fs.readFileSync(pagePath, "utf8");
    const dashboardSource = fs.readFileSync(dashboardPath, "utf8");

    expect(pageSource).not.toContain("text-muted-foreground/70");
    expect(pageSource).not.toContain("text-muted-foreground/80");
    expect(dashboardSource).toContain("text-amber-800 dark:text-amber-300");
    expect(dashboardSource).not.toContain("text-amber-600 dark:text-amber-400");
  });
});
