/** Central typed registry for civic open-data sources */

export type CivicSourceProvider = "ArcGIS" | "Socrata";

export type CivicSourceCategory =
  | "health"
  | "environment"
  | "transport"
  | "housing"
  | "safety"
  | "education"
  | "civic";

export type CivicSourceGeography = "state" | "city";

export interface CivicSource {
  id: string;
  name: string;
  provider: CivicSourceProvider;
  endpoint: string;
  geography: CivicSourceGeography;
  category: CivicSourceCategory;
  /** Human-readable description shown in DatasetCard */
  description?: string;
  /** Optional Socrata app token secret name */
  appTokenSecret?: string;
}
