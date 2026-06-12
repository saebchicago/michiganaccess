import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SnapCoverageAtRiskPage from "../SnapCoverageAtRiskPage";
import { SNAP_COVERAGE_AT_RISK_FALLBACK } from "@/data/snapCoverageAtRiskFallback";

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

// Return data synchronously so isLoading=false on first render
vi.mock("@/hooks/useSnapCoverageAtRisk", () => ({
  useSnapCoverageAtRisk: () => ({
    data: SNAP_COVERAGE_AT_RISK_FALLBACK,
    isLoading: false,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SnapCoverageAtRiskPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SnapCoverageAtRiskPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /SNAP Coverage at Risk/i })
    ).toBeInTheDocument();
  });

  it("renders ProvenanceDisclaimer", () => {
    renderPage();
    expect(
      screen.getByText(/combines measured public data with projections/i)
    ).toBeInTheDocument();
  });

  it("renders 'Exposure does not equal loss' callout", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Exposure does not equal loss/i })
    ).toBeInTheDocument();
  });

  it("renders link to full methodology page", () => {
    renderPage();
    const links = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href") === "/methodology/snap-coverage-at-risk"
    );
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders all 83 Michigan county names in the table", () => {
    renderPage();
    // Collect all county-route link text in one pass
    const countyLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.startsWith("/county/")
    );
    const renderedNames = new Set(countyLinks.map((el) => el.textContent));
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(renderedNames.has(entry.county)).toBe(true);
    }
    expect(countyLinks.length).toBe(83);
  });

  it("county links route to /county/:slug", () => {
    renderPage();
    // Wayne → /county/wayne
    const wayneLinks = screen.getAllByRole("link").filter(
      (el) => el.textContent === "Wayne"
    );
    expect(wayneLinks[0].getAttribute("href")).toBe("/county/wayne");
  });

  it("St. Clair county link uses correct slug (no dot)", () => {
    renderPage();
    const link = screen.getAllByRole("link").find(
      (el) => el.textContent === "St. Clair"
    );
    expect(link).toBeDefined();
    expect(link!.getAttribute("href")).toBe("/county/st-clair");
  });

  it("Grand Traverse county link has hyphenated slug", () => {
    renderPage();
    const link = screen.getAllByRole("link").find(
      (el) => el.textContent === "Grand Traverse"
    );
    expect(link).toBeDefined();
    expect(link!.getAttribute("href")).toBe("/county/grand-traverse");
  });

  it("table has sortable column headers", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /county/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /current snap enrollment/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /at-risk low/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /at-risk high/i })
    ).toBeInTheDocument();
  });

  it("Wayne County appears first in default sort (highest projectedAffectedHigh)", () => {
    renderPage();
    // Default sort is projectedAffectedHigh desc  -  Wayne should be first county link
    const countyLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.startsWith("/county/")
    );
    expect(countyLinks[0].textContent).toBe("Wayne");
  });

  it("clicking County header sorts alphabetically (Alcona first)", () => {
    renderPage();
    const countyBtn = screen.getByRole("button", { name: /county/i });
    fireEvent.click(countyBtn);
    const countyLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.startsWith("/county/")
    );
    expect(countyLinks[0].textContent).toBe("Alcona");
  });

  it("stat cards display statewide range 44,400–103,600", () => {
    renderPage();
    expect(screen.getByText(/44,400.{1,3}103,600/)).toBeInTheDocument();
  });

  it("stat cards display MLPP state estimate 74,000", () => {
    renderPage();
    expect(screen.getByText("74,000")).toBeInTheDocument();
  });

  it("DataProvenance labels include '(Modeled estimate)'", () => {
    renderPage();
    const modeledLabels = screen.getAllByText(/\(Modeled estimate\)/i);
    expect(modeledLabels.length).toBeGreaterThan(0);
  });

  it("MLPP source link is present", () => {
    renderPage();
    const mlppLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("mlpp.org")
    );
    expect(mlppLinks.length).toBeGreaterThan(0);
  });
});
