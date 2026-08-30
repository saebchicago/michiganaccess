import { ReactNode, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CrisisBar from "@/components/shared/CrisisBar";
import ContextBar from "@/components/shared/ContextBar";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ScrollToTop from "@/components/shared/ScrollToTop";
import SkipToContent from "@/components/shared/SkipToContent";
import RouteAnnouncer from "@/components/shared/RouteAnnouncer";
import PublicTrustBar from "@/components/shared/PublicTrustBar";
import OnboardingTour from "@/components/shared/OnboardingTour";
import { AI_CHAT_ENABLED } from "@/config/aiChat";

// Deferred: non-critical widgets that don't affect initial render.
const AIChatWidget = lazy(() => import("@/components/shared/AIChatWidget"));
const WeatherAlertBanner = lazy(
  () => import("@/components/alerts/WeatherAlertBanner"),
);
const OfflineAccessBanner = lazy(
  () => import("@/components/shared/OfflineAccessBanner"),
);
const PWAInstallBanner = lazy(
  () => import("@/components/shared/PWAInstallBanner"),
);
const MobileBottomNav = lazy(
  () => import("@/components/shared/MobileBottomNav"),
);
const QuickExitBar = lazy(() => import("@/components/shared/QuickExitBar"));

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <SkipToContent />
    {/* Unified sticky chrome: two bars only - the crisis/safety line and the
        main header. Individual sticky positioning was removed from CrisisBar
        and Header so they stack as one sticky unit instead of overlapping at
        top-0. QuickExitBar remains a separate always-available affordance. */}
    <div className="sticky top-0 z-header">
      <CrisisBar />
      <Header />
    </div>
    <Suspense fallback={null}>
      <WeatherAlertBanner />
    </Suspense>
    <Suspense fallback={null}>
      <OfflineAccessBanner />
    </Suspense>
    <ContextBar />
    <RouteAnnouncer />
    <ErrorBoundary>
      <motion.main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 focus:outline-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        role="main"
      >
        {children}
      </motion.main>
    </ErrorBoundary>
    <PublicTrustBar />
    <Footer />
    <ScrollToTop />
    <Suspense fallback={null}>
      <PWAInstallBanner />
      <MobileBottomNav />
      {AI_CHAT_ENABLED && <AIChatWidget />}
      <QuickExitBar />
    </Suspense>
    {/* Footer already imports replayTour from this module, so a dynamic import
        here could never split OnboardingTour into its own chunk. Keep one clear
        static dependency instead of paying the warning/indirection cost. */}
    <OnboardingTour />
  </div>
);

export default Layout;
