import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DisasterHistoryPage from "@/pages/DisasterHistoryPage";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("@/components/tools/DisasterHistoryDashboard", () => ({
  default: () => <div data-testid="disaster-history-dashboard" />,
}));

describe("DisasterHistoryPage", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <DisasterHistoryPage />
      </MemoryRouter>,
    );
  }

  it("shows the Michigan Disaster Trends stat block with sources", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /michigan disaster trends/i })).toBeInTheDocument();
    expect(screen.getByText("12/decade")).toBeInTheDocument();
    expect(screen.getByText("25+/decade")).toBeInTheDocument();
    expect(screen.getByText("Severe storms")).toBeInTheDocument();
    expect(screen.getAllByText(/fema openfema/i).length).toBeGreaterThan(0);
  });

  it("still renders the live disaster dashboard", () => {
    renderPage();

    expect(screen.getByTestId("disaster-history-dashboard")).toBeInTheDocument();
  });
});
