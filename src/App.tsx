import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import { CountyProvider } from "./contexts/CountyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load pages for performance
const HealthMapPage = lazy(() => import("./pages/HealthMapPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FindCarePage = lazy(() => import("./pages/FindCarePage"));
const FinancialHelpPage = lazy(() => import("./pages/FinancialHelpPage"));
const QualityRatingsPage = lazy(() => import("./pages/QualityRatingsPage"));
const CommunityResourcesPage = lazy(() => import("./pages/CommunityResourcesPage"));
const HealthConditionsPage = lazy(() => import("./pages/HealthConditionsPage"));
const SiteReportPage = lazy(() => import("./pages/SiteReportPage"));
const HealthNewsPage = lazy(() => import("./pages/HealthNewsPage"));
const CostTransparencyPage = lazy(() => import("./pages/CostTransparencyPage"));
const PreventionWellnessPage = lazy(() => import("./pages/PreventionWellnessPage"));
const ClinicalTrialsPage = lazy(() => import("./pages/ClinicalTrialsPage"));
const SupportGroupsPage = lazy(() => import("./pages/SupportGroupsPage"));
const HealthDataDashboardPage = lazy(() => import("./pages/HealthDataDashboardPage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const TransportationPage = lazy(() => import("./pages/TransportationPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const EnvironmentPage = lazy(() => import("./pages/EnvironmentPage"));
const CivicDataPage = lazy(() => import("./pages/CivicDataPage"));
const PartnershipPage = lazy(() => import("./pages/PartnershipPage"));
const CommunityEventsPage = lazy(() => import("./pages/CommunityEventsPage"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const TechnicalPage = lazy(() => import("./pages/TechnicalPage"));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const InsuranceAppealsPage = lazy(() => import("./pages/InsuranceAppealsPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const HealthSystemsPage = lazy(() => import("./pages/HealthSystemsPage"));
const PartnershipOnePager = lazy(() => import("./pages/PartnershipOnePager"));
const CountyPage = lazy(() => import("./pages/CountyPage"));
const ComplexCarePage = lazy(() => import("./pages/ComplexCarePage"));
const LifeNavigatorPage = lazy(() => import("./pages/LifeNavigatorPage"));
const RegionsPage = lazy(() => import("./pages/RegionsPage"));
const RegionPage = lazy(() => import("./pages/RegionPage"));
const RegionComparePage = lazy(() => import("./pages/RegionComparePage"));
const EquityPage = lazy(() => import("./pages/EquityPage"));
const LeanHealthcarePage = lazy(() => import("./pages/LeanHealthcarePage"));
const ForHealthSystemsPage = lazy(() => import("./pages/ForHealthSystemsPage"));
const ExecutiveSummaryPage = lazy(() => import("./pages/ExecutiveSummaryPage"));
const CaseStudiesPage = lazy(() => import("./pages/CaseStudiesPage"));
const ChangelogPage = lazy(() => import("./pages/ChangelogPage"));
const PressPage = lazy(() => import("./pages/PressPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const CountyRedirect = lazy(() => import("./pages/CountyRedirect"));
const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CountyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/find-care" element={<FindCarePage />} />
              <Route path="/health-map" element={<HealthMapPage />} />
              <Route path="/financial-help" element={<FinancialHelpPage />} />
              <Route path="/quality" element={<QualityRatingsPage />} />
              <Route path="/conditions" element={<HealthConditionsPage />} />
              <Route path="/resources" element={<CommunityResourcesPage />} />
              <Route path="/news" element={<HealthNewsPage />} />
              <Route path="/costs" element={<CostTransparencyPage />} />
              <Route path="/wellness" element={<PreventionWellnessPage />} />
              <Route path="/clinical-trials" element={<ClinicalTrialsPage />} />
              <Route path="/support-groups" element={<SupportGroupsPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/data" element={<HealthDataDashboardPage />} />
              <Route path="/transportation" element={<TransportationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/environment" element={<EnvironmentPage />} />
              <Route path="/civic-data" element={<CivicDataPage />} />
              <Route path="/partnerships" element={<PartnershipPage />} />
              <Route path="/site-report" element={<SiteReportPage />} />
              <Route path="/events" element={<CommunityEventsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/embed" element={<EmbedWidget />} />
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/technical" element={<TechnicalPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/health/insurance-appeals" element={<InsuranceAppealsPage />} />
              <Route path="/insurance-appeals" element={<InsuranceAppealsPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/partnerships/health-systems" element={<HealthSystemsPage />} />
              <Route path="/partnerships/health-systems/one-pager" element={<PartnershipOnePager />} />
              <Route path="/complex-care" element={<ComplexCarePage />} />
              <Route path="/life-navigator" element={<LifeNavigatorPage />} />
              <Route path="/county/:slug" element={<CountyPage />} />
              <Route path="/regions" element={<RegionsPage />} />
              <Route path="/regions/compare" element={<RegionComparePage />} />
              <Route path="/region/:regionId" element={<RegionPage />} />
              <Route path="/equity" element={<EquityPage />} />
              <Route path="/lean-healthcare" element={<LeanHealthcarePage />} />
              <Route path="/for-health-systems" element={<ForHealthSystemsPage />} />
              <Route path="/executive-summary" element={<ExecutiveSummaryPage />} />
              <Route path="/case-studies" element={<CaseStudiesPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/press" element={<PressPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/support" element={<SupportPage />} />
              {/* County shortcut: /wayne → /county/wayne */}
              <Route path="/:slug" element={<CountyRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
    </CountyProvider>
  </QueryClientProvider>
);

export default App;
