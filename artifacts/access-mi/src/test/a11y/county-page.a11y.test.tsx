import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { axe } from "vitest-axe";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/useFacilities", () => ({
  useFacilities: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/useCommunityResources", () => ({
  useCommunityResources: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/useCommunityEvents", () => ({
  useCommunityEvents: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/useEPAEcho", () => ({
  useECHOFacilities: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("@/contexts/CountyContext", () => ({
  useCounty: () => ({ county: "Wayne", setCounty: vi.fn() }),
  MICHIGAN_COUNTIES: ["Wayne"],
}));
vi.mock("@/components/shared/SpotlightTabs", () => ({
  default: () => <div data-testid="spotlight-tabs" />,
}));
vi.mock("@/components/county/CountyCivicSection", () => ({
  default: () => <div data-testid="county-civic" />,
}));
vi.mock("@/components/county/DownloadCountyGuide", () => ({
  default: () => <div data-testid="download-guide" />,
}));
vi.mock("@/components/county/MunicipalToolkit", () => ({
  default: () => <div data-testid="municipal-toolkit" />,
}));
vi.mock("@/components/county/RecentlyViewedBar", () => ({
  default: () => <div data-testid="recently-viewed" />,
}));
vi.mock("@/components/county/UninsuredSparkline", () => ({
  default: () => <div data-testid="uninsured-sparkline" />,
}));
vi.mock("@/components/county/PopulationSparkline", () => ({
  default: () => <div data-testid="population-sparkline" />,
}));
vi.mock("@/components/county/JusticeSection", () => ({
  default: () => <div data-testid="justice-section" />,
}));
vi.mock("@/components/shared/SnapshotCard", () => ({
  default: () => <div data-testid="snapshot-card" />,
}));
vi.mock("@/components/shared/DataConfidenceCard", () => ({
  default: () => <div data-testid="data-confidence" />,
  buildDataConfidence: () => [],
}));
vi.mock("@/components/shared/ResultHeader", () => ({
  default: () => <div data-testid="result-header" />,
}));
vi.mock("@/components/pillars/CivicIntelligenceSection", () => ({
  default: () => <div data-testid="civic-intelligence" />,
}));
vi.mock("@/components/MichiganEnvBurdenMap", () => ({
  default: () => <div data-testid="env-burden-map" />,
}));
vi.mock("@/components/shared/TruncatedResourceList", () => ({
  TruncatedResourceList: () => <div data-testid="resource-list" />,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import CountyPage from "@/pages/CountyPage";

describe("County dashboard page - a11y", () => {
  it("CountyPage has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/county/wayne"]}>
        <Routes>
          <Route path="/county/:slug" element={<CountyPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
