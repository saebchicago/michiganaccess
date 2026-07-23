import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EarlyChildhoodPage from "@/pages/EarlyChildhoodPage";
import { CountyProvider } from "@/contexts/CountyContext";
import { RX_KIDS_OUTCOMES, RX_KIDS_COVERED_COUNTIES } from "@/data/rx-kids";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

describe("EarlyChildhoodPage", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <CountyProvider>
          <EarlyChildhoodPage />
        </CountyProvider>
      </MemoryRouter>,
    );
  }

  it("leads with the Rx Kids hero and prompts for a county when none is selected", () => {
    localStorage.clear();
    renderPage();

    expect(
      screen.getByRole("heading", { name: /rx kids and michigan's childcare landscape/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select your county from the header/i),
    ).toBeInTheDocument();
  });

  it("shows an active-coverage status for a covered county", () => {
    localStorage.setItem("michigan-access-county", "Genesee");
    renderPage();

    expect(screen.getByText(/rx kids is live in genesee county/i)).toBeInTheDocument();
    expect(screen.getAllByText(/city of flint/i).length).toBeGreaterThan(0);
  });

  it("shows a not-yet-covered status for an uncovered county", () => {
    localStorage.setItem("michigan-access-county", "Alcona");
    renderPage();

    expect(screen.getByText(/has not yet announced a community in alcona county/i)).toBeInTheDocument();
  });

  it("renders every published outcome with its citation", () => {
    localStorage.clear();
    renderPage();

    for (const outcome of RX_KIDS_OUTCOMES) {
      expect(screen.getByText(outcome.finding)).toBeInTheDocument();
      expect(screen.getAllByText(new RegExp(outcome.citation, "i")).length).toBeGreaterThan(0);
    }
  });

  it("lists every covered county in the full coverage section", () => {
    localStorage.clear();
    renderPage();

    for (const county of RX_KIDS_COVERED_COUNTIES) {
      expect(screen.getByText(`${county} County`)).toBeInTheDocument();
    }
  });

  it("links to maternal health and find-care children services", () => {
    localStorage.clear();
    renderPage();

    expect(screen.getByRole("link", { name: /maternal & infant health/i })).toHaveAttribute(
      "href",
      "/maternal-health",
    );
    expect(screen.getByRole("link", { name: /find children & family services/i })).toHaveAttribute(
      "href",
      "/find-care?q=children",
    );
  });

  it("discloses what data is not yet available, including the M-STEP proxy caveat", () => {
    localStorage.clear();
    renderPage();

    expect(screen.getByText(/what we don't have yet/i)).toBeInTheDocument();
    expect(screen.getByText(/kindergarten entry/i)).toBeInTheDocument();
    expect(screen.getByText(/not a substitute for a/i)).toBeInTheDocument();
  });

  it("shows the PreK for All stat block with sources", () => {
    localStorage.clear();
    renderPage();

    expect(screen.getByRole("heading", { name: /preschool in michigan/i })).toBeInTheDocument();
    expect(screen.getByText("~55,000")).toBeInTheDocument();
    expect(screen.getByText("~50%")).toBeInTheDocument();
    expect(screen.getAllByText(/mileap/i).length).toBeGreaterThan(0);
  });
});
