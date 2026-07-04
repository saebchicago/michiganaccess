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
    renderDashboard(["/housing"]);

    expect(screen.getByRole("heading", { name: /all michigan - housing intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /renter burden rate/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: /toggle research mode/i }));

    expect(screen.getByText(/research mode enabled/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /methodology/i })).toHaveAttribute("id", "methodology-link");
    expect(screen.getByRole("table")).toHaveAttribute("id", "data-table");
  });

  it("no longer offers the removed energy or legal-aid domain tabs", () => {
    renderDashboard();
    expect(screen.queryByRole("link", { name: /^energy$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /legal aid/i })).not.toBeInTheDocument();
  });
});
