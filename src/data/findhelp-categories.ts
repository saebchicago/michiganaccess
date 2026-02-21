import {
  Stethoscope, Building2, SmilePlus, Brain, Pill,
  Utensils, Home, Zap, Bus,
  Shield, DollarSign, Scale,
  Medal, UserRound, Baby, Accessibility, Globe, HeartHandshake, RotateCcw,
  type LucideIcon,
} from "lucide-react";

export interface HelpCategory {
  value: string;
  label: string;
  icon: LucideIcon;
  mode: "npi" | "static";
  /** NPI taxonomy descriptions to query (for mode=npi) */
  taxonomies?: string[];
  /** Whether to show the specialty sub-picker */
  showSpecialtyPicker?: boolean;
  /** NPI enumeration type override (default NPI-1) */
  enumerationType?: "NPI-1" | "NPI-2";
}

export interface HelpCategoryGroup {
  label: string;
  items: HelpCategory[];
}

export const HELP_CATEGORY_GROUPS: HelpCategoryGroup[] = [
  {
    label: "Healthcare",
    items: [
      { value: "doctor", label: "Find a Doctor or Specialist", icon: Stethoscope, mode: "npi", showSpecialtyPicker: true, taxonomies: ["Internal Medicine"], enumerationType: "NPI-1" },
      { value: "fqhc", label: "Find a Community Health Center (free/low-cost)", icon: Building2, mode: "npi", taxonomies: ["Federally Qualified Health Center"], enumerationType: "NPI-2" },
      { value: "dentist", label: "Find a Dentist", icon: SmilePlus, mode: "npi", taxonomies: ["Dentist"], enumerationType: "NPI-1" },
      { value: "mental-health", label: "Find Mental Health Support", icon: Brain, mode: "npi", taxonomies: ["Psychiatry", "Psychology", "Clinical Social Worker"], enumerationType: "NPI-1" },
      { value: "substance-use", label: "Find Substance Use / Addiction Treatment", icon: Pill, mode: "npi", taxonomies: ["Substance Abuse Counselor", "Addiction Medicine"], enumerationType: "NPI-1" },
    ],
  },
  {
    label: "Basic Needs",
    items: [
      { value: "food", label: "Food Assistance", icon: Utensils, mode: "static" },
      { value: "housing", label: "Housing & Shelter", icon: Home, mode: "static" },
      { value: "utility", label: "Utility / Energy Assistance", icon: Zap, mode: "static" },
      { value: "transportation", label: "Transportation Help", icon: Bus, mode: "static" },
    ],
  },
  {
    label: "Financial & Legal",
    items: [
      { value: "insurance", label: "Health Insurance Help", icon: Shield, mode: "static" },
      { value: "financial", label: "Financial Assistance & Benefits", icon: DollarSign, mode: "static" },
      { value: "legal", label: "Legal Aid", icon: Scale, mode: "static" },
    ],
  },
  {
    label: "Specific Populations",
    items: [
      { value: "veterans", label: "Veterans Services", icon: Medal, mode: "static" },
      { value: "seniors", label: "Services for Seniors", icon: UserRound, mode: "static" },
      { value: "children", label: "Services for Children & Families", icon: Baby, mode: "static" },
      { value: "disability", label: "Disability Services", icon: Accessibility, mode: "static" },
      { value: "immigrant", label: "Immigrant & Refugee Services", icon: Globe, mode: "static" },
      { value: "dv", label: "Domestic Violence Support", icon: HeartHandshake, mode: "static" },
      { value: "reentry", label: "Re-entry Services", icon: RotateCcw, mode: "static" },
    ],
  },
];

export const ALL_CATEGORIES = HELP_CATEGORY_GROUPS.flatMap((g) => g.items);

export function findCategory(value: string): HelpCategory | undefined {
  return ALL_CATEGORIES.find((c) => c.value === value);
}
