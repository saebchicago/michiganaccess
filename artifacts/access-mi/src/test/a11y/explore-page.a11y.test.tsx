import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

import ExplorePage from "@/pages/ExplorePage";

describe("Explore page - a11y", () => {
  it("ExplorePage has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);

  it("filters by subject chip and search text with derived counts", () => {
    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>,
    );
    // The chip row derives its counts from the taxonomy-curated index.
    const allChip = screen.getByRole("button", { name: /^All/ });
    expect(allChip).toHaveAttribute("aria-pressed", "true");

    const civicChip = screen.getByRole("button", { name: /Civic power/ });
    fireEvent.click(civicChip);
    expect(civicChip).toHaveAttribute("aria-pressed", "true");
    expect(allChip).toHaveAttribute("aria-pressed", "false");

    const search = screen.getByLabelText("Search the library");
    fireEvent.change(search, { target: { value: "uncontested" } });
    expect(
      screen.getByRole("link", { name: /Civic Power Map/ }),
    ).toBeInTheDocument();
  });
});
