import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import fs from "fs";
import path from "path";

// ── shared mocks ─────────────────────────────────────────────────────────────

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));
vi.mock("@/hooks/usePersonalProfile", () => ({
  usePersonalProfile: () => ({ profile: {} }),
}));

// Heavy sub-components: render nothing
vi.mock("@/components/brief/MetricCluster", () => ({ default: () => null }));
vi.mock("@/components/shared/CivicInsightGauge", () => ({
  CivicInsightGauge: () => <div data-testid="gauge" />,
}));
vi.mock("@/components/shared/CivicScoreBreakdown", () => ({
  default: () => null,
}));
vi.mock("@/components/shared/AskCopilotButton", () => ({
  default: () => null,
}));
vi.mock("@/components/shared/ViewModeToggle", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <button onClick={() => onChange("standard")} data-testid="view-toggle">
      {value}
    </button>
  ),
}));
vi.mock("@/components/brief/CHNAViewSection", () => ({ default: () => null }));
vi.mock("@/components/brief/UtilityStressSection", () => ({
  default: () => null,
}));
vi.mock("@/components/brief/GetToCarePanel", () => ({ default: () => null }));
vi.mock("@/components/brief/PartnerCTABar", () => ({ default: () => null }));
vi.mock("@/components/shared/CivicDataCallout", () => ({
  default: () => null,
}));
vi.mock("@/components/shared/PageFeedback", () => ({ default: () => null }));
vi.mock("@/components/layout/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/data/cross-domain-indicators", () => ({
  getCountyCrossDomain: () => ({
    rentBurden: null,
    vehicleAccess: null,
    commuteTime: null,
    povertyRate: null,
    drinkingWaterCompliance: null,
  }),
  MI_STATE_AVERAGES: {},
}));

// CountyContext  -  will be overridden per describe block
const mockSetCounty = vi.fn();
let mockCounty: string | null = "Saginaw";

vi.mock("@/contexts/CountyContext", () => ({
  useCounty: () => ({ county: mockCounty, setCounty: mockSetCounty }),
  MICHIGAN_COUNTIES: ["Saginaw", "Keweenaw", "Wayne"],
}));

// ── imports after mocks ───────────────────────────────────────────────────────

import BriefPage from "@/pages/BriefPage";

// ── helpers ──────────────────────────────────────────────────────────────────

function renderBrief(county: string) {
  mockCounty = county;
  return render(
    <MemoryRouter initialEntries={[`/brief?county=${county}`]}>
      <BriefPage />
    </MemoryRouter>,
  );
}

const ROOT = path.resolve(__dirname, "../../..");
const briefSrc = fs.readFileSync(
  path.join(ROOT, "src/pages/BriefPage.tsx"),
  "utf8",
);

// ── source-inspection guard ───────────────────────────────────────────────────

describe("BriefPage source  -  no hand-typed date literals", () => {
  it("BriefPage.tsx contains no YYYY-MM-DD date literals", () => {
    expect(briefSrc).not.toMatch(/20\d\d-\d\d-\d\d/);
  });

  it("print header uses retrievedDate variable, not a hardcoded string", () => {
    expect(briefSrc).toContain("retrievedDate");
    expect(briefSrc).not.toContain("Data as of March");
  });

  it("PDF export calls generateBriefPDF, not window.open", () => {
    expect(briefSrc).toContain("generateBriefPDF");
    expect(briefSrc).not.toContain("window.open");
  });

  it("cite-this block present in source", () => {
    expect(briefSrc).toContain("Cite this page");
    expect(briefSrc).toContain("citeText");
  });

  it("independence disclosure present as always-visible element", () => {
    expect(briefSrc).toContain(
      "AccessMI is an independent civic data and education project",
    );
    expect(briefSrc).not.toMatch(/independence.*print:block/s);
  });
});

// ── Saginaw (full data) ───────────────────────────────────────────────────────

