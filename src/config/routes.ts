import { lazy, type ComponentType, type LazyExoticComponent } from "react";

// ── Route Definition Types ──────────────────────────────────────────────────

export interface RouteEntry {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  label: string;
  /** If true, this route is eagerly loaded (not lazy). */
  eager?: boolean;
}

export interface NavGroup {
  label: string;
  /** i18n key for the group label */
  i18nKey?: string;
  children: NavLink[];
}

export interface NavLink {
  label: string;
  href: string;
  /** i18n key */
  i18nKey?: string;
  /** Badge text (e.g. "AI-Powered", "New") */
  badge?: string;
}

export interface SitemapSection {
  title: string;
  iconName: string;
  links: NavLink[];
}

// ── Lazy Page Imports ───────────────────────────────────────────────────────

const pages = {
  HealthMapPage: lazy(() => import("@/pages/HealthMapPage")),
  AboutPage: lazy(() => import("@/pages/AboutPage")),
  FindCarePage: lazy(() => import("@/pages/FindCarePage")),
  FinancialHelpPage: lazy(() => import("@/pages/FinancialHelpPage")),
  QualityRatingsPage: lazy(() => import("@/pages/QualityRatingsPage")),
  CommunityResourcesPage: lazy(() => import("@/pages/CommunityResourcesPage")),
  HealthConditionsPage: lazy(() => import("@/pages/HealthConditionsPage")),
  SiteReportPage: lazy(() => import("@/pages/SiteReportPage")),
  HealthNewsPage: lazy(() => import("@/pages/HealthNewsPage")),
  CostTransparencyPage: lazy(() => import("@/pages/CostTransparencyPage")),
  PreventionWellnessPage: lazy(() => import("@/pages/PreventionWellnessPage")),
  ClinicalTrialsPage: lazy(() => import("@/pages/ClinicalTrialsPage")),
  SupportGroupsPage: lazy(() => import("@/pages/SupportGroupsPage")),
  HealthDataDashboardPage: lazy(() => import("@/pages/HealthDataDashboardPage")),
  LearnPage: lazy(() => import("@/pages/LearnPage")),
  TransportationPage: lazy(() => import("@/pages/TransportationPage")),
  ContactPage: lazy(() => import("@/pages/ContactPage")),
  EnvironmentPage: lazy(() => import("@/pages/EnvironmentPage")),
  CivicDataPage: lazy(() => import("@/pages/CivicDataPage")),
  PartnershipPage: lazy(() => import("@/pages/PartnershipPage")),
  CommunityEventsPage: lazy(() => import("@/pages/CommunityEventsPage")),
  EmbedWidget: lazy(() => import("@/pages/EmbedWidget")),
  MethodologyPage: lazy(() => import("@/pages/MethodologyPage")),
  ResearchPage: lazy(() => import("@/pages/ResearchPage")),
  ImpactPage: lazy(() => import("@/pages/ImpactPage")),
  TechnicalPage: lazy(() => import("@/pages/TechnicalPage")),
  AccessibilityPage: lazy(() => import("@/pages/AccessibilityPage")),
  InstallPage: lazy(() => import("@/pages/InstallPage")),
  InsuranceAppealsPage: lazy(() => import("@/pages/InsuranceAppealsPage")),
  PartnersPage: lazy(() => import("@/pages/PartnersPage")),
  HealthSystemsPage: lazy(() => import("@/pages/HealthSystemsPage")),
  PartnershipOnePager: lazy(() => import("@/pages/PartnershipOnePager")),
  CountyPage: lazy(() => import("@/pages/CountyPage")),
  ComplexCarePage: lazy(() => import("@/pages/ComplexCarePage")),
  LifeNavigatorPage: lazy(() => import("@/pages/LifeNavigatorPage")),
  RegionsPage: lazy(() => import("@/pages/RegionsPage")),
  RegionPage: lazy(() => import("@/pages/RegionPage")),
  RegionComparePage: lazy(() => import("@/pages/RegionComparePage")),
  EquityPage: lazy(() => import("@/pages/EquityPage")),
  LeanHealthcarePage: lazy(() => import("@/pages/LeanHealthcarePage")),
  ForHealthSystemsPage: lazy(() => import("@/pages/ForHealthSystemsPage")),
  ExecutiveSummaryPage: lazy(() => import("@/pages/ExecutiveSummaryPage")),
  CaseStudiesPage: lazy(() => import("@/pages/CaseStudiesPage")),
  ChangelogPage: lazy(() => import("@/pages/ChangelogPage")),
  PressPage: lazy(() => import("@/pages/PressPage")),
  SitemapPage: lazy(() => import("@/pages/SitemapPage")),
  SupportPage: lazy(() => import("@/pages/SupportPage")),
  CountyRedirect: lazy(() => import("@/pages/CountyRedirect")),
  DataValidationPage: lazy(() => import("@/pages/DataValidationPage")),
  OutagesPage: lazy(() => import("@/pages/OutagesPage")),
  SearchTrendsPage: lazy(() => import("@/pages/SearchTrendsPage")),
  TermsPage: lazy(() => import("@/pages/TermsPage")),
  ZoningPage: lazy(() => import("@/pages/ZoningPage")),
  PlacePage: lazy(() => import("@/pages/PlacePage")),
  DataAndInsightsPage: lazy(() => import("@/pages/DataAndInsightsPage")),
};

