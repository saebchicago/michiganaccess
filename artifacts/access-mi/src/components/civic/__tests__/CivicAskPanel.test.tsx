import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CivicAskPanel } from "@/components/civic/CivicAskPanel";
import { ANSWERABLE_TOPICS } from "@/lib/civicQueryEngine";

/**
 * The panel used to promise answers about "any of the 83 Michigan counties",
 * which oversold a nine-topic county-metric lookup: anything outside those nine
 * falls through to `general` and returns population/poverty/unemployment. These
 * tests pin the scope declaration that replaced that promise.
 */
describe("CivicAskPanel - declared scope", () => {
  it("lists every answerable topic as a chip", () => {
    render(<CivicAskPanel />);
    expect(ANSWERABLE_TOPICS).toHaveLength(9);
    for (const [, label] of ANSWERABLE_TOPICS) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("seeds the input when a topic chip is picked, without answering", async () => {
    const user = userEvent.setup();
    render(<CivicAskPanel />);

    await user.click(screen.getByRole("button", { name: "Mental health" }));

    const input = screen.getByLabelText(
      "Civic intelligence question",
    ) as HTMLInputElement;
    expect(input.value).toBe("Mental health in ");

    // A topic alone cannot be answered - an answer needs a county, so nothing
    // should have been resolved yet.
    expect(document.querySelectorAll("[data-civic-data-point]")).toHaveLength(
      0,
    );
  });

  it("does not claim to answer questions beyond the nine topics", () => {
    render(<CivicAskPanel />);
    expect(
      screen.getByText(/fall back to general county statistics/i),
    ).toBeInTheDocument();
  });
});
