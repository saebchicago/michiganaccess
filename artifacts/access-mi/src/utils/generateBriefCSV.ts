// CSV companion to generateBriefPDF.ts - same BriefStat input, same
// per-stat provenance (VERIFIED/MODELED/PROJECTED badge + source +
// vintage), so the CSV and PDF for a given county can never drift.
import { buildCsv, triggerDownload } from "@/lib/csv-export";
import type { BriefPDFInput } from "./generateBriefPDF";

/** Pure string-building half of generateBriefCSV, kept separate from
 * the download trigger so it is testable without a DOM/Blob. */
export function buildBriefCsvContent(input: BriefPDFInput): string {
  const meta = [
    `accessmi.org - ${input.countyName} County Brief`,
    `Generated: ${input.retrievedDate}`,
    `Cite as: ${input.citeText}`,
    `Data integrity: VERIFIED = directly measured from a primary source. MODELED = derived from verified inputs. PROJECTED = forward-looking estimate.`,
    `AccessMI is an independent civic data project, not affiliated with the State of Michigan or any government agency.`,
  ];
  const headers = ["label", "value", "integrity_label", "source", "vintage"];
  const rows = input.stats.map((s) => ({
    label: s.label,
    value: s.value,
    integrity_label: s.badge,
    source: s.source,
    vintage: s.vintage,
  }));
  return buildCsv(headers, rows, meta);
}

export function generateBriefCSV(input: BriefPDFInput): void {
  triggerDownload(
    buildBriefCsvContent(input),
    `AccessMI_${input.countyName.replace(/\s+/g, "_")}_County_Brief.csv`,
  );
}
