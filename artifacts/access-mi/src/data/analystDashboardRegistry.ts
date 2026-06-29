/**
 * Analyst and scenario dashboard registry (UC8/UC9 hub).
 * Single source for command center and Data & Insights cross-links.
 */

import type { LucideIcon } from "lucide-react";
import {
  Filter,
  GitCompare,
  CloudSun,
  Shield,
  Layers,
  TrendingUp,
  MapPin,
  FileText,
  BarChart3,
  FlaskConical,
  Landmark,
  Users,
} from "lucide-react";
import type { IntegrityLabel } from "@/types/chna";

export type AnalystDashboardGroup =
  | "cohort"
  | "environment"
  | "scenario"
  | "investment"
  | "service-area";

export interface AnalystDashboardEntry {
  id: string;
  group: AnalystDashboardGroup;
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
  useCase: string;
  integrityLabel: IntegrityLabel;
  badge?: string;
}

export const ANALYST_DASHBOARD_GROUPS: {
  id: AnalystDashboardGroup;
  label: string;
  description: string;
}[] = [
  {
    id: "cohort",
    label: "Cohort & ZIP intelligence",
    description: "Multi-criteria filters, exports, and verified-claims grounding.",
  },
  {
    id: "environment",
    label: "Environment & climate",
    description: "EJ pathways, climate stress tests, and compound burden views.",
  },
  {
    id: "scenario",
    label: "Scenario planning",
    description: "Side-by-side comparisons, sensitivity checks, and SDOH risk models.",
  },
  {
    id: "investment",
    label: "Investment & impact",
    description: "Federal flows, attribution timelines, and gap scoring.",
  },
  {
    id: "service-area",
    label: "Service area & CHNA",
    description: "Geographic templates, data packs, and planning exports.",
  },
];

export const ANALYST_DASHBOARDS: AnalystDashboardEntry[] = [
  {
    id: "cohort-builder",
    group: "cohort",
    title: "Cohort Builder",
    summary:
      "Filter ZIPs by EJ index, PM2.5, energy burden, uninsured rate, and PCP ratio with integrity labels.",
    href: "/cohort-builder",
    icon: Filter,
    useCase: "UC8",
    integrityLabel: "VERIFIED",
    badge: "Exports",
  },
  {
    id: "ej-pathways",
    group: "environment",
    title: "EJ Pathways",
    summary:
      "Verified exposure-to-outcome pathways with confidence scoring and PDF/Word exports.",
    href: "/environment/justice",
    icon: Shield,
    useCase: "UC1",
    integrityLabel: "VERIFIED",
  },
  {
    id: "climate-vulnerability",
    group: "environment",
    title: "Climate Vulnerability",
    summary:
      "Heat, flood, air quality, and Great Lakes scenarios with resilience ROI calculator.",
    href: "/environment/climate",
    icon: CloudSun,
    useCase: "UC2",
    integrityLabel: "PROJECTED",
    badge: "Phase 2",
  },
  {
    id: "scenario-studio",
    group: "scenario",
    title: "Scenario Studio",
    summary:
      "Compare climate scenarios side by side with severity sensitivity and shareable URLs.",
    href: "/scenario-studio",
    icon: GitCompare,
    useCase: "UC9",
    integrityLabel: "PROJECTED",
  },
  {
    id: "sdoh-risk",
    group: "scenario",
    title: "SDOH Risk Engine",
    summary:
      "Custom-weight county composite index across six SDOH dimensions with CSV export.",
    href: "/sdoh-risk",
    icon: Layers,
    useCase: "UC3",
    integrityLabel: "MODELED",
  },
  {
    id: "investment-impact",
    group: "investment",
    title: "Investment Impact",
    summary:
      "Federal milestone timelines paired with SDOH outcome proxies and attribution notes.",
    href: "/investment-impact",
    icon: TrendingUp,
    useCase: "UC7 + UC10",
    integrityLabel: "PROJECTED",
  },
  {
    id: "public-investment",
    group: "investment",
    title: "Public Investment",
    summary:
      "Federal spending mix, municipal bonds, and fiscal dependency quadrants.",
    href: "/public-investment",
    icon: Landmark,
    useCase: "UC7",
    integrityLabel: "MODELED",
  },
  {
    id: "service-area",
    group: "service-area",
    title: "Service Area Builder",
    summary:
      "Geographic templates, share URLs, CHNA data pack export, and CSV download.",
    href: "/service-area",
    icon: MapPin,
    useCase: "UC4",
    integrityLabel: "VERIFIED",
  },
  {
    id: "chna-explorer",
    group: "service-area",
    title: "CHNA Explorer",
    summary: "Priority mapping, driver analysis, and tract-level CHNA seed views.",
    href: "/chna-explorer",
    icon: FileText,
    useCase: "UC4",
    integrityLabel: "VERIFIED",
  },
  {
    id: "data-explorer",
    group: "cohort",
    title: "Census Data Explorer",
    summary: "Live ACS tables for any Michigan county via Census proxy.",
    href: "/data-explorer",
    icon: BarChart3,
    useCase: "UC8",
    integrityLabel: "VERIFIED",
  },
  {
    id: "decision-science",
    group: "scenario",
    title: "Decision Science",
    summary: "Benefits gap, hospital market, and ALICE survival simulations.",
    href: "/decision-science",
    icon: FlaskConical,
    useCase: "UC9",
    integrityLabel: "MODELED",
  },
  {
    id: "health-equity-atlas",
    group: "environment",
    title: "Health Equity Atlas",
    summary: "Layered county maps including EJ, energy burden, and compound deficit.",
    href: "/health-equity-atlas",
    icon: Users,
    useCase: "UC1 + UC3",
    integrityLabel: "MODELED",
  },
];

export function dashboardsByGroup(
  group: AnalystDashboardGroup,
): AnalystDashboardEntry[] {
  return ANALYST_DASHBOARDS.filter((d) => d.group === group);
}