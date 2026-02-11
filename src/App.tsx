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
import {
  Conditions,
  Resources,
  News,
  Costs,
  Wellness,
  ClinicalTrials,
  Support,
  Learn,
  HealthData,
} from "./pages/PlaceholderPages";

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
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/news" element={<News />} />
            <Route path="/costs" element={<Costs />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/clinical-trials" element={<ClinicalTrials />} />
            <Route path="/support" element={<Support />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/data" element={<HealthData />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
