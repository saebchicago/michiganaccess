import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { SAIPE_COUNTY_RECORDS, SAIPE_PROVENANCE } from "@/data/saipe-county";
import EconomicVitalityDashboard from "./EconomicVitalityDashboard";

it("exports published SAIPE bounds and blank housing cells when Census serves HTML", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html></html>", {
    headers: { "Content-Type": "text/html" },
  })));
  const createObjectURL = vi.fn((_blob: Blob) => "blob:county-test");
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = createObjectURL;
    static revokeObjectURL = vi.fn();
  });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const client = new QueryClient();
  try {
    render(<QueryClientProvider client={client}><EconomicVitalityDashboard /></QueryClientProvider>);
    await screen.findByText(/The live ACS request was unavailable/);
    expect(screen.getByText(/Showing 25 of 83 available counties/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "CSV" }));
    const blob = createObjectURL.mock.lastCall?.[0] as unknown as Blob;
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    const rows = text.split("\r\n").slice(1);
    expect(rows).toHaveLength(SAIPE_COUNTY_RECORDS.length);
    const record = SAIPE_COUNTY_RECORDS.find((r) => r.countyName === "Wayne")!;
    const row = rows.find((r) => r.startsWith('"Wayne",'))!;
    expect(row).toContain([record.countyFips, record.values.medianHouseholdIncome, ...record.confidence.medianHouseholdIncome]
      .map((v) => `"${v}"`).join(","));
    expect(row).toContain(`"","","","SAIPE ${SAIPE_PROVENANCE.estimate_year}","MODELED"`);
    expect(row).toContain(SAIPE_PROVENANCE.download_url);
  } finally {
    click.mockRestore();
    vi.unstubAllGlobals();
    client.clear();
  }
});
