import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "vitest-axe";

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
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import FindCarePage from "@/pages/FindCarePage";

describe("Find Care page - a11y", () => {
  it("FindCarePage has no a11y violations", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <FindCarePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
