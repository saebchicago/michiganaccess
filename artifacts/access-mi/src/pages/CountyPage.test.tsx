import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CountyProvider } from "@/contexts/CountyContext";
import CountyPage from "@/pages/CountyPage";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

function renderCountyPage(slug: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/county/${slug}`]}>
        <CountyProvider>
          <Routes>
            <Route path="/county/:slug" element={<CountyPage />} />
          </Routes>
        </CountyProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CountyPage", () => {
  it("shows the care-capacity-vs-need section scoped to the county", () => {
    renderCountyPage("kent");

    expect(screen.getByText("Care Capacity vs. Need")).toBeInTheDocument();
    expect(screen.getAllByText("Kent County").length).toBeGreaterThan(0);
  });
});
