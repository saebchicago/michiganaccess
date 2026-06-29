import { describe, it, expect } from "vitest";
import { buildCohortAnalysisNotebook } from "@/utils/generateCohortNotebook";
import { filterCohort } from "@/utils/cohortFilter";
import { CAUSAL_PATHWAYS } from "@/data/causalPathways";

describe("generateCohortNotebook", () => {
  it("produces valid Jupyter notebook JSON with cohort and pathways", () => {
    const results = filterCohort({ minEjIndex: 70 });
    const raw = buildCohortAnalysisNotebook({
      name: "Notebook test",
      criteria: { minEjIndex: 70 },
      results,
      includePathways: true,
    });

    const nb = JSON.parse(raw) as {
      nbformat: number;
      cells: { cell_type: string; source: string[] }[];
      metadata: { accessmi: { export_type: string } };
    };

    expect(nb.nbformat).toBe(4);
    expect(nb.metadata.accessmi.export_type).toBe("cohort-analysis-v1");
    expect(nb.cells.length).toBeGreaterThan(4);

    const allSource = nb.cells.map((c) => c.source.join("")).join("\n");
    expect(allSource).toContain("pandas");
    expect(allSource).toContain("Notebook test");
    expect(allSource).toContain(CAUSAL_PATHWAYS[0].title);
    expect(allSource).toContain("load_accessmi_cohort");
  });
});