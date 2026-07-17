import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("@/hooks/useOutageData", () => ({
  useOutageData: () => ({ data: undefined }),
}));
vi.mock("@/hooks/useFacilities", () => ({
  useFacilities: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/hooks/useCommunityResources", () => ({
  useCommunityResources: () => ({ data: [], isLoading: false, error: null }),
}));
vi.mock("@/contexts/CountyContext", () => ({
  useCounty: () => ({ county: null, setCounty: vi.fn() }),
  MICHIGAN_COUNTIES: ["Wayne"],
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import Index from "@/pages/Index";

describe("Home page - a11y", () => {
  it("Index has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
