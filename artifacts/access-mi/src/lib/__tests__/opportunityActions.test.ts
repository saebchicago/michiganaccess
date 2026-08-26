import { describe, expect, it } from "vitest";
import { OPPORTUNITY_ACTIONS } from "@/data/opportunityAtlas";
import { deriveOpportunityActionStatus } from "@/lib/opportunityActions";

describe("Opportunity action freshness", () => {
  const treeGrant = OPPORTUNITY_ACTIONS.find(
    (action) => action.id === "dte-tree-grant-2026",
  );
  const seedAwards = OPPORTUNITY_ACTIONS.find(
    (action) => action.id === "mi-good-food-seed-2026",
  );
  const recreation = OPPORTUNITY_ACTIONS.find(
    (action) => action.id === "recreation-passport",
  );

  it("keeps the DTE tree grant available before its verified deadline", () => {
    expect(treeGrant).toBeDefined();
    expect(
      deriveOpportunityActionStatus(
        treeGrant!,
        new Date("2026-08-25T12:00:00Z"),
      ),
    ).toBe("available-now");
  });

  it("automatically stops presenting a dated grant as open after deadline", () => {
    expect(treeGrant).toBeDefined();
    expect(
      deriveOpportunityActionStatus(
        treeGrant!,
        new Date("2026-09-15T12:00:00Z"),
      ),
    ).toBe("next-cycle");
  });

  it("presents Seed Awards as opens-soon only before the published opening date", () => {
    expect(seedAwards).toBeDefined();
    expect(
      deriveOpportunityActionStatus(
        seedAwards!,
        new Date("2026-08-25T12:00:00Z"),
      ),
    ).toBe("opens-soon");
    expect(
      deriveOpportunityActionStatus(
        seedAwards!,
        new Date("2026-09-07T12:00:00Z"),
      ),
    ).toBe("available-now");
  });

  it("keeps an annual closed recreation program in next-cycle state", () => {
    expect(recreation).toBeDefined();
    expect(
      deriveOpportunityActionStatus(
        recreation!,
        new Date("2026-08-25T12:00:00Z"),
      ),
    ).toBe("next-cycle");
  });
});
