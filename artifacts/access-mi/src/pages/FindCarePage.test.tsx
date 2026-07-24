import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CountyProvider } from "@/contexts/CountyContext";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const searchMock = vi.fn();
vi.mock("@/hooks/useNPISearch", () => ({
  useNPISearch: () => ({
    results: [],
    isLoading: false,
    error: null,
    searched: false,
    search: searchMock,
    reset: vi.fn(),
  }),
}));

import FindCarePage from "@/pages/FindCarePage";

function renderPage(initialEntry = "/find-care") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <CountyProvider>
          <FindCarePage />
        </CountyProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("FindCarePage location context", () => {
  beforeEach(() => {
    localStorage.clear();
    searchMock.mockClear();
  });

  it("pre-fills location from the site-wide county context", () => {
    localStorage.setItem("michigan-access-county", "Kent");
    renderPage();

    expect(screen.getByLabelText(/where in michigan\?/i)).toHaveValue("Kent");
  });

  it("lets an explicit ?county= URL param beat the stored context", () => {
    localStorage.setItem("michigan-access-county", "Kent");
    renderPage("/find-care?county=Marquette");

    expect(screen.getByLabelText(/where in michigan\?/i)).toHaveValue(
      "Marquette",
    );
  });

  it("starts blank when neither URL nor context provide a county", () => {
    renderPage();
    expect(screen.getByLabelText(/where in michigan\?/i)).toHaveValue("");
  });

  it("honors ?q= deep links by selecting the matching provider category and searching", () => {
    localStorage.setItem("michigan-access-county", "Kent");
    renderPage("/find-care?q=doctor");

    expect(searchMock).toHaveBeenCalledTimes(1);
    const [taxonomies, enumerationType, county, mode] = searchMock.mock.calls[0];
    expect(Array.isArray(taxonomies)).toBe(true);
    expect(enumerationType).toBe("NPI-1");
    expect(county).toBe("Kent");
    expect(mode).toBe("specialty");
  });

  it("selects static categories from ?q= without firing a provider search", () => {
    renderPage("/find-care?q=food");

    expect(searchMock).not.toHaveBeenCalled();
    // The page still renders a location field in either its initial or
    // results layout - the q param must not crash or fire a provider search.
    expect(
      screen.getAllByLabelText(/where in michigan\?|location filter/i).length,
    ).toBeGreaterThan(0);
  });

  it("shows a statewide care-capacity card when no county is set", () => {
    renderPage();

    expect(screen.getByText("Care Capacity vs. Need")).toBeInTheDocument();
    expect(screen.getByText("Michigan statewide")).toBeInTheDocument();
  });

  it("scopes the care-capacity card to the selected county", () => {
    localStorage.setItem("michigan-access-county", "Kent");
    renderPage();

    expect(screen.getByText("Kent County")).toBeInTheDocument();
  });
});
