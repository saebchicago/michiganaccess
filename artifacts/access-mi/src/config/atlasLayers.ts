/**
 * Canonical list of layers shown on /health-equity-atlas.
 *
 * Single source of truth for both the LayerSelector UI and the
 * ATLAS_LAYER_COUNT constant. Visible copy that quotes "8 equity
 * layers" or "10 layers" must derive from `.length` here.
 */

export type AtlasLayer =
  | "compound"
  | "food_desert"
  | "broadband"
  | "infant_mortality"
  | "ej_index"
  | "energy_burden"
  | "uninsured"
  | "poverty"
  | "alice"
  | "pharmacy";

export interface AtlasLayerEntry {
  key: AtlasLayer;
  label: string;
  source: string;
}

export const ATLAS_LAYERS: ReadonlyArray<AtlasLayerEntry> = [
  {
    key: "compound",
    label: "Compound Access Deficit",
    source: "Access Michigan Index",
  },
  { key: "food_desert", label: "Food Desert Tracts", source: "USDA" },
  { key: "broadband", label: "Broadband % Unserved", source: "FCC" },
  { key: "infant_mortality", label: "Infant Mortality Rate", source: "MDHHS" },
  { key: "ej_index", label: "EJ Index (max)", source: "EPA EJScreen" },
  { key: "energy_burden", label: "Energy Burden %", source: "ACEEE/DOE" },
  { key: "uninsured", label: "Uninsured Rate", source: "ACS" },
  { key: "poverty", label: "Poverty Rate", source: "ACS" },
  {
    key: "alice",
    label: "ALICE Rate (Below Threshold)",
    source: "United For ALICE",
  },
  { key: "pharmacy", label: "Pharmacy Access Risk", source: "NCPDP 2024" },
];
