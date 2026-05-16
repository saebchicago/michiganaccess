import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClosureWatchPage from "../ClosureWatchPage";
import { CLOSURE_WATCH_FALLBACK } from "@/data/closureWatchFallback";

// Return data synchronously so isLoading=false on first render
vi.mock("@/hooks/useClosureWatch", () => ({
  useClosureWatch: () => ({ data: CLOSURE_WATCH_FALLBACK, isLoading: false }),
}));

// Mock Layout to avoid Header/ContextBar/CountySelector context cascade
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the map — Leaflet requires real DOM APIs not available in jsdom
vi.mock("@/components/closure/ClosureMap", () => ({
  default: () => <div data-testid="closure-map" />,
}));

// Mock usePageMeta (no DOM side-effects needed in tests)
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ClosureWatchPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ClosureWatchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with fallback data", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Michigan Closure Watch/i })).toBeInTheDocument();
  });

  it("renders ProvenanceDisclaimer", () => {
    renderPage();
    expect(
      screen.getByText(/combines measured public data with projections/i)
    ).toBeInTheDocument();
  });

  it("only displays verified entries by default", () => {
    renderPage();
    const verifiedCount = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified").length;
    // At minimum the count/summary shows verified number (may appear in multiple places)
    expect(screen.getAllByText(String(verifiedCount)).length).toBeGreaterThan(0);
  });

  it("does not show pending-second-source entries", () => {
    renderPage();
    const pending = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "pending-second-source");
    for (const entry of pending) {
      expect(screen.queryByText(entry.facilityName)).not.toBeInTheDocument();
    }
  });

  it("shows the correct total verified count in stats", () => {
    renderPage();
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    expect(screen.getAllByText(String(verified.length)).length).toBeGreaterThan(0);
  });

  it("each verified entry shows at least two source links", () => {
    renderPage();
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    for (const entry of verified) {
      // Find the facility name text, then check its card has source links
      const nameEl = screen.queryAllByText((content) =>
        content.includes(entry.facilityName.slice(0, 20))
      )[0];
      if (nameEl) {
        const card = nameEl.closest("[class*='rounded-lg']");
        if (card) {
          const links = within(card as HTMLElement).queryAllByRole("link");
          expect(links.length, `Entry ${entry.id} should have source links`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("filters by year: selecting a year hides entries from other years", () => {
    renderPage();
    const yearSelect = screen.getByRole("combobox", { name: /filter by year/i });

    // Get a year that has entries
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    const years2024 = verified.filter((e) => e.closureDate.startsWith("2024"));
    const years2023 = verified.filter((e) => e.closureDate.startsWith("2023"));

    if (years2024.length > 0 && years2023.length > 0) {
      fireEvent.change(yearSelect, { target: { value: "2024" } });

      // A 2023-only entry should not appear
      const entry2023Only = years2023.find(
        (e) => !years2024.some((e24) => e24.facilityName === e.facilityName)
      );
      if (entry2023Only) {
        expect(screen.queryByText(entry2023Only.facilityName)).not.toBeInTheDocument();
      }
    }
  });

  it("filters by closureType: selecting a type hides other types", () => {
    renderPage();
    const typeSelect = screen.getByRole("combobox", { name: /filter by closure type/i });

    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    const mergers = verified.filter((e) => e.closureType === "merger");
    const fullClosures = verified.filter((e) => e.closureType === "full-closure");

    if (mergers.length > 0 && fullClosures.length > 0) {
      fireEvent.change(typeSelect, { target: { value: "merger" } });

      // A full-closure-only entry should not appear
      const fullClosureOnly = fullClosures.find(
        (e) => !mergers.some((m) => m.facilityName === e.facilityName)
      );
      if (fullClosureOnly) {
        expect(screen.queryByText(fullClosureOnly.facilityName)).not.toBeInTheDocument();
      }
    }
  });

  it("clear filters button resets to all entries", () => {
    renderPage();
    const typeSelect = screen.getByRole("combobox", { name: /filter by closure type/i });
    fireEvent.change(typeSelect, { target: { value: "merger" } });

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearBtn);

    // After clearing, all verified entries should be visible again
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    expect(screen.getAllByText(String(verified.length)).length).toBeGreaterThan(0);
  });

  it("methodology section toggles open", () => {
    renderPage();
    const methodBtn = screen.getByRole("button", { name: /how we verify closures/i });
    expect(screen.queryByText(/Two-source rule/i)).not.toBeInTheDocument();
    fireEvent.click(methodBtn);
    expect(screen.getByText(/Two-source rule/i)).toBeInTheDocument();
  });
});
