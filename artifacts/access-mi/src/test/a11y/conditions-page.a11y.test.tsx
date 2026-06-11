import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
vi.mock("@/hooks/useProviders", () => ({
  useProviders: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import HealthConditionsPage from "@/pages/HealthConditionsPage";

describe("Health conditions page - a11y", () => {
  it("HealthConditionsPage has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <HealthConditionsPage />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
