import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CountyProvider } from "@/contexts/CountyContext";
import Index from "@/pages/Index";

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
    // findBy: NeedCapacityCard is lazy-loaded so its HPSA dataset stays
    // out of the eager homepage chunk; the card resolves a tick later.
    expect(
      await screen.findByText("Care Capacity vs. Need"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /find help near you/i }),
    ).toHaveAttribute("href", "/find-care");
  });

  it("swaps the resident bridge chips for analyst tools in Analyst mode", async () => {
    // The Resident/Analyst toggle used to only reorder the three door cards, so
    // picking "Analyst" changed almost nothing and no homepage affordance
    // reached an analyst tool.
    localStorage.clear();
    const user = userEvent.setup();
    renderHomepage();

    expect(
      screen.getByRole("link", { name: /find care near you/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Analyst" }));

    expect(
      screen.getByRole("heading", { name: /start your analysis/i }),
    ).toBeInTheDocument();
    for (const [name, href] of [
      [/county brief/i, "/brief"],
      [/ask the data/i, "/ask"],
      [/compare counties/i, "/compare"],
      [/compare zip codes/i, "/compare-zips"],
      [/data explorer/i, "/data-explorer"],
      [/downloads/i, "/downloads"],
    ] as const) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }

    // Resident pathways are still one click away, not removed.
    await user.click(screen.getByRole("tab", { name: "Resident" }));
    expect(
      screen.getByRole("link", { name: /find care near you/i }),
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
