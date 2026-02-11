import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {
  FindCare,
  HealthMap,
  FinancialHelp,
  QualityRatings,
  Conditions,
  Resources,
  News,
  Costs,
  Wellness,
  ClinicalTrials,
  Support,
  Learn,
  HealthData,
  About,
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
            <Route path="/find-care" element={<FindCare />} />
            <Route path="/health-map" element={<HealthMap />} />
            <Route path="/financial-help" element={<FinancialHelp />} />
            <Route path="/quality" element={<QualityRatings />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/news" element={<News />} />
            <Route path="/costs" element={<Costs />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/clinical-trials" element={<ClinicalTrials />} />
            <Route path="/support" element={<Support />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/data" element={<HealthData />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
