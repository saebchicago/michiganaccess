import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/components/chna/CHNATractMap", () => ({
  CHNATractMap: () => <div data-testid="chna-tract-map" />,
}));
vi.mock("@/components/chna/IntegrityBadge", () => ({
  IntegrityBadge: ({ label }: { label: string }) => <span>{label}</span>,
}));
vi.mock("@/components/shared/PrintButton", () => ({
  default: () => <button type="button">Print</button>,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("@/utils/generateCHNABrief", () => ({
  generateCHNABriefPDF: () => Promise.resolve(),
  generateCHNABriefCSV: () => {},
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import { CHNAExplorerPage } from "@/pages/CHNAExplorerPage";

const MI_COUNTY_COUNT = Object.keys(MI_COUNTY_FIPS).length;

async function renderCountyCompare() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <CHNAExplorerPage />
    </MemoryRouter>,
  );
  await user.click(screen.getByRole("tab", { name: "County Compare" }));
  return user;
}

describe("CHNAExplorerPage - County Compare tab", () => {
  // Opening the Radix Select's listbox is not exercised here - jsdom does
  // not implement Element.hasPointerCapture, which Radix Select's pointer
  // handling requires. 83-county coverage is instead verified via the All
  // Metrics table below, which renders every COUNTIES entry as a plain row.
  it("does not render any of the dropped unbacked fields (health rank, SVI, life expectancy, depression, child poverty, energy burden)", async () => {
    await renderCountyCompare();
    const compareTabPanel = screen.getByRole("tabpanel", {
      name: "County Compare",
    });
    const text = compareTabPanel.textContent ?? "";
    // Distinguish the dropped "Health Rank: #N" stat from the legitimate
    // "County Health Rankings 2025" source citation, which does appear.
    expect(text).not.toMatch(/Health Rank[:#]/i);
    expect(text).not.toMatch(/\bSVI\b/i);
    expect(text).not.toMatch(/Life Expectancy/i);
    expect(text).not.toMatch(/Depression/i);
    expect(text).not.toMatch(/Child Poverty/i);
    expect(text).not.toMatch(/Energy Burden/i);
  });

  it("renders only the real-data fields (insured rate, PCPs per 100K, food insecurity, obesity, diabetes, facilities)", async () => {
    await renderCountyCompare();
    const compareTabPanel = screen.getByRole("tabpanel", {
      name: "County Compare",
    });
    expect(
      within(compareTabPanel).getAllByText("Insured Rate").length,
    ).toBeGreaterThan(0);
    expect(
      within(compareTabPanel).getAllByText("PCPs per 100K").length,
    ).toBeGreaterThan(0);
    expect(
      within(compareTabPanel).getAllByText("Food Insecurity").length,
    ).toBeGreaterThan(0);
    expect(
      within(compareTabPanel).getAllByText("Obesity Rate (modeled)").length,
    ).toBeGreaterThan(0);
    expect(
      within(compareTabPanel).getAllByText("Diabetes (modeled)").length,
    ).toBeGreaterThan(0);
    expect(
      within(compareTabPanel).getAllByText("Facilities").length,
    ).toBeGreaterThan(0);
  });

  it("cites the real per-field sources instead of the old blanket SVI/BRFSS/MDHHS attribution", async () => {
    await renderCountyCompare();
    const compareTabPanel = screen.getByRole("tabpanel", {
      name: "County Compare",
    });
    const text = compareTabPanel.textContent ?? "";
    expect(text).toMatch(/County Health Rankings 2025/);
    expect(text).toMatch(/CDC PLACES/);
    expect(text).toMatch(/CMS Hospital/);
    expect(text).not.toMatch(/CDC SVI 2022/);
    expect(text).not.toMatch(/ACEEE LEAD Tool/);
  });

  it("shows the same 83-county set in the All Metrics table", async () => {
    const user = await renderCountyCompare();
    await user.click(screen.getByRole("tab", { name: "All Metrics" }));
    const compareTabPanel = screen.getByRole("tabpanel", {
      name: "County Compare",
    });
    const rows = within(compareTabPanel).getAllByRole("row");
    // header row + 83 county rows
    expect(rows).toHaveLength(MI_COUNTY_COUNT + 1);
  });
});
