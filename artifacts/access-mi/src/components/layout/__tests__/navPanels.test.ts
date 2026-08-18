import { describe, expect, it } from "vitest";
import { APP_ROUTES, NAV_GROUPS, isNavGroup } from "@/config/routes";

/**
 * The mega-menu panel config in NAV_GROUPS is presentational grouping over
 * each group's own children. These tests keep it honest: a column href that
 * is not a child would silently vanish from the desktop panel while still
 * showing in the mobile sheet, and a child missing from every column would
 * do the reverse - either way the two navs quietly diverge.
 */
describe("NAV_GROUPS mega-menu panels", () => {
  const registered = new Set(APP_ROUTES.map((r) => r.path));
  const groups = NAV_GROUPS.filter(isNavGroup);

  it("every group with a panel covers its children exactly", () => {
    for (const group of groups) {
      if (!group.panel) continue;
      const childHrefs = new Set(group.children.map((c) => c.href));
      const columnHrefs = group.panel.columns.flatMap((c) => c.hrefs);
      expect(
        new Set(columnHrefs).size,
        `${group.label}: duplicate href across columns`,
      ).toBe(columnHrefs.length);
      for (const href of columnHrefs) {
        expect(
          childHrefs.has(href),
          `${group.label}: column href ${href} is not one of the group's children`,
        ).toBe(true);
      }
      for (const href of childHrefs) {
        expect(
          columnHrefs.includes(href),
          `${group.label}: child ${href} appears in no panel column`,
        ).toBe(true);
      }
    }
  });

  it("promo links point at registered routes", () => {
    for (const group of groups) {
      if (!group.panel) continue;
      expect(
        registered.has(group.panel.promo.href),
        `${group.label}: promo href ${group.panel.promo.href} is not a registered route`,
      ).toBe(true);
      expect(group.panel.promo.title.length).toBeGreaterThan(0);
      expect(group.panel.promo.body.length).toBeGreaterThan(0);
      expect(group.panel.promo.cta.length).toBeGreaterThan(0);
    }
  });

  it("all four pillar groups carry a panel", () => {
    const withPanels = groups.filter((g) => g.panel);
    expect(withPanels.length).toBe(groups.length);
    expect(withPanels.length).toBeGreaterThanOrEqual(4);
  });
});
