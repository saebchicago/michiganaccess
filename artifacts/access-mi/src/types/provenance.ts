export type ProvenanceLevel = 'verified' | 'modeled' | 'projected';

/** The platform's four trust-chip states, rendered identically everywhere
 *  by shared/ProvenanceTag.tsx (and its chna/IntegrityBadge wrapper). Lives
 *  here, not in the component module, so non-UI code (e.g. types/chna.ts)
 *  can depend on the label union without pulling in a UI-layer import. */
export type ProvenanceLabel = "VERIFIED" | "MODELED" | "PROJECTED" | "PENDING";

export interface DataPoint {
  value: string | number;
  level: ProvenanceLevel;
  source: { name: string; url?: string };
  asOf: string;
  note?: string;
}
