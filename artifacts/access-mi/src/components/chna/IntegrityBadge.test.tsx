import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";

describe("IntegrityBadge", () => {
  it("delegates to ProvenanceTag so VERIFIED/MODELED/PROJECTED/PENDING read identically everywhere", () => {
    render(
      <MemoryRouter>
        <IntegrityBadge label="PENDING" source="HRSA HPSA" vintage="Jun 2026" />
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: /provenance: pending/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("PENDING");
  });
});
