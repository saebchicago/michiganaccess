import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { CountyProvider } from "@/contexts/CountyContext";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@/components/layout/Breadcrumbs", () => ({
  default: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));

import EarlyChildhoodPage from "@/pages/EarlyChildhoodPage";

describe("Early Childhood page - a11y", () => {
  it("EarlyChildhoodPage has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <CountyProvider>
          <EarlyChildhoodPage />
        </CountyProvider>
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
