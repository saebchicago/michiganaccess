import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, X } from "lucide-react";

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import TrustPanel from "@/components/home/TrustPanel";
import HomePrimaryPaths from "@/components/home/HomePrimaryPaths";
import HomeSectorGrid from "@/components/home/HomeSectorGrid";
import CivicIntelligenceHub from "@/components/home/CivicIntelligenceHub";
import InsightSignalsSection from "@/components/home/InsightSignalsSection";
import ExploreQuestionsPanel from "@/components/home/ExploreQuestionsPanel";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import LocationNudgeBanner from "@/components/home/LocationNudgeBanner";
import { usePageMeta } from "@/hooks/usePageMeta";
import DataPulse from "@/components/home/DataPulse";
import { Button } from "@/components/ui/button";
import { AccessChat } from "@/components/AccessChat";
import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";
import LazySection from "@/components/shared/LazySection";
import DataProvenance from "@/components/shared/DataProvenance";

// ── Below-fold: lazy-loaded ──
const FounderSupportSection = lazy(() => import("@/components/shared/FounderSupportSection"));
const NearbyResourceFinder = lazy(() => import("@/components/home/NearbyResourceFinder"));
const CoreAccessGrid = lazy(() => import("@/components/home/CoreAccessGrid"));
const RegionalGateway = lazy(() => import("@/components/home/RegionalGateway"));
const SystemsExplainer = lazy(() => import("@/components/home/SystemsExplainer"));
const CivicDataCalloutCard = lazy(() => import("@/components/home/CivicDataCalloutCard"));
const MichiganAtAGlance = lazy(() => import("@/components/home/MichiganAtAGlance"));
const CommunityAlerts = lazy(() => import("@/components/home/CommunityAlerts"));
const ImpactStories = lazy(() => import("@/components/shared/ImpactStories"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const SectionSkeleton = ({ height = "200px" }: { height?: string }) => (
  <div className="py-8" style={{ minHeight: height }}>
    <div className="container max-w-4xl space-y-3">
      <div className="h-6 w-48 rounded bg-muted animate-pulse" />
      <div className="h-4 w-72 rounded bg-muted/60 animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 mt-4">
        <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    </div>
  </div>
);

export type PersonaView = "resident" | "professional";

function ExecutiveLandingStrip() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("exec-strip-dismissed") === "1"; } catch { return false; }
  });
  if (dismissed) return null;
  const dismiss = () => {
    try { localStorage.setItem("exec-strip-dismissed", "1"); } catch { /* ignore */ }
    setDismissed(true);
  };
  return (
    <div className="border-t border-border/40 bg-muted/30 py-2 px-4">
      <div className="container max-w-5xl flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          <Link to="/for-health-systems" className="text-primary hover:underline font-medium">For health systems &amp; partners →</Link>
          {" "}BD scenario modeler, market intelligence, and SDOH ROI tools.
        </span>
        <button
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const Index = () => {
  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description:
      "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      {/* ═══ ALERTS ═══ */}
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      {/* ═══ HERO — mission + search ═══ */}
      <HeroSection />

      {/* ═══ DATA PULSE ═══ */}
      <DataPulse />

      {/* ═══ MICHIGAN HEALTH INTELLIGENCE (above fold, intelligence-first) ═══ */}
      <InsightSignalsSection />

      {/* ═══ EXPLORE MICHIGAN HEALTH (question cards) ═══ */}
      <ExploreQuestionsPanel />

      {/* ═══ LOCATION NUDGE (no-ZIP users) ═══ */}
      <LocationNudgeBanner />

      {/* ═══ TRUST PANEL ═══ */}
      <TrustPanel />

      {/* ═══ MICHIGAN AT A GLANCE ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection minHeight="200px">
          <Suspense fallback={<SectionSkeleton height="300px" />}>
            <MichiganAtAGlance />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ IMPACT STORIES ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection minHeight="200px">
          <Suspense fallback={<SectionSkeleton height="300px" />}>
            <ImpactStories />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ 3 PRIMARY PATHS ═══ */}
      <HomePrimaryPaths />

      {/* ═══ 6 SECTOR CARDS ═══ */}
      <HomeSectorGrid />

      {/* ═══ NEARBY RESOURCES ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection minHeight="100px">
          <Suspense fallback={<SectionSkeleton height="120px" />}>
            <NearbyResourceFinder />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ FOR RESEARCH & POLICY ═══ */}
      <section className="py-10 bg-muted/20 border-y border-border/40" aria-labelledby="nerd-heading">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Civic Data Layer
            </div>
            <h2 id="nerd-heading" className="text-2xl font-bold text-foreground">
              For research & policy
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Compare counties, export briefs, download CSVs. No accounts. No tracking.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/data-and-insights">
                <Button size="sm" className="gap-1.5">
                  <Database className="h-3.5 w-3.5" /> Data & Insights
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="sm" variant="outline" className="gap-1.5">
                  Compare Counties
                </Button>
              </Link>
              <Link to="/brief">
                <Button size="sm" variant="outline" className="gap-1.5">
                  Generate Brief
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PROVENANCE ═══ */}
      <div className="container py-4">
        <DataProvenance
          source="Public datasets (State of Michigan + federal agencies). Independently organized."
          updated="2026-03-08"
          methodologyHref="/methodology"
        />
      </div>

      {/* ═══ EXECUTIVE LANDING STRIP ═══ */}
      <ExecutiveLandingStrip />

      <AccessChat />
    </Layout>
  );
};

export default Index;
