import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

vi.mock("@/components/shared/MySettingsDrawer", () => ({
  default: () => <div data-testid="settings-drawer" />,
}));
vi.mock("@/components/shared/LanguageSwitcher", () => ({
  default: () => <div data-testid="lang-switcher" />,
}));
vi.mock("@/components/shared/ThemeToggle", () => ({
  default: () => <button aria-label="Toggle theme" />,
}));
vi.mock("@/components/shared/CountySelector", () => ({
  default: () => <div data-testid="county-selector" />,
}));
vi.mock("@/components/shared/SiteSearch", () => ({
  default: () => <div data-testid="site-search" />,
  commandSiteSearch: () => {},
}));
vi.mock("@/components/shared/ReportIssue", () => ({
  default: () => <div data-testid="report-issue" />,
}));
vi.mock("@/components/shared/OnboardingTour", () => ({
  replayTour: () => {},
}));
vi.mock("@/contexts/CountyContext", () => ({
  useCounty: () => ({ county: null, setCounty: vi.fn() }),
}));
vi.mock("@/hooks/useFooterStats", () => ({
  useFooterStats: () => ({
    loadTime: 120,
    facilityCount: 0,
    lastUpdated: null,
  }),
  formatLoadTime: (ms: number) => `${ms}ms`,
  loadTimeColor: () => "text-green-500",
}));
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

describe("App shell layout - a11y", () => {
  it("Header has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Footer has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
