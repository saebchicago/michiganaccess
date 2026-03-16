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
  PrivacyPage: lazy(() => import("@/pages/PrivacyPage")),
  InsuranceComparisonPage: lazy(() => import("@/pages/InsuranceComparisonPage")),
  InsuranceCoveragePage: lazy(() => import("@/pages/InsuranceCoveragePage")),
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
  CivicDataHubPage: lazy(() => import("@/pages/CivicDataHubPage")),
  LibrariesPage: lazy(() => import("@/pages/LibrariesPage")),
  NotaryServicesPage: lazy(() => import("@/pages/NotaryServicesPage")),
  CommunityInfrastructurePage: lazy(() => import("@/pages/CommunityInfrastructurePage")),
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
  CityPlacePage: lazy(() => import("@/pages/CityPlacePage")),
  ZipPlacePage: lazy(() => import("@/pages/ZipPlacePage")),
  DataAndInsightsPage: lazy(() => import("@/pages/DataAndInsightsPage")),
  DataExplorerPage: lazy(() => import("@/pages/DataExplorerPage")),
  ComparePlacesPage: lazy(() => import("@/pages/ComparePlacesPage")),
  DatasetExplorerPage: lazy(() => import("@/pages/DatasetExplorerPage")),
  BriefPage: lazy(() => import("@/pages/BriefPage")),
  CompareZipsPage: lazy(() => import("@/pages/CompareZipsPage")),
  HousingOptionsPage: lazy(() => import("@/pages/HousingOptionsPage")),
  HealthPlansMedicaidPage: lazy(() => import("@/pages/HealthPlansMedicaidPage")),
  UtilitiesRegulatorsPage: lazy(() => import("@/pages/UtilitiesRegulatorsPage")),
  ElectionsPage: lazy(() => import("@/pages/Elections")),
  OfficialsPage: lazy(() => import("@/pages/Officials")),
  ProviderDataPage: lazy(() => import("@/pages/ProviderData")),
  DisabilityAccessPage: lazy(() => import("@/pages/DisabilityAccess")),
  PublicSafetyPage: lazy(() => import("@/pages/PublicSafety")),
  SocialServicesPage: lazy(() => import("@/pages/SocialServices")),
  TransparencyPage: lazy(() => import("@/pages/TransparencyPage")),
  CHNAExplorerPage: lazy(() => import("@/pages/CHNAExplorerPage")),
  DetectionGapPage: lazy(() => import("@/pages/DetectionGapPage")),
  EquityScorecardPage: lazy(() => import("@/pages/EquityScorecardPage")),
  MarketIntelligencePage: lazy(() => import("@/pages/MarketIntelligencePage")),
  QualityComparisonPage: lazy(() => import("@/pages/QualityComparisonPage")),
  EnergyBurdenPage: lazy(() => import("@/pages/EnergyBurdenPage")),
  ImpactDashboardPage: lazy(() => import("@/pages/ImpactDashboardPage")),
  DomainDashboardPage: lazy(() => import("@/pages/DomainDashboard")),
};

// ── Route Table ─────────────────────────────────────────────────────────────
// Order matters: explicit routes MUST come before the /:slug catch-all.