// ── Route Table ─────────────────────────────────────────────────────────────
// Order matters: explicit routes MUST come before the /:slug catch-all.

export const APP_ROUTES: RouteEntry[] = [
  { path: "/find-care", component: pages.FindCarePage, label: "Find Care" },
  { path: "/health-map", component: pages.HealthMapPage, label: "Health Map" },
  { path: "/financial-help", component: pages.FinancialHelpPage, label: "Financial Help" },
  { path: "/quality", component: pages.QualityRatingsPage, label: "Quality Ratings" },
  { path: "/conditions", component: pages.HealthConditionsPage, label: "Health Conditions" },
  { path: "/resources", component: pages.CommunityResourcesPage, label: "Community Resources" },
  { path: "/news", component: pages.HealthNewsPage, label: "Health News" },
  { path: "/costs", component: pages.CostTransparencyPage, label: "Cost Transparency" },
  { path: "/wellness", component: pages.PreventionWellnessPage, label: "Prevention & Wellness" },
  { path: "/clinical-trials", component: pages.ClinicalTrialsPage, label: "Clinical Trials" },
  { path: "/support-groups", component: pages.SupportGroupsPage, label: "Support Groups" },
  { path: "/learn", component: pages.LearnPage, label: "Learn" },
  { path: "/data", component: pages.HealthDataDashboardPage, label: "Health Data" },
  { path: "/data-and-insights", component: pages.DataAndInsightsPage, label: "Data & Insights" },
  { path: "/transportation", component: pages.TransportationPage, label: "Transportation" },
  { path: "/contact", component: pages.ContactPage, label: "Contact" },
  { path: "/environment", component: pages.EnvironmentPage, label: "Environment" },
  { path: "/civic-data", component: pages.CivicDataPage, label: "Civic Data" },
  { path: "/partnerships", component: pages.PartnershipPage, label: "Partnerships" },
  { path: "/site-report", component: pages.SiteReportPage, label: "Site Report" },
  { path: "/events", component: pages.CommunityEventsPage, label: "Events" },
  { path: "/about", component: pages.AboutPage, label: "About" },
  { path: "/embed", component: pages.EmbedWidget, label: "Embed" },
  { path: "/methodology", component: pages.MethodologyPage, label: "Methodology" },
  { path: "/research", component: pages.ResearchPage, label: "Research" },
  { path: "/impact", component: pages.ImpactPage, label: "Impact" },
  { path: "/technical", component: pages.TechnicalPage, label: "Technical" },
  { path: "/accessibility", component: pages.AccessibilityPage, label: "Accessibility" },
  { path: "/install", component: pages.InstallPage, label: "Install" },
  { path: "/health/insurance-appeals", component: pages.InsuranceAppealsPage, label: "Insurance Appeals" },
  { path: "/insurance-appeals", component: pages.InsuranceAppealsPage, label: "Insurance Appeals" },
  { path: "/partners", component: pages.PartnersPage, label: "Partners" },
  { path: "/partnerships/health-systems", component: pages.HealthSystemsPage, label: "Health Systems" },
  { path: "/partnerships/health-systems/one-pager", component: pages.PartnershipOnePager, label: "One-Pager" },
  { path: "/complex-care", component: pages.ComplexCarePage, label: "Complex Care" },
  { path: "/life-navigator", component: pages.LifeNavigatorPage, label: "Life Navigator" },
  { path: "/place/:slug", component: pages.PlacePage, label: "Place" },
  { path: "/county/:slug", component: pages.CountyPage, label: "County" },
  { path: "/regions", component: pages.RegionsPage, label: "Regions" },
  { path: "/regions/compare", component: pages.RegionComparePage, label: "Region Compare" },
  { path: "/region/:regionId", component: pages.RegionPage, label: "Region" },
  { path: "/equity", component: pages.EquityPage, label: "Equity" },
  { path: "/lean-healthcare", component: pages.LeanHealthcarePage, label: "Lean Healthcare" },
  { path: "/for-health-systems", component: pages.ForHealthSystemsPage, label: "For Health Systems" },
  { path: "/executive-summary", component: pages.ExecutiveSummaryPage, label: "Executive Summary" },
  { path: "/case-studies", component: pages.CaseStudiesPage, label: "Case Studies" },
  { path: "/changelog", component: pages.ChangelogPage, label: "Changelog" },
  { path: "/press", component: pages.PressPage, label: "Press" },
  { path: "/sitemap", component: pages.SitemapPage, label: "Sitemap" },
  { path: "/support", component: pages.SupportPage, label: "Support" },
  { path: "/data-validation", component: pages.DataValidationPage, label: "Data Validation" },
  { path: "/outages", component: pages.OutagesPage, label: "Outages" },
  { path: "/admin/search-trends", component: pages.SearchTrendsPage, label: "Search Trends" },
  { path: "/terms", component: pages.TermsPage, label: "Terms of Use" },
  { path: "/zoning", component: pages.ZoningPage, label: "Zoning & Land Use" },
  // Dynamic catch-all: county shortcut — MUST be last explicit single-segment route
  { path: "/:slug", component: pages.CountyRedirect, label: "County Redirect" },
];

