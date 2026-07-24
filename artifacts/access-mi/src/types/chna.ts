import type { ProvenanceLabel } from "@/components/shared/ProvenanceTag";

/** Alias of ProvenanceLabel - single source of truth for the platform's
 *  VERIFIED / MODELED / PROJECTED / PENDING trust-chip states. */
export type IntegrityLabel = ProvenanceLabel;

export type DataMode = "live" | "fallback";

export type CHNADomain = "workforce" | "air" | "water" | "access";

export type CHNAPriorityScope = "enterprise" | "hospital-specific";

export type CHNAGeography = "state" | "county" | "city" | "tract";

export interface CHNAPriority {
  id: string;
  label: string;
  scope: CHNAPriorityScope;
  hospitals?: string[];
}

export interface CHNADriver {
  id: string;
  domain: CHNADomain;
  label: string;
  evidenceLevel: "named" | "measured";
}

export interface CHNAMetric {
  id: string;
  priorityId: string;
  driverId: string;
  label: string;
  value: number | string;
  unit: string;
  geography: CHNAGeography;
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
  note?: string;
}

export type PriorityDriverMap = Record<string, CHNADomain[]>;

export interface CHNADataResult<T> {
  data: T;
  dataMode: DataMode;
}

export interface CHNASystem {
  id: string;
  label: string;
  vintage: string;
  counties: string[];
  cities?: string[];
}
