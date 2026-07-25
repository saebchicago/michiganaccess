import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { GapFlag } from "@/components/shared/GapFlag";
import { GAP_LANE_LABELS, getGapById } from "@/data/openDataGaps";

function renderFlag(gapId: string) {
  return render(
    <MemoryRouter>
      <GapFlag gapId={gapId} />
    </MemoryRouter>,
  );
}

describe("GapFlag", () => {
  it("renders nothing for an unknown gap id", () => {
    const { container } = renderFlag("does-not-exist");
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the gap and its lane in the accessible name", () => {
    renderFlag("foia-statewide-counts");
    const btn = screen.getByRole("button");
    expect(btn).toHaveAccessibleName(
      expect.stringContaining("Statewide FOIA request statistics"),
    );
    expect(btn).toHaveAccessibleName(
      expect.stringContaining(GAP_LANE_LABELS["not-published"]),
    );
  });

  it("opens a popover with holder, citation, and the gaps-page link", async () => {
    const user = userEvent.setup();
    renderFlag("kindergarten-readiness");
    await user.click(screen.getByRole("button"));

    const gap = getGapById("kindergarten-readiness")!;
    expect(screen.getByText(gap.whatIsMissing)).toBeInTheDocument();
    // Holder and citation render as label + value inside one paragraph, so
    // assert on the dialog's combined text rather than a single text node.
    const popover = screen.getByText(gap.whatIsMissing).closest("div");
    expect(popover?.textContent).toContain(gap.holder);
    expect(popover?.textContent).toContain("Gap citation:");
    expect(
      screen.getByRole("link", { name: /see all open data gaps/i }),
    ).toHaveAttribute("href", "/data-gaps#kindergarten-readiness");
  });

  it("states it plainly when no reason has been published", async () => {
    const user = userEvent.setup();
    renderFlag("foia-statewide-counts");
    await user.click(screen.getByRole("button"));
    expect(screen.getByText(/no published reason/i)).toBeInTheDocument();
  });
});
