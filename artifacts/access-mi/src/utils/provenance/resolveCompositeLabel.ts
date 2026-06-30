/**
 * Provenance label propagation.
 *
 * AccessMI's brand promise is that every rendered figure carries an
 * accurate VERIFIED / MODELED / PROJECTED label. The fabrication guard
 * (scripts/check-fabrication.mjs) cannot catch labels computed at render
 * time, so this utility encodes the propagation rules so the renderer can
 * never accidentally upgrade a label.
 *
 * Two rules:
 *
 *   1. Weakest link wins. When N input series contribute to one rendered
 *      element (a point, a benchmark line, a tooltip composite, a derived
 *      stat), the composite carries the weakest input label.
 *      PROJECTED > MODELED > VERIFIED (weakest first; PROJECTED is weakest
 *      because it is forward-looking and least certain).
 *
 *   2. Fitted or aggregated elements are always at minimum MODELED. A
 *      trendline, a correlation coefficient, a benchmark mean, a regional
 *      rollup - any element that is computed rather than read - cannot
 *      claim VERIFIED even if all of its inputs are VERIFIED. The math is
 *      a model.
 *
 * Use:
 *   resolveCompositeLabel(['VERIFIED', 'VERIFIED'])               -> 'VERIFIED'
 *   resolveCompositeLabel(['VERIFIED', 'MODELED'])                -> 'MODELED'
 *   resolveCompositeLabel(['MODELED', 'PROJECTED'])               -> 'PROJECTED'
 *   resolveCompositeLabel(['VERIFIED'], { isFitted: true })       -> 'MODELED'
 *   resolveCompositeLabel(['VERIFIED'], { isAggregated: true })   -> 'MODELED'
 */

export type ProvenanceLabel = "VERIFIED" | "MODELED" | "PROJECTED";

export interface CompositeOptions {
  /** Trendline, correlation r, regression - any fitted statistic. */
  isFitted?: boolean;
  /** Region rollup, state mean, national weighted average - any rollup
   * from a different geography than the rendered one. */
  isAggregated?: boolean;
}

// Weakness order: index 0 is strongest, increasing index is weaker.
const STRENGTH_ORDER: ProvenanceLabel[] = ["VERIFIED", "MODELED", "PROJECTED"];

function strength(label: ProvenanceLabel): number {
  return STRENGTH_ORDER.indexOf(label);
}

/**
 * Compute the composite label for a set of input labels with optional
 * fitted/aggregated escalation. Throws on empty input - call sites must
 * have at least one label.
 */
export function resolveCompositeLabel(
  labels: ProvenanceLabel[],
  options: CompositeOptions = {},
): ProvenanceLabel {
  if (labels.length === 0) {
    throw new Error("resolveCompositeLabel: at least one label required");
  }
  let composite: ProvenanceLabel = labels[0];
  for (const next of labels.slice(1)) {
    if (strength(next) > strength(composite)) {
      composite = next;
    }
  }
  if ((options.isFitted || options.isAggregated) && composite === "VERIFIED") {
    composite = "MODELED";
  }
  return composite;
}

/**
 * Convenience predicate. True when the label is one of the three known
 * values. Useful at trust boundaries (e.g. data loaded from JSON).
 */
export function isProvenanceLabel(value: unknown): value is ProvenanceLabel {
  return (
    typeof value === "string" &&
    (STRENGTH_ORDER as readonly string[]).includes(value)
  );
}
