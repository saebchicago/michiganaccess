import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import OpenDataGapsPage from "@/pages/OpenDataGapsPage";
import {
  OPEN_DATA_GAPS,
  GAP_LANE_LABELS,
  summarizeGaps,
} from "@/data/openDataGaps";

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/usePageMeta", () => ({ usePageMeta: () => {} }));

function renderPage() {
  return render(
    <MemoryRouter>
      <OpenDataGapsPage />
    </MemoryRouter>,
  );
}

describe("OpenDataGapsPage", () => {
  it("renders every registry entry with an anchor for deep links", () => {
    renderPage();
    for (const gap of OPEN_DATA_GAPS) {
      const el = document.getElementById(gap.id);
      expect(el, `missing card anchor #${gap.id}`).not.toBeNull();
      expect(el!.textContent).toContain(gap.whatIsMissing);
    }
  });

  it("summary tiles derive from the registry rollup", () => {
    renderPage();
    const s = summarizeGaps();
    expect(
      screen.getByText("Documented gaps").previousSibling,
    ).toHaveTextContent(String(s.total));
  });

  it("lane filter narrows to platform-side gaps and back", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", {
        name: GAP_LANE_LABELS["not-yet-ingested"],
      }),
    );
    for (const gap of OPEN_DATA_GAPS) {
      const present = document.getElementById(gap.id) !== null;
      expect(present, gap.id).toBe(gap.lane === "not-yet-ingested");
    }

    await user.click(screen.getByRole("button", { name: "All gaps" }));
    expect(document.getElementById(OPEN_DATA_GAPS[0].id)).not.toBeNull();
  });

  it("surfaces the trend exclusions recorded in trendSeries provenance", () => {
    renderPage();
    expect(
      screen.getByText(/trend lines this platform declines to draw/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/CDC PLACES:/)).toBeInTheDocument();
  });

  it("links the FOIA builder as the primary constructive action", () => {
    renderPage();
    expect(
      screen.getByRole("link", { name: /foia request builder/i }),
    ).toHaveAttribute("href", "/foia");
  });
});
