import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HealthMapPage from "./pages/HealthMapPage";
import AboutPage from "./pages/AboutPage";
import FindCarePage from "./pages/FindCarePage";
import FinancialHelpPage from "./pages/FinancialHelpPage";
import QualityRatingsPage from "./pages/QualityRatingsPage";
import CommunityResourcesPage from "./pages/CommunityResourcesPage";
import HealthConditionsPage from "./pages/HealthConditionsPage";
import SiteReportPage from "./pages/SiteReportPage";
import HealthNewsPage from "./pages/HealthNewsPage";
import CostTransparencyPage from "./pages/CostTransparencyPage";
import PreventionWellnessPage from "./pages/PreventionWellnessPage";
import ClinicalTrialsPage from "./pages/ClinicalTrialsPage";
import SupportGroupsPage from "./pages/SupportGroupsPage";
import HealthDataDashboardPage from "./pages/HealthDataDashboardPage";
import LearnPage from "./pages/LearnPage";
import TransportationPage from "./pages/TransportationPage";
import ContactPage from "./pages/ContactPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
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
            <Route path="/support" element={<SupportGroupsPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/data" element={<HealthDataDashboardPage />} />
            <Route path="/transportation" element={<TransportationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/site-report" element={<SiteReportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
