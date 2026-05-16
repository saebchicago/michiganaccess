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

  it("renders Wayne health intelligence with eight signal cards", () => {
    localStorage.setItem("michigan-access-county", "Wayne");
    renderDashboard();

    expect(screen.getByRole("heading", { name: /wayne county - health intelligence/i })).toBeInTheDocument();
    expect(screen.getAllByText(/source cadence/i)).toHaveLength(8);
    expect(screen.getByRole("heading", { name: /life expectancy/i })).toBeInTheDocument();
  });

  it("switches domains and reveals research mode details", () => {
    renderDashboard(["/benefits"]);

    expect(screen.getByRole("heading", { name: /all michigan - benefits intelligence/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: /toggle research mode/i }));

    expect(screen.getByText(/research mode enabled/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /methodology/i })).toHaveAttribute("id", "methodology-link");
    expect(screen.getByRole("table")).toHaveAttribute("id", "data-table");
  });
});
