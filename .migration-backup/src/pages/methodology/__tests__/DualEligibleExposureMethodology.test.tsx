import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DualEligibleExposureMethodology from "../DualEligibleExposureMethodology";

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
        <DualEligibleExposureMethodology />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DualEligibleExposureMethodology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Methodology: Dual-Eligible Exposure/i })
    ).toBeInTheDocument();
  });

  it("renders anchor callout h2 verbatim", () => {
    renderPage();
    const headings = screen.getAllByRole("heading");
    const anchorHeading = headings.find((h) =>
      /Dual-eligible residents are exempt from P\.L\. 119-21 work requirements\. This map shows where they live\./i.test(
        h.textContent ?? ""
      )
    );
    expect(anchorHeading).toBeDefined();
  });

  it("renders Sources section", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /^Sources$/i })).toBeInTheDocument();
  });

  // Source block a — MACPAC
  it("renders MACPAC source link", () => {
    renderPage();
    const macpacLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("macpac.gov")
    );
    expect(macpacLinks.length).toBeGreaterThan(0);
  });

  // Source block b — KFF dual-eligible state facts
  it("renders KFF dual-eligible state facts source link", () => {
    renderPage();
    const kffLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("kff.org")
    );
    expect(kffLinks.length).toBeGreaterThan(0);
  });

  // Source block c — ACS B27010
  it("renders ACS B27010 census source link", () => {
    renderPage();
    const censusLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("census.gov")
    );
    expect(censusLinks.length).toBeGreaterThan(0);
  });

  // Source block d — Justice in Aging
  it("renders Justice in Aging source link", () => {
    renderPage();
    const jiaLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("justiceinaging.org")
    );
    expect(jiaLinks.length).toBeGreaterThan(0);
  });

  // Source block e — CBO pub. 61570
  it("renders CBO source link", () => {
    renderPage();
    const cboLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("cbo.gov")
    );
    expect(cboLinks.length).toBeGreaterThan(0);
  });

  // Source block f — KFF MSP/LIS
  it("renders KFF MSP/LIS source link (second KFF link)", () => {
    renderPage();
    const kffLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("kff.org")
    );
    // Should have at least 2 KFF links (state facts + MSP provision)
    expect(kffLinks.length).toBeGreaterThanOrEqual(2);
  });

  // Source block g — MACPAC enrollment pathways (second MACPAC link)
  it("renders MACPAC enrollment pathways source link (second MACPAC link)", () => {
    renderPage();
    const macpacLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("macpac.gov")
    );
    expect(macpacLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders Technical steps section", () => {
    renderPage();
    // Use getAllByRole — "Technical steps" appears as both section h2 and subsection h3
    const headings = screen.getAllByRole("heading", { name: /Technical steps/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
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

  it("renders Limitations section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /What this does not do/i })
    ).toBeInTheDocument();
  });

  it("renders 'Why we publish this' section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Why we publish this/i })
    ).toBeInTheDocument();
  });

  it("renders Change log section with at least one entry", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Change log/i })).toBeInTheDocument();
    const dateCells = screen.getAllByText("2026-04-09");
    expect(dateCells.length).toBeGreaterThanOrEqual(1);
  });

  it("renders back link to /data/dual-eligible-exposure", () => {
    renderPage();
    const backLink = screen.getAllByRole("link").find(
      (el) => el.getAttribute("href") === "/data/dual-eligible-exposure"
    );
    expect(backLink).toBeDefined();
  });
});
