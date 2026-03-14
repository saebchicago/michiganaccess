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
const PrintButton = lazy(() => import("@/components/shared/PrintButton"));
const PageFeedback = lazy(() => import("@/components/shared/PageFeedback"));
const PWAInstallBanner = lazy(() => import("@/components/shared/PWAInstallBanner"));
const MobileBottomNav = lazy(() => import("@/components/shared/MobileBottomNav"));
const QuickExitBar = lazy(() => import("@/components/shared/QuickExitBar"));
const FloatingFeedback = lazy(() => import("@/components/shared/FloatingFeedback"));
const OnboardingTour = lazy(() => import("@/components/shared/OnboardingTour"));
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
      <PageFeedback />
      <PrintButton />
      <PWAInstallBanner />
      <MobileBottomNav />
      <AIChatWidget />
      <QuickExitBar />
      <FloatingFeedback />
      <OnboardingTour />
    </Suspense>
  </div>
);

export default Layout;
