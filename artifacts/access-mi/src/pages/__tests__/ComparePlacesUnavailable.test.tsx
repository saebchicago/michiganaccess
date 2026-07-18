import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Layout to avoid the Header/ContextBar context cascade.
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

// The hook return value is swapped per-test via this holder.
const censusReturn: { current: unknown } = { current: null };

vi.mock("@/hooks/useCensusACS", () => ({
  useCensusACS: () => censusReturn.current,
  // With no usable tables every metric resolves to null -> "N/A", which is
  // the intended safe degraded rendering. Never returns backend internals.
  getCensusValue: () => null,
}));

import ComparePlacesPage from "../ComparePlacesPage";

// Strings that must NEVER appear in the rendered UI, regardless of the
// underlying failure. Mirrors scripts/check-no-backend-leak.mjs.
const FORBIDDEN_INTERNALS = [
  "CENSUS_API_KEY",
  "census-acs-proxy",
  "bodySnippet",
  "<!doctype html",
  "<html",
  "returned HTTP",
  "HTTP 500",
  "edge function",
  "Supabase",
  "proxy",
];

// Two distinct failure payloads that both surface as source: "unavailable"
// from the real useCensusACS queryFn (see makeUnavailable): a network/HTTP
// failure and an HTTP-200-with-HTML-body failure.
const FETCH_FAILURE = {
  data: {
    year: 2022,
    dataset: "acs5",
    geoType: "county",
    geoFips: "26163",
    tables: {},
    source: "unavailable",
    error: {
      status: 500,
      message: "census-acs-proxy returned HTTP 500",
      bodySnippet: "Missing/Invalid Key: set CENSUS_API_KEY",
    },
  },
  isLoading: false,
  isError: false,
  error: null,
};

const HTML_200_FAILURE = {
  data: {
    year: 2022,
    dataset: "acs5",
    geoType: "county",
    geoFips: "26125",
    tables: {},
    source: "unavailable",
    error: {
      status: 200,
      contentType: "text/html",
      message: "Proxy returned 200 but the body was not JSON",
      bodySnippet: "<!doctype html><html><body>Invalid Key</body></html>",
    },
  },
  isLoading: false,
  isError: false,
  error: null,
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/compare?a=Wayne&b=Oakland"]}>
        <ComparePlacesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ComparePlacesPage - graceful unavailable state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("(a) simulated fetch failure renders the clean unavailable copy with zero internal strings", () => {
    censusReturn.current = FETCH_FAILURE;
    renderPage();

    expect(
      screen.getByText(/Economic data temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We show data only when we can verify it\./i),
    ).toBeInTheDocument();

    const body = document.body.textContent ?? "";
    for (const forbidden of FORBIDDEN_INTERNALS) {
      expect(body.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("(b) simulated HTTP-200 HTML response renders the same clean state with zero internal strings", () => {
    censusReturn.current = HTML_200_FAILURE;
    renderPage();

    expect(
      screen.getByText(/Economic data temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We show data only when we can verify it\./i),
    ).toBeInTheDocument();

    const body = document.body.textContent ?? "";
    for (const forbidden of FORBIDDEN_INTERNALS) {
      expect(body.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