// ── Reserved Slugs (derived from route table) ───────────────────────────────
// Auto-generated from APP_ROUTES so CountyRedirect stays in sync.

export const RESERVED_SLUGS: Set<string> = new Set(
  APP_ROUTES
    .map((r) => r.path.split("/")[1]) // first segment after /
    .filter((s) => s && !s.startsWith(":"))
);

// ── Header Navigation Groups ────────────────────────────────────────────────

export const NAV_GROUPS: (NavGroup | NavLink)[] = [
  {
    label: "Find Help",
    i18nKey: "nav.findHelp",
    children: [
      { label: "Find Help", href: "/find-care" },
      { label: "Community Resources", href: "/resources", i18nKey: "nav.communityResources" },
      { label: "Financial Help", href: "/financial-help", i18nKey: "nav.financialHelp" },
      { label: "Transportation", href: "/transportation", i18nKey: "nav.transportation" },
      { label: "Health Map", href: "/health-map", i18nKey: "nav.healthMap" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Energy & Utilities", href: "/environment" },
      { label: "Utility Outages", href: "/outages" },
      { label: "Health Conditions", href: "/conditions", i18nKey: "nav.healthConditions" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals" },
      { label: "Civic Data & FOIA", href: "/civic-data" },
      { label: "Quality Ratings", href: "/quality", i18nKey: "nav.qualityRatings" },
      { label: "Cost Transparency", href: "/costs", i18nKey: "nav.costTransparency" },
      { label: "Prevention & Wellness", href: "/wellness", i18nKey: "nav.prevention" },
      { label: "Life Navigator", href: "/life-navigator" },
      { label: "Zoning & Land Use", href: "/zoning" },
      { label: "Regions", href: "/regions" },
    ],
  },
  {
    label: "Data & Insights",
    children: [
      { label: "Data & Insights Hub", href: "/data-and-insights", badge: "New" },
      { label: "Health Data Dashboard", href: "/data", i18nKey: "nav.healthData" },
      { label: "Health Equity", href: "/equity" },
      { label: "Data Sources & Methods", href: "/data-validation" },
      { label: "Regional Comparison", href: "/regions/compare" },
    ],
  },
  {
    label: "About",
    i18nKey: "nav.about",
    children: [
      { label: "About Access Michigan", href: "/about" },
      { label: "Executive Summary", href: "/executive-summary" },
      { label: "For Health Systems", href: "/for-health-systems" },
      { label: "Impact Dashboard", href: "/impact" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

// ── Sitemap Sections ────────────────────────────────────────────────────────

export const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: "Get the Help You Need",
    iconName: "Heart",
    links: [
      { label: "Find a Doctor or Facility", href: "/find-care" },
      { label: "Get Financial Help", href: "/financial-help" },
      { label: "Community Resources", href: "/resources" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals", badge: "AI-Powered" },
      { label: "Complex Care Navigation", href: "/complex-care" },
      { label: "Life Navigator Assessment", href: "/life-navigator" },
      { label: "Support Groups", href: "/support" },
    ],
  },
  {
    title: "Explore Services",
    iconName: "Globe",
    links: [
      { label: "Health Conditions Pathways", href: "/conditions" },
      { label: "Clinical Trials", href: "/clinical-trials" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Cost Transparency", href: "/costs" },
      { label: "Prevention & Wellness", href: "/wellness" },
      { label: "Health News", href: "/news" },
    ],
  },
  {
    title: "Maps & Data",
    iconName: "Map",
    links: [
      { label: "Interactive Health Map", href: "/health-map" },
      { label: "Health Data Dashboard", href: "/data" },
      { label: "Civic Data Hub", href: "/civic-data" },
      { label: "Equity & Social Vulnerability", href: "/equity" },
      { label: "Environment & Air Quality", href: "/environment" },
    ],
  },
  {
    title: "Regions & Counties",
    iconName: "MapPin",
    links: [
      { label: "All Regions", href: "/regions" },
      { label: "Regional Comparison", href: "/regions/compare", badge: "Dashboard" },
      { label: "County Pages (83)", href: "/county/wayne" },
    ],
  },
  {
    title: "Transportation & Community",
    iconName: "Bus",
    links: [
      { label: "Transportation & Safety", href: "/transportation" },
      { label: "Community Events", href: "/events" },
    ],
  },
  {
    title: "For Partners & Health Systems",
    iconName: "Briefcase",
    links: [
      { label: "Partnership Overview", href: "/partnerships" },
      { label: "For Health Systems", href: "/for-health-systems" },
      { label: "Health System Integration", href: "/partnerships/health-systems" },
      { label: "One-Pager", href: "/partnerships/health-systems/one-pager" },
      { label: "Executive Summary", href: "/executive-summary" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Lean Healthcare", href: "/lean-healthcare" },
      { label: "Partner Impact", href: "/impact" },
    ],
  },
  {
    title: "About & Resources",
    iconName: "BookOpen",
    links: [
      { label: "About Access Michigan", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Data Sources & Validation", href: "/data-validation", badge: "New" },
      { label: "Methodology", href: "/methodology" },
      { label: "Research", href: "/research" },
      { label: "Technical Documentation", href: "/technical" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "What's New (Changelog)", href: "/changelog" },
      { label: "Install the App", href: "/install" },
      { label: "Press & Media Kit", href: "/press" },
      { label: "Site Map", href: "/sitemap" },
    ],
  },
];

// Helper: check if a NavGroup or NavLink is a group
export function isNavGroup(item: NavGroup | NavLink): item is NavGroup {
  return "children" in item;
}
