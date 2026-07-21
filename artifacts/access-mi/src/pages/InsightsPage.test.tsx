import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InsightsPage from "@/pages/InsightsPage";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

describe("InsightsPage", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <InsightsPage />
      </MemoryRouter>,
    );
  }

  it("leads with the editorial masthead and provenance legend", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /what the data says about michigan/i, level: 1 }),
    ).toBeInTheDocument();
    // The three provenance labels are surfaced up front.
    expect(screen.getByRole("button", { name: /provenance: verified/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /provenance: modeled/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /provenance: projected/i })).toBeInTheDocument();
  });

  it("mounts the full narrative stack: insight deck, data stories, and trends", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /insight of the week/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /michigan by the numbers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /michigan over time/i })).toBeInTheDocument();
    // Every data story card is rendered with its title.
    for (const story of DATA_STORIES) {
      expect(screen.getByText(story.title)).toBeInTheDocument();
    }
    // The masthead reflects the real counts, not hardcoded copy.
    expect(
      screen.getByText(new RegExp(`${WEEKLY_INSIGHTS.length} headline findings`, "i")),
    ).toBeInTheDocument();
  });

  it("links onward to the dashboards and methodology", () => {
    renderPage();

    expect(screen.getByRole("link", { name: /health dashboard/i })).toHaveAttribute("href", "/health");
    expect(screen.getByRole("link", { name: /data & insights hub/i })).toHaveAttribute(
      "href",
      "/data-and-insights",
    );
    expect(screen.getAllByRole("link", { name: /methodology/i }).length).toBeGreaterThan(0);
  });
});
