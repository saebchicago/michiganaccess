/**
 * Review registry for hand-typed editorial claims.
 *
 * Five collections render figures that are typed by hand, not read from a
 * dataset: WEEKLY_INSIGHTS, DATA_STORIES, SIGNALS, the quiz QUESTIONS and the
 * homepage ROTATING_STATS. The 2026-11-22 audit found stale or unsupported
 * figures in the first ones it sampled, so every entry in those collections
 * must now have a review record here. src/data/__tests__/claimReview.test.ts
 * fails when:
 *   - an entry has no record (a new claim shipped without review);
 *   - an entry's text changed since review (fingerprint mismatch);
 *   - a record has no usable evidence for its basis.
 *
 * Basis:
 *   dataset   the figure is asserted against a committed dataset by `test`
 *   manifest  the figure's value appears in SOURCE_MANIFEST (owner-ratified)
 *   reported  a publisher states the figure; `url` is where, `checked` when
 *   law       a statute, rule or enacted budget states it; `url` required
 *
 * A claim that cannot meet one of these is removed from its collection and
 * recorded in docs/claim-ledger.json as INSUFFICIENT_DATA. This file never
 * holds an "unverified" basis.
 */
export type ClaimBasis = "dataset" | "manifest" | "reported" | "law";

export interface ClaimReview {
  basis: ClaimBasis;
  /** One line: what was checked against what. */
  evidence: string;
  /** Required for reported and law. */
  url?: string;
  /** Required for dataset: the test file that asserts the figure. */
  test?: string;
  /** Required for manifest: the SOURCE_MANIFEST value string. */
  manifestValue?: string;
  /** ISO date of the review. */
  checked: string;
  /** Fingerprint of the entry's rendered text at review time. */
  fingerprint: string;
}

/** Stable short hash of the rendered text of a claim (FNV-1a, base 36). */
export function claimFingerprint(parts: readonly (string | number | undefined)[]): string {
  const text = parts.filter((p) => p !== undefined).join("␟");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}
