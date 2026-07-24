import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NeedCapacityCard } from "@/components/shared/NeedCapacityCard";
import { getHpsaForCountyName } from "@/data/hrsa-hpsa-county";

function renderCard(county?: string | null) {
  return render(
    <MemoryRouter>
      <NeedCapacityCard county={county} />
    </MemoryRouter>,
  );
}

describe("NeedCapacityCard", () => {
  it("shows a statewide rollup with all three disciplines when no county is given", () => {
    renderCard(null);

    expect(screen.getByText("Care Capacity vs. Need")).toBeInTheDocument();
    expect(screen.getByText("Michigan statewide")).toBeInTheDocument();
    expect(screen.getByText("Primary Care")).toBeInTheDocument();
    expect(screen.getByText("Dental Health")).toBeInTheDocument();
    expect(screen.getByText("Mental Health")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /source: hrsa hpsa/i })).toBeInTheDocument();
  });

  it("scopes to a county when one is given and matches its real HPSA record", () => {
    renderCard("Alcona");

    expect(screen.getByText("Alcona County")).toBeInTheDocument();
    const record = getHpsaForCountyName("Alcona");
    const pc = record?.disciplines.primaryCare;
    expect(pc).toBeTruthy();
    expect(
      screen.getByText(
        new RegExp(`${pc!.providerFte.toFixed(1)} FTE in place, ${pc!.shortageFte.toFixed(1)} FTE still needed`),
      ),
    ).toBeInTheDocument();
  });

  it("shows an explicit no-data message for an unknown county name, not a silent statewide fallback", () => {
    renderCard("Not A Real County");

    expect(screen.getByText("Not A Real County County")).toBeInTheDocument();
    expect(screen.getByText(/no hpsa data on file for this county/i)).toBeInTheDocument();
    expect(screen.queryByText("Primary Care")).not.toBeInTheDocument();
  });
});
