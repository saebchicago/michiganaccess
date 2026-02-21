import { ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CrisisBar from "@/components/shared/CrisisBar";
import ContextBar from "@/components/shared/ContextBar";
import AIChatWidget from "@/components/shared/AIChatWidget";
import PrintButton from "@/components/shared/PrintButton";
import PageFeedback from "@/components/shared/PageFeedback";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import ScrollToTop from "@/components/shared/ScrollToTop";
import SkipToContent from "@/components/shared/SkipToContent";
import RouteAnnouncer from "@/components/shared/RouteAnnouncer";

interface LayoutProps {
  children: ReactNode;
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
        className="flex-1 pb-14 lg:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        role="main"
      >
        {children}
      </motion.main>
    </ErrorBoundary>
    <PageFeedback />
    <Footer />
    <PrintButton />
    <PWAInstallBanner />
    <ScrollToTop />
    <MobileBottomNav />
    <AIChatWidget />
  </div>
);

export default Layout;
