import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReentryCareNavigator from "@/pages/ReentryCareNavigator";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

describe("ReentryCareNavigator", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <ReentryCareNavigator />
      </MemoryRouter>,
    );
  }

  it("shows the Reentry in Michigan stat block with sources", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /reentry in michigan/i })).toBeInTheDocument();
    expect(screen.getByText("32,778")).toBeInTheDocument();
    expect(screen.getByText("21.0%")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByText("69%")).toBeInTheDocument();
    expect(screen.getAllByText(/mdoc/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/mlpp analysis of mdoc data/i)).toBeInTheDocument();
  });

  it("no longer states the Vocational Village employment figure as a bare uncited bullet", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /find employment/i }));

    expect(
      screen.getByText(/vocational village graduates: see employment and recidivism outcomes above/i),
    ).toBeInTheDocument();
  });

  it("renders the resource accordion sections", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /coming home to michigan/i })).toBeInTheDocument();
    expect(screen.getByText("Get Your ID")).toBeInTheDocument();
    expect(screen.getByText("Find Housing")).toBeInTheDocument();
    expect(screen.getByText("Find Employment")).toBeInTheDocument();
  });
});