export const APP_ROUTES: RouteEntry[] = [
  { path: "/privacy", component: pages.PrivacyPage, label: "Privacy Policy" },
  { path: "/insurance-comparison", component: pages.InsuranceComparisonPage, label: "Compare Insurance" },
  { path: "/insurance-coverage", component: pages.InsuranceCoveragePage, label: "Insurance & Coverage Guide" },
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
  { path: "/domain-dashboard", component: pages.DomainDashboardPage, label: "Domain Dashboard" },
  { path: "/data-explorer", component: pages.DataExplorerPage, label: "Data Explorer" },
  { path: "/compare", component: pages.ComparePlacesPage, label: "Compare Counties" },
  { path: "/compare-zips", component: pages.CompareZipsPage, label: "Compare ZIP Codes" },
  { path: "/datasets", component: pages.DatasetExplorerPage, label: "Dataset Explorer" },
  { path: "/transportation", component: pages.TransportationPage, label: "Transportation" },
  { path: "/contact", component: pages.ContactPage, label: "Contact" },
  { path: "/environment", component: pages.EnvironmentPage, label: "Environment" },
  { path: "/health", component: pages.DomainDashboardPage, label: "Health Intelligence" },
  { path: "/housing", component: pages.DomainDashboardPage, label: "Housing Intelligence" },
  { path: "/food-security", component: pages.DomainDashboardPage, label: "Food Security Intelligence" },
  { path: "/energy", component: pages.DomainDashboardPage, label: "Energy Intelligence" },
  { path: "/legal-aid", component: pages.DomainDashboardPage, label: "Legal Aid Intelligence" },
  { path: "/benefits", component: pages.DomainDashboardPage, label: "Benefits Intelligence" },
  { path: "/civic-data", component: pages.CivicDataPage, label: "Civic Data" },
  { path: "/civic-data-hub", component: pages.CivicDataHubPage, label: "Civic Data Hub" },
  { path: "/libraries", component: pages.LibrariesPage, label: "Libraries" },
  { path: "/notary-services", component: pages.NotaryServicesPage, label: "Notary Services" },
  { path: "/community-infrastructure", component: pages.CommunityInfrastructurePage, label: "Community Infrastructure" },
  { path: "/partnerships", component: pages.PartnershipPage, label: "Partnerships" },
  { path: "/site-report", component: pages.SiteReportPage, label: "Site Report" },
  { path: "/events", component: pages.CommunityEventsPage, label: "Events" },
  { path: "/about", component: pages.AboutPage, label: "About" },
  { path: "/embed", component: pages.EmbedWidget, label: "Embed" },
  { path: "/methodology", component: pages.MethodologyPage, label: "Methodology" },
  { path: "/research", component: pages.ResearchPage, label: "Research" },
  { path: "/impact", component: pages.ImpactDashboardPage, label: "Platform Impact" },
  { path: "/technical", component: pages.TechnicalPage, label: "Technical" },
  { path: "/accessibility", component: pages.AccessibilityPage, label: "Accessibility" },
  { path: "/install", component: pages.InstallPage, label: "Install" },
  { path: "/health/insurance-appeals", component: pages.InsuranceAppealsPage, label: "Insurance Appeals" },
  { path: "/insurance-appeals", component: pages.InsuranceAppealsPage, label: "Insurance Appeals" },
  { path: "/partners", component: pages.PartnersPage, label: "Partners" },
  { path: "/partnerships/health-systems", component: pages.HealthSystemsPage, label: "Health Systems" },
  { path: "/partnerships/health-systems/one-pager", component: pages.PartnershipOnePager, label: "One-Pager" },
  { path: "/partners/health-systems", component: pages.HealthSystemsPage, label: "Partners: Health Systems" },
  { path: "/partners/health-plans-medicaid", component: pages.HealthPlansMedicaidPage, label: "Partners: Health Plans" },
  { path: "/partners/utilities-regulators", component: pages.UtilitiesRegulatorsPage, label: "Partners: Utilities" },
  { path: "/complex-care", component: pages.ComplexCarePage, label: "Complex Care" },
  { path: "/life-navigator", component: pages.LifeNavigatorPage, label: "Life Navigator" },
  { path: "/place/city/:cityName", component: pages.CityPlacePage, label: "City Place" },
  { path: "/place/zip/:zipcode", component: pages.ZipPlacePage, label: "ZIP Place" },
  { path: "/place/:slug", component: pages.PlacePage, label: "Place" },
  { path: "/county/:slug", component: pages.CountyPage, label: "County" },
  { path: "/regions", component: pages.RegionsPage, label: "Regions" },
  { path: "/regions/compare", component: pages.RegionComparePage, label: "Region Compare" },
  { path: "/region/:regionId", component: pages.RegionPage, label: "Region" },
  { path: "/equity", component: pages.EquityScorecardPage, label: "Health Equity Scorecard" },
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
  { path: "/brief", component: pages.BriefPage, label: "County Brief" },
  { path: "/housing-options", component: pages.HousingOptionsPage, label: "Housing Options" },
  { path: "/elections", component: pages.ElectionsPage, label: "Elections & Civic Access" },
  { path: "/officials", component: pages.OfficialsPage, label: "Your Representatives" },
  { path: "/provider-data", component: pages.ProviderDataPage, label: "Provider Data" },
  { path: "/disability-access", component: pages.DisabilityAccessPage, label: "Disability & Accessibility" },
  { path: "/public-safety", component: pages.PublicSafetyPage, label: "Public Safety & Policing" },
  { path: "/social-services", component: pages.SocialServicesPage, label: "Social Services & Benefits" },
  { path: "/transparency", component: pages.TransparencyPage, label: "Transparency & Public Records" },
  { path: "/chna-explorer", component: pages.CHNAExplorerPage, label: "CHNA Explorer" },
  { path: "/detection-gap", component: pages.DetectionGapPage, label: "Detection Gap" },
  { path: "/market-intelligence", component: pages.MarketIntelligencePage, label: "Market Intelligence" },
  { path: "/quality/compare", component: pages.QualityComparisonPage, label: "Quality Comparison" },
  { path: "/energy-burden", component: pages.EnergyBurdenPage, label: "Energy Burden" },
  // Dynamic catch-all: county shortcut — MUST be last explicit single-segment route
  { path: "/:slug", component: pages.CountyRedirect, label: "County Redirect" },
];

