import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NeedCapacityCard } from "@/components/shared/NeedCapacityCard";
import {
  getHpsaForCountyName,
  HRSA_HPSA_COUNTY_RECORDS,
} from "@/data/hrsa-hpsa-county";

/**
 * Michigan resident population, Census PEP Vintage 2024 (about 10.08M),
 * rounded up. Used only as a plausibility ceiling: any population-shaped
 * figure this card renders that exceeds the entire state is by definition
 * wrong, whatever its label says.
 */
const MICHIGAN_POPULATION_CEILING = 10_500_000;

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

    expect(screen.getByText("Designated Provider Shortage Areas")).toBeInTheDocument();
    expect(screen.getByText("Michigan statewide")).toBeInTheDocument();
    expect(screen.getByText("Primary Care")).toBeInTheDocument();
    expect(screen.getByText("Dental Health")).toBeInTheDocument();
    expect(screen.getByText("Mental Health")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /source: hrsa hpsa/i })).toBeInTheDocument();
  });

  it("reports the real designation count and county coverage for a discipline", () => {
    renderCard(null);

    const expectedCount = HRSA_HPSA_COUNTY_RECORDS.reduce(
      (n, c) => n + c.disciplines.primaryCare.designatedHpsas,
      0,
    );
    const expectedCounties = HRSA_HPSA_COUNTY_RECORDS.filter(
      (c) => c.disciplines.primaryCare.designatedHpsas > 0,
    ).length;

    expect(
      screen.getByText(`${expectedCount.toLocaleString()} designated shortage areas`),
    ).toBeInTheDocument();
    // getAllByText, not getByText: two disciplines legitimately share a
    // county count (primary care and mental health both cover 79 of 83),
    // so this string is expected to appear more than once.
    expect(
      screen.getAllByText(
        new RegExp(
          `Across ${expectedCounties} of ${HRSA_HPSA_COUNTY_RECORDS.length} counties`,
        ),
      ).length,
    ).toBeGreaterThan(0);
  });

  it("scopes to a county when one is given and matches its real HPSA record", () => {
    renderCard("Alcona");

    expect(screen.getByText("Alcona County")).toBeInTheDocument();
    const record = getHpsaForCountyName("Alcona");
    const pc = record?.disciplines.primaryCare;
    expect(pc).toBeTruthy();
    expect(
      screen.getAllByText(
        `${pc!.designatedHpsas.toLocaleString()} designated shortage area`,
      ).length,
    ).toBeGreaterThan(0);
  });

  it("shows an explicit no-data message for an unknown county name, not a silent statewide fallback", () => {
    renderCard("Not A Real County");

    expect(screen.getByText("Not A Real County County")).toBeInTheDocument();
    expect(screen.getByText(/no hpsa data on file for this county/i)).toBeInTheDocument();
    expect(screen.queryByText("Primary Care")).not.toBeInTheDocument();
  });

  // Regression guard for docs/audit-2026-07.md D8. The card used to sum
  // overlapping HRSA designation populations and render "24,282,165 residents
  // in an underserved area" statewide - more than twice Michigan's
  // population. No figure this card renders may exceed the whole state.
  it("renders no population-scale figure larger than Michigan itself", () => {
    const { container } = renderCard(null);
    const text = container.textContent ?? "";

    const numbers = Array.from(text.matchAll(/\d[\d,]*/g))
      .map((m) => Number(m[0].replace(/,/g, "")))
      .filter((n) => Number.isFinite(n));

    expect(numbers.length).toBeGreaterThan(0);
    const implausible = numbers.filter((n) => n > MICHIGAN_POPULATION_CEILING);
    expect(implausible).toEqual([]);
  });

  it("does not present summed FTE or underserved-population totals", () => {
    const { container } = renderCard(null);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/FTE/i);
    expect(text).not.toMatch(/residents in an underserved area/i);
    // The overlap caveat must stay visible so the omission is explained.
    expect(text).toMatch(/service\s+areas overlap/i);
  });
});
