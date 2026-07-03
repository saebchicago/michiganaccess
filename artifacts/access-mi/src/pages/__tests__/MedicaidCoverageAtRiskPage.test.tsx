import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MedicaidCoverageAtRiskPage from "../MedicaidCoverageAtRiskPage";
import { MEDICAID_COVERAGE_AT_RISK_FALLBACK } from "@/data/medicaidCoverageAtRiskFallback";

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

// Return data synchronously so isLoading=false on first render
vi.mock("@/hooks/useMedicaidCoverageAtRisk", () => ({
  useMedicaidCoverageAtRisk: () => ({
    data: MEDICAID_COVERAGE_AT_RISK_FALLBACK,
    isLoading: false,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MedicaidCoverageAtRiskPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("MedicaidCoverageAtRiskPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Who could lose Medicaid/i }),
    ).toBeInTheDocument();
  });

  it("renders ProvenanceDisclaimer", () => {
    renderPage();
    expect(
      screen.getByText(/combines measured public data with projections/i),
    ).toBeInTheDocument();
  });

  it("displays all 83 Michigan counties in the table  -  single-pass filter", () => {
    renderPage();
    // Single pass: collect all county links, then check by Set lookup  -  O(n) not O(n²)
    const allLinks = screen.getAllByRole("link");
    const countyLinks = allLinks.filter((el) =>
      el.getAttribute("aria-label")?.includes("County data"),
    );
    expect(countyLinks.length).toBe(83);
  });

  it("'Exposure is not disenrollment' appears verbatim in the amber callout", () => {
    renderPage();
    const matches = screen.getAllByText(/Exposure is not disenrollment/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("table has sortable column headers for all four columns", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /county/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /current medicaid enrollment/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /projected loss low/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /projected loss high/i }),
    ).toBeInTheDocument();
  });

  it("default sort by projected loss high puts Wayne County first", () => {
    renderPage();
    const rows = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-label")?.includes("County data"));
    expect(rows[0].textContent).toBe("Wayne");
  });

  it("clicking County header sorts alphabetically  -  Alcona first", () => {
    renderPage();
    const countyBtn = screen.getByRole("button", { name: /county/i });
    fireEvent.click(countyBtn);
    const rows = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-label")?.includes("County data"));
    expect(rows[0].textContent).toBe("Alcona");
  });

  it("Wayne County link routes to /county/wayne", () => {
    renderPage();
    const wayneLink = screen.getByRole("link", { name: /Wayne County data/i });
    expect(wayneLink.getAttribute("href")).toBe("/county/wayne");
  });

  it("Grand Traverse county link has hyphenated slug", () => {
    renderPage();
    const link = screen.getByRole("link", {
      name: /Grand Traverse County data/i,
    });
    expect(link.getAttribute("href")).toBe("/county/grand-traverse");
  });

  it("St. Clair county link has dot-free hyphenated slug", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /St\. Clair County data/i });
    expect(link.getAttribute("href")).toBe("/county/st-clair");
  });

  it("stat card displays Urban Institute statewide range 171,000–355,000", () => {
    renderPage();
    expect(screen.getByText("171,000–355,000")).toBeInTheDocument();
  });

  it("stat card displays KFF spending figure $31.6 billion", () => {
    renderPage();
    expect(screen.getByText("$31.6 billion")).toBeInTheDocument();
  });

  it("83-county stat card is present", () => {
    renderPage();
    expect(screen.getByText("83")).toBeInTheDocument();
  });

  it("column headers have 'modeled range' sub-labels", () => {
    renderPage();
    const subLabels = screen.getAllByText(
      /modeled range - not a point estimate/i,
    );
    // At minimum: two column sub-labels (low and high) + section header
    expect(subLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("methodology link points to /methodology/medicaid-coverage-at-risk", () => {
    renderPage();
    const methodLinks = screen
      .getAllByRole("link")
      .filter(
        (el) =>
          el.getAttribute("href") === "/methodology/medicaid-coverage-at-risk",
      );
    expect(methodLinks.length).toBeGreaterThan(0);
  });
});
