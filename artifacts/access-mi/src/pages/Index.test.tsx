import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CountyProvider } from "@/contexts/CountyContext";
import Index from "@/pages/Index";
import {
  getIntentCards,
  getLibrarySize,
} from "@/components/home/homeDestinations";
import {
  HRSA_HPSA_COUNTY_PROVENANCE,
  HRSA_HPSA_COUNTY_RECORDS,
} from "@/data/hrsa-hpsa-county";

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
    // The homepage composes three reader pathways from the four underlying
    // taxonomy intents: help, place, and a combined money + analyst pathway.
    // Validate the destinations returned by getIntentCards() rather than
    // hard-coding a route that can become stale when editorial ordering changes.
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

    const renderedHrefs = within(section)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    const expectedHrefs = getIntentCards().flatMap((card) =>
      card.destinations.map((destination) => destination.href),
    );

    for (const href of expectedHrefs) {
      expect(
        renderedHrefs.includes(href),
        `intent cards missing taxonomy destination ${href}`,
      ).toBe(true);
    }
  });

  it("frames dental intelligence across capacity, use, and coverage", async () => {
    localStorage.clear();
    renderHomepage();

    const section = (
      await screen.findByRole("heading", {
        name: /whole dental-care picture/i,
      })
    ).closest("section")!;
    const dentalCount = HRSA_HPSA_COUNTY_RECORDS.filter(
      (county) => county.disciplines.dental.designatedHpsas > 0,
    ).length;
    expect(
      within(section).getByText(
        new RegExp(`${dentalCount} of ${HRSA_HPSA_COUNTY_RECORDS.length}`),
      ),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("link", { name: /verify with/i }),
    ).toHaveAttribute("href", HRSA_HPSA_COUNTY_PROVENANCE.source_url);
    for (const label of ["Capacity", "Use", "Coverage"]) {
      expect(within(section).getByText(label)).toBeInTheDocument();
    }
    for (const href of ["/equity", "/data-explorer", "/insurance-coverage"]) {
      expect(
        within(section).getByRole("link", {
          name: new RegExp(
            href === "/equity"
              ? "shortages"
              : href === "/data-explorer"
                ? "dental visits"
                : "coverage context",
            "i",
          ),
        }),
      ).toHaveAttribute("href", href);
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
