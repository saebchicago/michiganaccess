import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { CountyProvider } from "./contexts/CountyContext";
import { NerdModeProvider } from "./contexts/NerdModeContext";
import { APP_ROUTES } from "./config/routes";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 min default
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="h-16 border-b border-border bg-muted/30" />
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      <div className="h-8 w-2/3 rounded bg-muted animate-pulse" />
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-lg border border-border p-5 space-y-3">
            <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CountyProvider>
      <NerdModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {APP_ROUTES.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ErrorBoundary>
                          <route.component />
                        </ErrorBoundary>
                      }
                    />
                  ))}
                  {/* Semantic aliases — redirect common URL guesses */}
                  <Route path="/health-equity" element={<Navigate to="/equity" replace />} />
                  <Route path="/broadband" element={<Navigate to="/civic-data" replace />} />
                  <Route path="/chna" element={<Navigate to="/chna-explorer" replace />} />
                  <Route path="/map" element={<Navigate to="/health-map" replace />} />
                  <Route path="/check-benefits" element={<Navigate to="/financial-help" replace />} />
                  <Route path="/data-hub" element={<Navigate to="/data-and-insights" replace />} />
                  <Route path="/health-data" element={<Navigate to="/data" replace />} />
                  <Route path="/representatives" element={<Navigate to="/civic-data" replace />} />
                  {/* Duplicate route consolidation */}
                  <Route path="/county-compare" element={<Navigate to="/compare" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </NerdModeProvider>
    </CountyProvider>
  </QueryClientProvider>
);

export default App;