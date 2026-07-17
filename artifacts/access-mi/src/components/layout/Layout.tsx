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
import { AI_CHAT_ENABLED } from "@/config/aiChat";

// Deferred: non-critical widgets that don't affect initial render
const AIChatWidget = lazy(() => import("@/components/shared/AIChatWidget"));
const WeatherAlertBanner = lazy(
  () => import("@/components/alerts/WeatherAlertBanner"),
);
const OfflineAccessBanner = lazy(
  () => import("@/components/shared/OfflineAccessBanner"),
);
const PrintButton = lazy(() => import("@/components/shared/PrintButton"));
const PWAInstallBanner = lazy(
  () => import("@/components/shared/PWAInstallBanner"),
);
const MobileBottomNav = lazy(
  () => import("@/components/shared/MobileBottomNav"),
);
const QuickExitBar = lazy(() => import("@/components/shared/QuickExitBar"));

const OnboardingTour = lazy(() => import("@/components/shared/OnboardingTour"));
const GuidedTour = lazy(() => import("@/components/shared/GuidedTour"));
interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <SkipToContent />
    <CrisisBar />
    <Header />
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
        className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
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
      <PrintButton />
      <PWAInstallBanner />
      <MobileBottomNav />
      {/* AI chat widget: hard-disabled via AI_CHAT_ENABLED regardless of
          the VITE_ENABLE_AI_CHAT env var - see src/config/aiChat.ts. */}
      {AI_CHAT_ENABLED && <AIChatWidget />}
      <QuickExitBar />

      <OnboardingTour />
      <GuidedTour />
    </Suspense>
  </div>
);

export default Layout;
