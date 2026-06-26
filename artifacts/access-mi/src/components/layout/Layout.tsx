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
      {/* AI chat widget is gated by VITE_ENABLE_AI_CHAT, default off. The
          widget streams raw model output without grounding to AccessMI's
          sourced data and has no fetch timeout, so on flaky venue wifi it
          can show a stuck spinner or generate unsourced claims. Set the
          env var to "true" in Netlify / .env.local once the widget is
          hardened. */}
      {import.meta.env.VITE_ENABLE_AI_CHAT === "true" && <AIChatWidget />}
      <QuickExitBar />

      <OnboardingTour />
      <GuidedTour />
    </Suspense>
  </div>
);

export default Layout;
