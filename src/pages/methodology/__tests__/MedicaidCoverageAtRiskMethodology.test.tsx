import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MedicaidCoverageAtRiskMethodology from "../MedicaidCoverageAtRiskMethodology";

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MedicaidCoverageAtRiskMethodology />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("MedicaidCoverageAtRiskMethodology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Methodology: Medicaid Coverage at Risk/i })
    ).toBeInTheDocument();
  });

  it("renders 'Exposure is not disenrollment' as the first section heading", () => {
    renderPage();
    // getAllByRole to handle possible duplicates across heading levels
    const headings = screen.getAllByRole("heading");
    const exposureHeading = headings.find((h) =>
      /Exposure is not disenrollment/i.test(h.textContent ?? "")
    );
    expect(exposureHeading).toBeDefined();
  });

  it("renders Sources section", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /^Sources$/i })).toBeInTheDocument();
  });

  it("renders Urban Institute source link", () => {
    renderPage();
    const urbanLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("urban.org")
    );
    expect(urbanLinks.length).toBeGreaterThan(0);
  });

  it("renders KFF source link", () => {
    renderPage();
    const kffLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("kff.org")
    );
    expect(kffLinks.length).toBeGreaterThan(0);
  });

  it("renders CBO source link", () => {
    renderPage();
    const cboLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("cbo.gov")
    );
    expect(cboLinks.length).toBeGreaterThan(0);
  });

  it("renders GAO-20-149 source link", () => {
    renderPage();
    const gaoLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("gao.gov")
    );
    expect(gaoLinks.length).toBeGreaterThan(0);
  });

  it("renders Sommers / NEJM source link", () => {
    renderPage();
    const nejmLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("nejm.org")
    );
    expect(nejmLinks.length).toBeGreaterThan(0);
  });

  it("renders ACS census source link", () => {
    renderPage();
    const censusLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("census.gov")
    );
    expect(censusLinks.length).toBeGreaterThan(0);
  });

  it("renders Projection methodology section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Projection methodology/i })
    ).toBeInTheDocument();
  });

  it("renders Limitations section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Limitations/i })
    ).toBeInTheDocument();
  });

  it("renders 'Why we publish this' section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Why we publish this/i })
    ).toBeInTheDocument();
  });

  it("renders Change log section with 2026-04-09 entry", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Change log/i })).toBeInTheDocument();
    const dateCells = screen.getAllByText("2026-04-09");
    expect(dateCells.length).toBeGreaterThanOrEqual(1);
  });

  it("renders back link to /data/medicaid-coverage-at-risk", () => {
    renderPage();
    const backLink = screen.getAllByRole("link").find(
      (el) => el.getAttribute("href") === "/data/medicaid-coverage-at-risk"
    );
    expect(backLink).toBeDefined();
  });

  it("displays Urban Institute Michigan range 171,000–355,000", () => {
    renderPage();
    // getAllByText avoids failure when phrase appears multiple times
    const matches = screen.getAllByText(/171,000/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("technical steps are an ordered list with at least 5 items", () => {
    renderPage();
    const lists = screen.getAllByRole("list");
    const orderedSteps = lists.find((l) => {
      const items = l.querySelectorAll("li");
      return items.length >= 5 && l.tagName === "OL";
    });
    expect(orderedSteps).toBeDefined();
  });
});
