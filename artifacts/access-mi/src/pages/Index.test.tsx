import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CountyProvider } from "@/contexts/CountyContext";
import Index from "@/pages/Index";
import { getLibrarySize } from "@/components/home/homeDestinations";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

function renderHomepage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CountyProvider>
          <Index />
        </CountyProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Index (homepage)", () => {
  it("shows the statewide need-vs-capacity section right after the hero, before the intelligence briefing", async () => {
    localStorage.clear();
    renderHomepage();

    expect(
      screen.getByRole("heading", {
        name: /where care is short, and where to turn/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /find help near you/i }),
    ).toHaveAttribute("href", "/find-care");
  });

  it("renders three clear entry pathways", () => {
    // The old three abstract doors are replaced by four concrete intents.
    // Contents come from the route taxonomy via getIntentCards(); the
    // taxonomy guard pins exactly 3 destinations per intent, so this
    // asserts the wiring, not hand-typed labels.
    localStorage.clear();
    renderHomepage();

    const section = screen
      .getByRole("heading", { name: /three ways in/i })
      .closest("section")!;
    for (const title of [
      "Get help now",
      "Understand my place",
      "Use data to decide",
    ]) {
      expect(within(section).getByText(title)).toBeInTheDocument();
    }
    // One taxonomy-assigned destination per intent, resolved by href.
    for (const href of ["/find-care", "/brief", "/foia", "/data-explorer"]) {
      expect(
        within(section)
          .getAllByRole("link")
          .some((a) => a.getAttribute("href") === href),
        `intent cards missing a link to ${href}`,
      ).toBe(true);
    }
  });

  it("Analyst mode reorders the intent cards to lead with analyst tools", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    renderHomepage();

    await user.click(screen.getByRole("tab", { name: "Analyst" }));
    const section = screen
      .getByRole("heading", { name: /three ways in/i })
      .closest("section")!;
    const headings = within(section)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings[0]).toBe("Use data to decide");

    // Resident pathways stay one click away, not removed.
    await user.click(screen.getByRole("tab", { name: "Resident" }));
    expect(
      within(section)
        .getAllByRole("link")
        .some((a) => a.getAttribute("href") === "/find-care"),
    ).toBe(true);
  });

  it("explore band counts come from the taxonomy, not literals", () => {
    localStorage.clear();
    renderHomepage();

    // The band's total equals the curated-library size the /explore page
    // renders; anything hand-typed here would be the counts-drift bug the
    // audit removed everywhere else.
    expect(
      screen.getByRole("heading", {
        name: new RegExp(`${getLibrarySize()} destinations`),
      }),
    ).toBeInTheDocument();
  });

  it("legend lists every provenance label the platform can render", () => {
    localStorage.clear();
    renderHomepage();

    // The heading promises "Every number carries a label", so the legend has to
    // show the full set. PENDING was added to ProvenanceTag but missed here.
    for (const label of ["VERIFIED", "MODELED", "PROJECTED", "PENDING"]) {
      expect(
        screen.getAllByText(label).length,
        `${label} missing from the homepage provenance legend`,
      ).toBeGreaterThan(0);
    }
  });
});
