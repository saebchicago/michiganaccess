import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ProvenanceTag, type ProvenanceLabel } from "@/components/shared/ProvenanceTag";

function renderTag(label: ProvenanceLabel, source?: string, vintage?: string) {
  return render(
    <MemoryRouter>
      <ProvenanceTag label={label} source={source} vintage={vintage} />
    </MemoryRouter>,
  );
}

describe("ProvenanceTag", () => {
  it.each<ProvenanceLabel>(["VERIFIED", "MODELED", "PROJECTED", "PENDING"])(
    "renders the %s label as an accessible, source-labeled button",
    (label) => {
      renderTag(label, "HRSA HPSA", "Jun 2026");

      const button = screen.getByRole("button", { name: new RegExp(`provenance: ${label}`, "i") });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(label);
    },
  );

  it("shows the source and a link to the source ledger when the popover opens", async () => {
    const user = userEvent.setup();
    renderTag("PENDING", "HRSA HPSA", "Jun 2026");

    await user.click(screen.getByRole("button", { name: /provenance: pending/i }));

    expect(screen.getByText(/ingestion in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/hrsa hpsa - jun 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view source ledger/i })).toHaveAttribute(
      "href",
      "/data-sources",
    );
  });
});
