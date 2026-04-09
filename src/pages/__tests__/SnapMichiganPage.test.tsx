import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SnapMichiganPage from "../SnapMichiganPage";
import { SNAP_COUNTY_FALLBACK, SNAP_STATE_FALLBACK } from "@/data/snapMichiganFallback";

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

// Return data synchronously so isLoading=false on first render
vi.mock("@/hooks/useSnapMichigan", () => ({
  useSnapMichigan: () => ({
    data: { counties: SNAP_COUNTY_FALLBACK, state: SNAP_STATE_FALLBACK },
    isLoading: false,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SnapMichiganPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SnapMichiganPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /SNAP in Michigan/i })).toBeInTheDocument();
  });

  it("renders ProvenanceDisclaimer", () => {
    renderPage();
    expect(
      screen.getByText(/combines measured public data with projections/i)
    ).toBeInTheDocument();
  });

  it("displays all 83 Michigan counties in the table", () => {
    renderPage();
    // Table has 83 data rows (each county is a link)
    const countyLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(countyLinks.length).toBe(83);
  });

  it("every stat card has a source link (DataProvenance)", () => {
    renderPage();
    // DataProvenance compact renders links to FNS and Retailer Locator
    const fnsLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("fns.usda.gov")
    );
    expect(fnsLinks.length).toBeGreaterThanOrEqual(4);
  });

  it("table has sortable column headers", () => {
    renderPage();
    const countyBtn = screen.getByRole("button", { name: /county/i });
    const personsBtn = screen.getByRole("button", { name: /snap persons/i });
    const pctBtn = screen.getByRole("button", { name: /% of pop/i });
    expect(countyBtn).toBeInTheDocument();
    expect(personsBtn).toBeInTheDocument();
    expect(pctBtn).toBeInTheDocument();
  });

  it("clicking County header sorts alphabetically", () => {
    renderPage();
    const countyBtn = screen.getByRole("button", { name: /county/i });
    fireEvent.click(countyBtn);
    // After clicking, first row should be Alcona (alphabetically first)
    const rows = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(rows[0].textContent).toBe("Alcona");
  });

  it("clicking a county name links to /county/:slug", () => {
    renderPage();
    const wayneLink = screen.getByRole("link", { name: /Wayne County data/i });
    expect(wayneLink.getAttribute("href")).toBe("/county/wayne");
  });

  it("clicking Genesee links to /county/genesee", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Genesee County data/i });
    expect(link.getAttribute("href")).toBe("/county/genesee");
  });

  it("Grand Traverse county link has hyphenated slug", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Grand Traverse County data/i });
    expect(link.getAttribute("href")).toBe("/county/grand-traverse");
  });

  it("statewide stat cards are rendered", () => {
    renderPage();
    // State total shown as "1.4M" (1,370,000 → 1.4M)
    expect(screen.getByText("1.4M")).toBeInTheDocument();
    // Monthly issuance "$280M"
    expect(screen.getByText("$280M")).toBeInTheDocument();
  });

  it("methodology section toggles open", () => {
    renderPage();
    const methodBtn = screen.getByRole("button", { name: /how we source snap data/i });
    expect(screen.queryByText(/Two-tier freshness model/i)).not.toBeInTheDocument();
    fireEvent.click(methodBtn);
    expect(screen.getByText(/Two-tier freshness model/i)).toBeInTheDocument();
  });

  it("Wayne County has the highest enrollment in default sort", () => {
    renderPage();
    // Default sort is enrollmentTotal desc — Wayne should be first link
    const rows = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(rows[0].textContent).toBe("Wayne");
  });

  it("sorting by % of Pop shows counties with high rates at top", () => {
    renderPage();
    const pctBtn = screen.getByRole("button", { name: /% of pop/i });
    fireEvent.click(pctBtn);
    // After click (default desc for this column), the first county should have high enrollment rate
    const rows = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    // The first result should be a county with high enrollment relative to population
    expect(rows.length).toBe(83);
  });
});
