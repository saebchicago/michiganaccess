/**
 * Jupyter notebook generator for cohort + EJ pathway analysis (UC8 Phase 2).
 * Produces a self-contained .ipynb with embedded cohort CSV and pathway registry.
 */

import { CAUSAL_PATHWAYS } from "@/data/causalPathways";
import { buildTableauCohortCsv } from "@/utils/exportCohortTableau";
import type { CohortCriteria, ZipCohortProfile } from "@/utils/cohortFilter";

export interface CohortNotebookInput {
  name?: string;
  criteria: CohortCriteria;
  results: ZipCohortProfile[];
  includePathways?: boolean;
}

interface NotebookCell {
  cell_type: "markdown" | "code";
  metadata: Record<string, unknown>;
  source: string[];
  outputs?: unknown[];
  execution_count?: number | null;
}

interface JupyterNotebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: {
    kernelspec: { display_name: string; language: string; name: string };
    language_info: { name: string; version: string };
    accessmi: { export_type: string; generated_at: string };
  };
  cells: NotebookCell[];
}

function toSource(lines: string[]): string[] {
  return lines.map((l) => (l.endsWith("\n") ? l : `${l}\n`));
}

function md(lines: string[]): NotebookCell {
  return {
    cell_type: "markdown",
    metadata: {},
    source: toSource(lines),
  };
}

function code(lines: string[]): NotebookCell {
  return {
    cell_type: "code",
    metadata: {},
    source: toSource(lines),
    outputs: [],
    execution_count: null,
  };
}

function criteriaSummary(criteria: CohortCriteria): string {
  const parts: string[] = [];
  if (criteria.counties?.length) parts.push(`- Counties: ${criteria.counties.join(", ")}`);
  if (criteria.minEjIndex != null) parts.push(`- Min EJ index: ${criteria.minEjIndex}`);
  if (criteria.minPm25Percentile != null)
    parts.push(`- Min PM2.5 percentile: ${criteria.minPm25Percentile}`);
  if (criteria.minEnergyBurdenPct != null)
    parts.push(`- Min energy burden %: ${criteria.minEnergyBurdenPct}`);
  if (criteria.minUninsuredRate != null)
    parts.push(`- Min uninsured rate %: ${criteria.minUninsuredRate}`);
  if (criteria.minPcpRatio != null) parts.push(`- Min PCP ratio: ${criteria.minPcpRatio}`);
  if (criteria.minPovertyRate != null)
    parts.push(`- Min poverty rate %: ${criteria.minPovertyRate}`);
  return parts.length ? parts.join("\n") : "- No numeric filters (empty cohort)";
}

export function buildCohortAnalysisNotebook(input: CohortNotebookInput): string {
  const exportedAt = new Date().toISOString();
  const name = input.name?.trim() || "AccessMI Cohort";
  const includePathways = input.includePathways !== false;
  const cohortCsv = buildTableauCohortCsv({
    name,
    criteria: input.criteria,
    results: input.results,
    exportedAt,
  });

  const cells: NotebookCell[] = [
    md([
      `# ${name}`,
      "",
      "Exported from [Access Michigan](https://accessmi.org/cohort-builder).",
      "",
      "**Independence notice:** AccessMI is an independent civic data platform.",
      "",
      "## Filter criteria",
      criteriaSummary(input.criteria),
      "",
      `**ZIP count:** ${input.results.length}`,
      "",
      "Integrity labels: VERIFIED = primary source; MODELED = county-allocated or missing ZIP coverage.",
    ]),
    code([
      "import io",
      "import json",
      "import pandas as pd",
      "",
      `COHORT_CSV = json.loads(${JSON.stringify(cohortCsv)})`,
      "",
      "def load_accessmi_cohort(csv_text: str) -> pd.DataFrame:",
      "    lines = [ln for ln in csv_text.splitlines() if ln and not ln.startswith('#')]",
      "    return pd.read_csv(io.StringIO('\\n'.join(lines)))",
      "",
      "df = load_accessmi_cohort(COHORT_CSV)",
      "df.head()",
    ]),
    code([
      "# Numeric summaries (measures only)",
      "measure_cols = [",
      "    'ej_index', 'pm25_percentile', 'energy_burden_pct',",
      "    'uninsured_rate', 'pcp_ratio', 'poverty_rate',",
      "]",
      "summary = df[measure_cols].apply(pd.to_numeric, errors='coerce').describe()",
      "summary",
    ]),
    code([
      "# County rollup",
      "county = (",
      "    df.groupby('county', as_index=False)",
      "    .agg(zip_count=('zip', 'count'), avg_ej_index=('ej_index', 'mean'))",
      "    .sort_values('zip_count', ascending=False)",
      ")",
      "county.head(10)",
    ]),
  ];

  if (includePathways) {
    const pathwayJson = JSON.stringify(
      CAUSAL_PATHWAYS.map((p) => ({
        id: p.id,
        title: p.title,
        confidenceScore: p.confidenceScore,
        languageStandard: p.languageStandard,
        steps: p.steps.map((s) => ({
          label: s.label,
          integrityLabel: s.integrityLabel,
          sources: s.sources.map((src) => src.name),
        })),
      })),
      null,
      2,
    );

    cells.push(
      md([
        "## Environmental justice pathways",
        "",
        "Editorial pathway registry from AccessMI `/environment/justice`.",
        "Use for narrative context - not independent statistical inference.",
      ]),
      code([
        `PATHWAYS = json.loads(${JSON.stringify(pathwayJson)})`,
        "",
        "pd.DataFrame([",
        "    {",
        "        'pathway': p['title'],",
        "        'confidence': p['confidenceScore'],",
        "        'language': p['languageStandard'],",
        "        'steps': len(p['steps']),",
        "    }",
        "    for p in PATHWAYS",
        "])",
      ]),
    );
  }

  cells.push(
    md([
      "## Provenance",
      "",
      "- Methodology: https://accessmi.org/methodology",
      "- Data sources: https://accessmi.org/data-sources",
      `- Generated: ${exportedAt}`,
    ]),
  );

  const notebook: JupyterNotebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: { name: "python", version: "3.11.0" },
      accessmi: {
        export_type: "cohort-analysis-v1",
        generated_at: exportedAt,
      },
    },
    cells,
  };

  return JSON.stringify(notebook, null, 2);
}

export function downloadCohortNotebook(input: CohortNotebookInput): void {
  const json = buildCohortAnalysisNotebook(input);
  const blob = new Blob([json], { type: "application/x-ipynb+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessmi-cohort-analysis-${Date.now()}.ipynb`;
  a.click();
  URL.revokeObjectURL(url);
}