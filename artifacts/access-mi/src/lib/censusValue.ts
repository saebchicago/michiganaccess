/**
 * Census ACS value parser.
 *
 * The ACS API encodes "no usable number" as negative sentinel values inside
 * numeric columns. Parsed naively (`parseFloat(v) || 0`) they leak into
 * percentages as large negatives, and a missing value collapses into zero.
 * This module keeps four outcomes distinct:
 *   zero           - a real, reported 0 (value: 0, no note)
 *   missing        - null, empty or non-numeric cell (value: null)
 *   suppressed     - Census could not compute the estimate (value: null)
 *   not applicable - the estimate does not apply here (value: null)
 *
 * Estimate sentinels follow the Census ACS API annotation codes. The build
 * scripts (refresh-acs-sdoh-county.mjs) already null every negative value;
 * this is the client-side equivalent that also records the reason.
 *
 * Edge functions deploy separately and carry a small duplicate of this
 * logic. Keep the code-to-reason mapping in sync.
 */

export const ESTIMATE_CODES = [-666666666, -999999999, -888888888] as const;
export const MOE_CODES = [-222222222, -333333333] as const;
/** -555555555 in a MOE column means the estimate is controlled: MOE = 0. */
export const MOE_CONTROLLED_CODE = -555555555;

export type AcsOutcome = "value" | "zero" | "missing" | "suppressed" | "not-applicable";

export interface ParsedAcsEstimate {
  value: number | null;
  /** Which of the distinct outcomes this cell resolved to. */
  outcome: AcsOutcome;
  /** Reason the value is null. Absent when a number was returned. */
  note?: string;
}

const ESTIMATE_REASONS: Record<number, string> = {
  [-666666666]: "Suppressed by Census: too few sample observations to compute an estimate",
  [-999999999]: "Not available from Census for this geography",
  [-888888888]: "Not applicable for this geography",
};

const MOE_REASONS: Record<number, string> = {
  [-222222222]: "Margin of error not computed: too few sample observations",
  [-333333333]: "Margin of error not computed: median falls in an open-ended interval",
};

export const MISSING_REASON = "Missing from Census response";

function toNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (s === "" || s.toLowerCase() === "null") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Parse one ACS estimate cell. Never returns a negative sentinel as a value. */
export function parseAcsEstimate(raw: unknown): ParsedAcsEstimate {
  const n = toNumber(raw);
  if (n === null) return { value: null, outcome: "missing", note: MISSING_REASON };
  if (n === -666666666) return { value: null, outcome: "suppressed", note: ESTIMATE_REASONS[n] };
  if (n === -888888888) return { value: null, outcome: "not-applicable", note: ESTIMATE_REASONS[n] };
  if (n === -999999999) return { value: null, outcome: "missing", note: ESTIMATE_REASONS[n] };
  // Any other negative is an unknown code, never a real estimate.
  if (n < 0) return { value: null, outcome: "missing", note: "Unrecognized negative Census code" };
  return { value: n, outcome: n === 0 ? "zero" : "value" };
}

/** Parse one ACS margin-of-error cell. Null means no usable MOE. */
export function parseAcsMoe(raw: unknown): number | null {
  const n = toNumber(raw);
  if (n === null) return null;
  if (n === MOE_CONTROLLED_CODE) return 0;
  if (n in MOE_REASONS) return null;
  if (n < 0) return null;
  return n;
}

/** Reason text for a MOE sentinel, or undefined when the cell is a number. */
export function acsMoeNote(raw: unknown): string | undefined {
  const n = toNumber(raw);
  if (n === null) return MISSING_REASON;
  return MOE_REASONS[n];
}
