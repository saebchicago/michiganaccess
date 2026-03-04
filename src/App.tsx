import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { CountyProvider } from "./contexts/CountyContext";
import { APP_ROUTES } from "./config/routes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              {APP_ROUTES.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </CountyProvider>
  </QueryClientProvider>
);

export default App;