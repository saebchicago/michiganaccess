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
vi.mock("@/components/chna/CHNATractMap", () => ({
  CHNATractMap: () => <div data-testid="chna-tract-map" />,
}));
vi.mock("@/components/chna/IntegrityBadge", () => ({
  IntegrityBadge: ({ label }: { label: string }) => <span>{label}</span>,
}));
vi.mock("@/components/shared/PrintButton", () => ({
  default: () => <button type="button">Print</button>,
}));
vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: () => {},
}));
vi.mock("@/utils/generateCHNABrief", () => ({
  generateCHNABriefPDF: () => Promise.resolve(),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import { CHNAExplorerPage } from "@/pages/CHNAExplorerPage";

describe("CHNA Explorer page - a11y", () => {
  it("CHNAExplorerPage has no a11y violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <CHNAExplorerPage />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