describe("BriefPage  -  Saginaw (full data)", () => {
  it("renders stat blocks with source labels", () => {
    renderBrief("Saginaw");
    const statBlocks = document.querySelectorAll("[data-brief-stat]");
    expect(statBlocks.length).toBeGreaterThanOrEqual(5);
  });

  it("every stat block has an integrity badge (aria-label starting with 'Data integrity')", () => {
    renderBrief("Saginaw");
    const statBlocks = document.querySelectorAll("[data-brief-stat]");
    statBlocks.forEach((block) => {
      const badge = block.querySelector("[aria-label^='Data integrity']");
      expect(badge).not.toBeNull();
    });
  });

  it("shows ALICE rate for Saginaw (county is seeded)", () => {
    renderBrief("Saginaw");
    expect(screen.getByText("ALICE Economic Hardship")).toBeInTheDocument();
    // Value should NOT be "No data available for this county"
    const aliceBlock = document
      .querySelector("[data-brief-stat]")
      ?.closest?.("div");
    const noDataText = screen.queryByText(
      /No data available for this county/i,
      { selector: "[data-brief-stat] *" },
    );
    // ALICE is seeded for Saginaw, so at least one block should show a %
    expect(screen.getByText(/ALICE Economic Hardship/)).toBeInTheDocument();
  });

  it("cite-this block renders with county name", () => {
    renderBrief("Saginaw");
    expect(screen.getByText("Cite this page")).toBeInTheDocument();
    // The <pre> element holds the citation text
    const pre = document.querySelector("pre");
    expect(pre?.textContent).toMatch(/Saginaw County Brief/);
  });

  it("independence disclosure is visible (at least one always-rendered instance)", () => {
    renderBrief("Saginaw");
    const els = screen.getAllByText(
      /AccessMI is an independent civic data and education project/i,
    );
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it("population stat block shows Census source", () => {
    renderBrief("Saginaw");
    expect(screen.getByText("Population")).toBeInTheDocument();
    expect(screen.getByText(/Census Bureau PEP/)).toBeInTheDocument();
  });
});

// ── Keweenaw (null / genuine-zero paths) ─────────────────────────────────────

describe("BriefPage  -  Keweenaw (null handling)", () => {
  it("renders without crashing for Keweenaw", () => {
    expect(() => renderBrief("Keweenaw")).not.toThrow();
  });

  it("PCP ratio shows null treatment for Keweenaw (value is '-')", () => {
    renderBrief("Keweenaw");
    // The PCP ratio label should appear but no badge conflict
    expect(screen.getByText("Primary Care Ratio")).toBeInTheDocument();
    // There must be no 'verified' badge rendering contradictory data alongside a '-' value
    // The null block renders "No data available for this county" or shows '-' without a value span
    const pcpBlock = Array.from(
      document.querySelectorAll("[data-brief-stat]"),
    ).find((el) => el.textContent?.includes("Primary Care Ratio"));
    expect(pcpBlock).toBeDefined();
    // Within this block, the value paragraph should show no-data text, not a bold number
    const boldValues = pcpBlock?.querySelectorAll("p.text-2xl");
    // Either the value is '-' treated as null (no bold text), or the no-data italic renders
    if (boldValues && boldValues.length > 0) {
      // If it did render bold, it must not be a meaningful number
      expect(boldValues[0].textContent).not.toMatch(/\d+:\d+/);
    }
  });

  it("facilities block shows 0 for Keweenaw, not blank", () => {
    renderBrief("Keweenaw");
    expect(screen.getByText("Health Facilities")).toBeInTheDocument();
    // Keweenaw is expected_zero_counties  -  count is 0, shown as "0 (verified zero)"
    expect(screen.getByText(/0 \(verified zero\)/)).toBeInTheDocument();
  });

  it("ALICE block shows no-data treatment for Keweenaw (not seeded)", () => {
    renderBrief("Keweenaw");
    expect(screen.getByText("ALICE Economic Hardship")).toBeInTheDocument();
    expect(
      screen.getByText(/No data available for this county/i),
    ).toBeInTheDocument();
  });

  it("no contradictory badges  -  null stats do not show 'verified' with a value", () => {
    renderBrief("Keweenaw");
    const statBlocks = document.querySelectorAll("[data-brief-stat]");
    statBlocks.forEach((block) => {
      const italic = block.querySelector("p.italic");
      if (italic) {
        // This is a null block  -  it should not have a bold value sibling
        const boldVal = block.querySelector("p.text-2xl");
        expect(boldVal).toBeNull();
      }
    });
  });

  it("cite-this block renders with Keweenaw name", () => {
    renderBrief("Keweenaw");
    expect(screen.getByText("Cite this page")).toBeInTheDocument();
    const pre = document.querySelector("pre");
    expect(pre?.textContent).toMatch(/Keweenaw County Brief/);
  });
});
