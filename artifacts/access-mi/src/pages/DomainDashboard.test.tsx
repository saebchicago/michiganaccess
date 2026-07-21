import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DomainDashboard from "@/pages/DomainDashboard";
import { CountyProvider } from "@/contexts/CountyContext";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("DomainDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/health");
  });

  function renderDashboard(initialEntries: string[] = ["/health"]) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <CountyProvider>
          <DomainDashboard />
        </CountyProvider>
      </MemoryRouter>,
    );
  }

  it("renders Wayne health intelligence with its two real-data signal cards", () => {
    localStorage.setItem("michigan-access-county", "Wayne");
    renderDashboard();

    expect(screen.getByRole("heading", { name: /wayne county - health intelligence/i })).toBeInTheDocument();
    // Health domain now covers only the two fields with a real all-83-county
    // source (uninsured rate, primary care access) - see FIXLOG.md for why
    // life expectancy and the other 7 originally-scaffolded fields were
    // dropped rather than shown as invented numbers.
    expect(screen.getAllByText(/source cadence/i)).toHaveLength(2);
    expect(screen.getByRole("heading", { name: /uninsured rate/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /primary care access/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /life expectancy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /mental health access/i })).not.toBeInTheDocument();
  });

  it("switches domains and reveals research mode details", () => {
    // "benefits" is no longer a valid domain slug (see FIXLOG.md - its route
    // never actually pointed at this dashboard in production); "/housing" is
    // one of the 3 domains still routed here.
    localStorage.setItem("michigan-access-county", "Wayne");
    renderDashboard(["/housing"]);

    expect(screen.getByRole("heading", { name: /wayne county - housing intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /renter burden rate/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: /toggle research mode/i }));

    expect(screen.getByText(/research mode enabled/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /methodology/i })).toHaveAttribute("id", "methodology-link");
    expect(screen.getByRole("table")).toHaveAttribute("id", "data-table");
  });

  it("prompts for a county instead of silently defaulting to Wayne", () => {
    // No stored county: the dashboard must not show Wayne data under an
    // "All Michigan" heading. It asks for a county instead.
    renderDashboard(["/housing"]);

    expect(screen.getByRole("heading", { name: /all michigan - housing intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pick a county to see local signals/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /choose a county/i })).toBeInTheDocument();
    // Wayne's county-scoped content must be absent.
    expect(screen.queryByRole("heading", { name: /renter burden rate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /wayne county in context/i })).not.toBeInTheDocument();
  });

  it("shows sourced context indicators for a non-priority county (Alcona)", () => {
    // Alcona has no priority-county deep-dive record, but the cross-domain
    // context section covers all 83 counties, so the dashboard is no longer
    // an empty "Data pending" wall outside the 7 priority counties.
    localStorage.setItem("michigan-access-county", "Alcona");
    renderDashboard(["/housing"]);

    expect(screen.getByRole("heading", { name: /alcona county in context/i })).toBeInTheDocument();
    // Median gross rent for Alcona, straight from COUNTY_CROSS_DOMAIN.
    expect(screen.getByText("$580")).toBeInTheDocument();
    // Every context tile carries its named source.
    expect(screen.getAllByText(/census acs 5-year/i).length).toBeGreaterThan(0);
    // The provenance chip labels the section as verified primary data.
    expect(screen.getByRole("button", { name: /provenance: verified/i })).toBeInTheDocument();
  });

  it("no longer offers the removed energy or legal-aid domain tabs", () => {
    renderDashboard();
    expect(screen.queryByRole("link", { name: /^energy$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /legal aid/i })).not.toBeInTheDocument();
  });
});
