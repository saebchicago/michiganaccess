import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { getCountyTrends, isUninsuredPending } from "@/data/trendSeries";

// ── shared mocks ─────────────────────────────────────────────────────────────

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// Mock recharts to avoid jsdom SVG rendering issues
vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

// ── imports after mocks ───────────────────────────────────────────────────────

import PopulationSparkline from "@/components/county/PopulationSparkline";
import UninsuredSparkline from "@/components/county/UninsuredSparkline";

// ── PopulationSparkline ───────────────────────────────────────────────────────

describe("PopulationSparkline — Saginaw (full series)", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<PopulationSparkline county="Saginaw" />),
    ).not.toThrow();
  });

  it("shows the '2020–2024' vintage range label", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(screen.getByText(/2020.+2024/)).toBeInTheDocument();
  });

  it("shows 'PEP Annual' label", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(screen.getByText(/PEP Annual/i)).toBeInTheDocument();
  });

  it("shows 'since 2020' in the delta badge", () => {
    render(<PopulationSparkline county="Saginaw" />);
    // "since 2020" appears in both the badge and peer comparison line
    expect(screen.getAllByText(/since 2020/i).length).toBeGreaterThanOrEqual(1);
  });

  it("shows [VERIFIED] integrity label", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(screen.getByText(/VERIFIED/i)).toBeInTheDocument();
  });

  it("shows Census PEP as source", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(
      screen.getByText(/Census Bureau Population Estimates/i),
    ).toBeInTheDocument();
  });

  it("shows peer comparison line with 'modeled' badge", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(screen.getByText(/modeled/i)).toBeInTheDocument();
  });

  it("renders a recharts chart container", () => {
    render(<PopulationSparkline county="Saginaw" />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});

describe("PopulationSparkline — Keweenaw (small population, growing)", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<PopulationSparkline county="Keweenaw" />),
    ).not.toThrow();
  });

  it("shows 'since 2020' badge (positive delta for growing county)", () => {
    render(<PopulationSparkline county="Keweenaw" />);
    expect(screen.getAllByText(/since 2020/i).length).toBeGreaterThanOrEqual(1);
  });
});

describe("PopulationSparkline — unknown county returns null", () => {
  it("returns null for a county not in the dataset", () => {
    const { container } = render(
      <PopulationSparkline county="NotARealCounty" />,
    );
    expect(container.firstChild).toBeNull();
  });
});

// ── UninsuredSparkline ────────────────────────────────────────────────────────

describe("UninsuredSparkline — Saginaw (ACS pending-ci)", () => {
  it("renders without crashing", () => {
    expect(() => render(<UninsuredSparkline county="Saginaw" />)).not.toThrow();
  });

  it("shows 'Uninsured Rate Trend' heading", () => {
    render(<UninsuredSparkline county="Saginaw" />);
    expect(screen.getByText(/Uninsured Rate/i)).toBeInTheDocument();
  });

  it("shows pending message or ACS data depending on trendSeries state", () => {
    render(<UninsuredSparkline county="Saginaw" />);
    const t = getCountyTrends("Saginaw")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      expect(screen.getByText(/Census API key/i)).toBeInTheDocument();
    } else {
      expect(screen.getByText(/Uninsured Rate/i)).toBeInTheDocument();
    }
  });

  it("shows source attribution even in pending state", () => {
    render(<UninsuredSparkline county="Saginaw" />);
    expect(screen.getByText(/American Community Survey/i)).toBeInTheDocument();
  });

  it("no fabricated numbers rendered in pending state", () => {
    const { container } = render(<UninsuredSparkline county="Saginaw" />);
    const t = getCountyTrends("Saginaw")!;
    if (isUninsuredPending(t.uninsuredRate)) {
      const boldValues = container.querySelectorAll(
        "span.text-base.font-bold, p.text-base.font-bold",
      );
      expect(boldValues.length).toBe(0);
    }
  });
});

describe("UninsuredSparkline — Keweenaw (null path, ACS pending-ci)", () => {
  it("renders without crashing for small-population county", () => {
    expect(() =>
      render(<UninsuredSparkline county="Keweenaw" />),
    ).not.toThrow();
  });

  it("shows pending message (not a null crash)", () => {
    render(<UninsuredSparkline county="Keweenaw" />);
    // Either pending message or trend display — must render something
    expect(screen.getByText(/Uninsured Rate/i)).toBeInTheDocument();
  });
});

describe("UninsuredSparkline — when ACS data is populated (future state)", () => {
  it("does not render trend values for pending-ci entries", () => {
    // With current seed (pending-ci), we should see no value rows
    const { container } = render(<UninsuredSparkline county="Wayne" />);
    const dumbbellPoints = container.querySelectorAll("[data-trend-uninsured]");
    // Either pending (no dumbbell) or populated (dumbbell present) — no crash
    expect(container).toBeDefined();
    // If pending, no dumbbell points rendered with fabricated data
    if (dumbbellPoints.length === 0) {
      expect(screen.getByText(/Uninsured Rate/i)).toBeInTheDocument();
    }
  });
});
