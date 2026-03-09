import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Globe2, ArrowRight, Database } from "lucide-react";

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import HomePrimaryPaths from "@/components/home/HomePrimaryPaths";
import HomeSectorGrid from "@/components/home/HomeSectorGrid";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
const PublicTrustBar = lazy(() => import("@/components/shared/PublicTrustBar"));
const CivicDataCalloutCard = lazy(() => import("@/components/home/CivicDataCalloutCard"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export type PersonaView = "resident" | "professional";

const Index = () => {
  const { t } = useTranslation();

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

      {/* ═══ 3 PRIMARY PATHS ═══ */}
      <HomePrimaryPaths />

      {/* ═══ 6 SECTOR CARDS ═══ */}
      <HomeSectorGrid />

      {/* ═══ "WHERE DO YOU WANT TO START?" ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection minHeight="120px">
          <Suspense fallback={<SectionFallback />}>
            <CoreAccessGrid />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ FOR POLICY & DATA NERDS ═══ */}
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
            <h2 id="nerd-heading" className="text-xl font-bold text-foreground sm:text-2xl">
              For policymakers, health systems, and journalists
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Compare counties, export briefs, explore live Census data, and download CSVs — all built on
              verified public sources.
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

      {/* ═══ CIVIC DATA CALLOUT ═══ */}
      <Suspense fallback={<SectionFallback />}>
        <CivicDataCalloutCard />
      </Suspense>

      {/* ═══ WHAT IS ACCESS MICHIGAN? ═══ */}
      <Suspense fallback={<SectionFallback />}>
        <SystemsExplainer />
      </Suspense>

      {/* ═══ NEARBY RESOURCES ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection minHeight="100px">
          <Suspense fallback={<SectionFallback />}>
            <NearbyResourceFinder />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ REGIONAL GATEWAY ═══ */}
      <Suspense fallback={<SectionFallback />}>
        <RegionalGateway />
      </Suspense>

      {/* Trust bar is rendered by Layout — no duplicate needed here */}

      {/* ═══ PROVENANCE ═══ */}
      <div className="container py-4">
        <DataProvenance
          source="Public datasets (State of Michigan + federal agencies). Independently organized."
          updated="2026-03-08"
          methodologyHref="/methodology"
        />
      </div>

      {/* ═══ FOUNDER & SUPPORT ═══ */}
      <Suspense fallback={<SectionFallback />}>
        <FounderSupportSection />
      </Suspense>

      <AccessChat />
    </Layout>
  );
};

export default Index;
