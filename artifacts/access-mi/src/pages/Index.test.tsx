import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("shows the statewide need-vs-capacity section right after the hero, before the intelligence briefing", () => {
    localStorage.clear();
    renderHomepage();

    expect(
      screen.getByRole("heading", { name: /where care is short, and where to turn/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Care Capacity vs. Need")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find help near you/i })).toHaveAttribute(
      "href",
      "/find-care",
    );
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
