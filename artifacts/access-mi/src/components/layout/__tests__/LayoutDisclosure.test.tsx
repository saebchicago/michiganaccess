import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── shared mocks ────────────────────────────────────────────────────────────

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// ── Footer mocks ─────────────────────────────────────────────────────────────

vi.mock("@/hooks/useFooterStats", () => ({
  useFooterStats: () => ({
    countyCount: 83,
    dataFeeds: 41,
    resourceCount: "15,000+",
  }),
  formatLoadTime: () => "0ms",
  loadTimeColor: () => "text-green-500",
}));

vi.mock("@/components/shared/ReportIssue", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/OnboardingTour", () => ({
  replayTour: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/config/platformConstants", () => ({
  DATA_SOURCE_DISPLAY: "41",
}));

// ── Header mocks ─────────────────────────────────────────────────────────────

vi.mock("@/components/shared/MySettingsDrawer", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/LanguageSwitcher", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/ThemeToggle", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/CountySelector", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/SiteSearch", () => ({
  default: () => null,
  commandSiteSearch: vi.fn(),
}));

vi.mock("@/contexts/CountyContext", () => ({
  useCounty: () => ({ county: null }),
}));

vi.mock("@/routes/manifest", () => ({
  NAV_GROUPS: [],
  isNavGroup: () => false,
}));

// ── imports after mocks ───────────────────────────────────────────────────────

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

// ── tests ─────────────────────────────────────────────────────────────────────

describe("Footer  -  D1 independence disclosure", () => {
  it("renders the full D1 sentence", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(
        /AccessMI is an independent civic data and education project\. It is not affiliated with the State of Michigan, any government agency, employer, or health system\./i,
      ),
    ).toBeInTheDocument();
  });

  it("D1 sentence is not inside a collapsed or toggle-gated element", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const el = screen.getByText(
      /AccessMI is an independent civic data and education project\./i,
    );
    // Must be visible  -  not hidden by details/summary or aria-hidden
    expect(el).toBeVisible();
  });
});

describe("Header  -  D2 tagline", () => {
  it("renders 'Independent civic data' tagline in the logo lockup", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("Independent civic data")).toBeInTheDocument();
  });

  it("D2 tagline is inside the home logo link", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const homeLink = screen.getByRole("link", {
      name: /Access Michigan Home/i,
    });
    expect(homeLink).toContainElement(
      screen.getByText("Independent civic data"),
    );
  });
});
