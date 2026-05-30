export type ProvenanceLevel = 'verified' | 'modeled' | 'projected';

export interface DataPoint {
  value: string | number;
  level: ProvenanceLevel;
  source: { name: string; url?: string };
  asOf: string;
  note?: string;
}
