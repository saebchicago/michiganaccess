import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DualEligibleExposurePage from "../DualEligibleExposurePage";
import { DUAL_ELIGIBLE_EXPOSURE_FALLBACK } from "@/data/dualEligibleExposureFallback";

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

// Return data synchronously so isLoading=false on first render
vi.mock("@/hooks/useDualEligibleExposure", () => ({
  useDualEligibleExposure: () => ({
    data: DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
    isLoading: false,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DualEligibleExposurePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DualEligibleExposurePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Dual-Eligible Exposure in Michigan/i })
    ).toBeInTheDocument();
  });

  it("renders ProvenanceDisclaimer", () => {
    renderPage();
    expect(
      screen.getByText(/combines measured public data with projections/i)
    ).toBeInTheDocument();
  });

  it("displays all 83 Michigan counties in the table — single-pass filter", () => {
    renderPage();
    const allLinks = screen.getAllByRole("link");
    const countyLinks = allLinks.filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(countyLinks.length).toBe(83);
  });

  it("anchor phrase appears verbatim at least twice (subtitle and callout h2)", () => {
    renderPage();
    // Must appear in hero subtitle AND in amber callout h2
    const matches = screen.getAllByText(
      /Dual-eligible residents are exempt from P\.L\. 119-21 work requirements\. This map shows where they live\./i
    );
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("table has sortable column headers for all four columns", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /county/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /acs dual-eligible count/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /allocated low/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /allocated high/i })).toBeInTheDocument();
  });

  it("default sort by allocated high puts Wayne County first", () => {
    renderPage();
    const rows = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(rows[0].textContent).toBe("Wayne");
  });

  it("clicking County header sorts alphabetically — Alcona first", () => {
    renderPage();
    const countyBtn = screen.getByRole("button", { name: /county/i });
    fireEvent.click(countyBtn);
    const rows = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("aria-label")?.includes("County data")
    );
    expect(rows[0].textContent).toBe("Alcona");
  });

  it("Wayne County link routes to /county/wayne", () => {
    renderPage();
    const wayneLink = screen.getByRole("link", { name: /Wayne County data/i });
    expect(wayneLink.getAttribute("href")).toBe("/county/wayne");
  });

  it("Grand Traverse county link has hyphenated slug", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Grand Traverse County data/i });
    expect(link.getAttribute("href")).toBe("/county/grand-traverse");
  });

  it("St. Clair county link has dot-free hyphenated slug", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /St\. Clair County data/i });
    expect(link.getAttribute("href")).toBe("/county/st-clair");
  });

  it("three stat cards render (MACPAC range, 83 counties, median)", () => {
    renderPage();
    expect(screen.getByText("~335,000–405,000")).toBeInTheDocument();
    expect(screen.getByText("83")).toBeInTheDocument();
    // Median stat card value present (starts with ~)
    const medianCard = screen.getByTestId("dual-stat-median");
    expect(medianCard).toBeInTheDocument();
  });

  it("cross-link to SNAP coverage at risk exists", () => {
    renderPage();
    const snapLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href") === "/data/snap-coverage-at-risk"
    );
    expect(snapLinks.length).toBeGreaterThan(0);
  });

  it("cross-link to Medicaid coverage at risk exists", () => {
    renderPage();
    const medicaidLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href") === "/data/medicaid-coverage-at-risk"
    );
    expect(medicaidLinks.length).toBeGreaterThan(0);
  });

  it("methodology link points to /methodology/dual-eligible-exposure", () => {
    renderPage();
    const methodLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href") === "/methodology/dual-eligible-exposure"
    );
    expect(methodLinks.length).toBeGreaterThan(0);
  });

  it("column headers have allocation sub-labels", () => {
    renderPage();
    const subLabels = screen.getAllByText(/Proportional allocation from state range/i);
    expect(subLabels.length).toBeGreaterThanOrEqual(2);
  });
});