// ── Reserved Slugs (derived from route table) ───────────────────────────────

export const RESERVED_SLUGS: Set<string> = new Set(
  APP_ROUTES
    .map((r) => r.path.split("/")[1]) // first segment after /
    .filter((s) => s && !s.startsWith(":"))
);

// ── Header Navigation Groups ────────────────────────────────────────────────

export const NAV_GROUPS: (NavGroup | NavLink)[] = [
  {
    label: "Find Help",
    children: [
      { label: "Find Help", href: "/find-care" },
      { label: "Housing Options", href: "/housing-options", badge: "New" },
      { label: "Insurance & Coverage", href: "/insurance-coverage" },
      { label: "Community Resources", href: "/resources", i18nKey: "nav.communityResources" },
      { label: "Financial Help", href: "/financial-help", i18nKey: "nav.financialHelp" },
      { label: "Energy & Utilities", href: "/environment" },
      { label: "Transportation", href: "/transportation", i18nKey: "nav.transportation" },
      { label: "Community Alerts", href: "/#community-alerts" },
      { label: "Health Map", href: "/health-map", i18nKey: "nav.healthMap" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals" },
    ],
  },
  {
    label: "Data & Insights",
    children: [
      { label: "Data & Insights Hub", href: "/data-and-insights" },
      { label: "Domain Dashboard", href: "/domain-dashboard", badge: "New" },
      { label: "Data Explorer", href: "/data-explorer", badge: "Census API" },
      { label: "CHNA Explorer", href: "/chna-explorer", badge: "Interactive" },
      { label: "Compare Counties", href: "/compare", badge: "New" },
      { label: "Dataset Explorer", href: "/datasets" },
      { label: "Civic Data Hub", href: "/civic-data-hub" },
      { label: "Health Data Dashboard", href: "/data" },
      { label: "Health Equity", href: "/equity", badge: "Updated" },
      { label: "Energy Burden", href: "/energy-burden" },
    ],
  },
  { label: "Methodology", href: "/methodology" },
  {
    label: "About & Support",
    i18nKey: "nav.about",
    children: [
      { label: "About Access Michigan", href: "/about" },
      { label: "Support This Project", href: "/about#support" },
      { label: "Executive Summary", href: "/executive-summary" },
      { label: "For Health Systems", href: "/for-health-systems" },
      { label: "Impact Dashboard", href: "/impact" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Civic Access",
    children: [
      { label: "Elections & Civic Access", href: "/elections" },
      { label: "Your Representatives", href: "/officials" },
      { label: "Transparency & Records", href: "/transparency" },
      { label: "Public Safety", href: "/public-safety" },
    ],
  },
  {
    label: "Benefits & Services",
    children: [
      { label: "Social Services & Benefits", href: "/social-services" },
    ],
  },
];

// ── Sitemap Sections ────────────────────────────────────────────────────────

export const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: "Get the Help You Need",
    iconName: "Heart",
    links: [
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
      { label: "Quality Comparison", href: "/quality/compare", badge: "Interactive" },
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
      { label: "CHNA Explorer", href: "/chna-explorer", badge: "Interactive" },
      { label: "Health Data Dashboard", href: "/data" },
      { label: "Civic Data Hub", href: "/civic-data" },
      { label: "Equity Scorecard", href: "/equity", badge: "Updated" },
      { label: "Energy Burden", href: "/energy-burden" },
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
      { label: "Detection Gap", href: "/detection-gap", badge: "New" },
      { label: "Market Intelligence", href: "/market-intelligence", badge: "New" },
      { label: "Health System Integration", href: "/partnerships/health-systems" },
      { label: "One-Pager", href: "/partnerships/health-systems/one-pager" },
      { label: "Executive Summary", href: "/executive-summary" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Lean Healthcare", href: "/lean-healthcare" },
      { label: "Platform Impact", href: "/impact" },
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
