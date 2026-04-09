import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SnapCoverageAtRiskMethodology from "../SnapCoverageAtRiskMethodology";

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
        <SnapCoverageAtRiskMethodology />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SnapCoverageAtRiskMethodology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Methodology: SNAP Coverage at Risk/i })
    ).toBeInTheDocument();
  });

  it("renders 'Exposure does not equal loss' as the first section heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Exposure does not equal loss/i })
    ).toBeInTheDocument();
  });

  it("renders Sources section", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /^Sources$/i })).toBeInTheDocument();
  });

  it("renders CBO source link", () => {
    renderPage();
    const cboLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("cbo.gov")
    );
    expect(cboLinks.length).toBeGreaterThan(0);
  });

  it("renders MLPP source link", () => {
    renderPage();
    const mlppLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("mlpp.org")
    );
    expect(mlppLinks.length).toBeGreaterThan(0);
  });

  it("renders GAO-19-56 source link", () => {
    renderPage();
    const gaoLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("gao.gov")
    );
    expect(gaoLinks.length).toBeGreaterThan(0);
  });

  it("renders KFF source link", () => {
    renderPage();
    const kffLinks = screen.getAllByRole("link").filter(
      (el) => el.getAttribute("href")?.includes("kff.org")
    );
    expect(kffLinks.length).toBeGreaterThan(0);
  });

  it("renders Projection methodology section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Projection methodology/i })
    ).toBeInTheDocument();
  });

  it("renders 'What this does not do' section", () => {
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

  it("renders Change log section with initial 2026-04-09 entry", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Change log/i })).toBeInTheDocument();
    expect(screen.getByText("2026-04-09")).toBeInTheDocument();
  });

  it("renders back link to /data/snap-coverage-at-risk", () => {
    renderPage();
    const backLink = screen.getAllByRole("link").find(
      (el) => el.getAttribute("href") === "/data/snap-coverage-at-risk"
    );
    expect(backLink).toBeDefined();
  });

  it("renders uncertainty band ±40% language", () => {
    renderPage();
    const matches = screen.getAllByText(/±40%/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("displays MLPP estimate of 74,000", () => {
    renderPage();
    const matches = screen.getAllByText(/74,000/);
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
