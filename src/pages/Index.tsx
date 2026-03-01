import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";
import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Sparkles, Heart, Users, AlertCircle, ArrowRight, MapPin, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CivicInsightGauge } from "@/components/shared/CivicInsightGauge";

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import GuidedPathways from "@/components/home/GuidedPathways";
import { EquityInsightCard } from "@/components/shared/EquityInsightCard";
import { ProfessionalGateway } from "@/components/home/ProfessionalGateway";
import AuthorityStrip from "@/components/home/AuthorityStrip";
import CountyWelcomeBanner from "@/components/home/CountyWelcomeBanner";
import AudienceSelector from "@/components/home/AudienceSelector";
import DiscoveryWizard from "@/components/home/DiscoveryWizard";
import OutageAlertBanner from "@/components/home/OutageAlertBanner";
import SocialProofStrip from "@/components/home/SocialProofStrip";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { AccessChat } from "@/components/AccessChat";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import LazySection from "@/components/shared/LazySection";
import DataProvenance from "@/components/shared/DataProvenance";

// ── Below-fold: lazy-loaded components ──
const UnderstandMyCommunity = lazy(() => import("@/components/place/UnderstandMyCommunity"));
const WatchlistPanel = lazy(() => import("@/components/shared/WatchlistPanel"));
const BetaImpactCounter = lazy(() => import("@/components/shared/BetaImpactCounter"));
const HealthDataSnapshot = lazy(() => import("@/components/home/HealthDataSnapshot"));
const NearbyResourceFinder = lazy(() => import("@/components/home/NearbyResourceFinder"));
const CoreAccessGrid = lazy(() => import("@/components/home/CoreAccessGrid"));
const TransportationSafetyCallout = lazy(() => import("@/components/home/TransportationSafetyCallout"));
const CommunityAlerts = lazy(() => import("@/components/home/CommunityAlerts"));
const RegionalGateway = lazy(() => import("@/components/home/RegionalGateway"));
const SuccessStories = lazy(() => import("@/components/home/SuccessStories"));
const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));

const SectionFallback = () => (
  <div className="py-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

/** Shared mobile-only accordion toggle button */
function MobileAccordionToggle({
  open,
  openLabel,
  closedLabel,
  onToggle,
}: {
  open: boolean;
  openLabel: string;
  closedLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="md:hidden w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-muted-foreground bg-muted/40 hover:bg-muted/60 border-y border-border/50 transition-colors"
      aria-expanded={open}
    >
      <span>{open ? openLabel : closedLabel}</span>
      {open ? (
        <ChevronUp className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}

const Index = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [wizardOpen, setWizardOpen] = useState(false);

  // Mobile accordions — collapsed on mobile by default, open on desktop
  const [nearbyOpen, setNearbyOpen] = useState(!isMobile);
  const [mapOpen, setMapOpen] = useState(!isMobile);
  const [proOpen, setProOpen] = useState(!isMobile);

  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description:
      "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      {/* ═══ LAYER 1 — IMMEDIATE HELP ═══ */}
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      {/* ═══ LAYER 2 — SEARCH & GUIDED PATHWAYS ═══ */}
      <HeroSection />
      <div className="container py-4">
        <DataProvenance
          source="Public datasets (State of Michigan + local agencies). Independently organized."
          updated="2026-02-23"
          methodologyHref="/about"
        />
      </div>

      <div className="container py-4 flex justify-center">
        <Button onClick={() => setWizardOpen(true)} size="lg" className="gap-2 rounded-full shadow-lg">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> {t("wizard.cta")}
        </Button>
      </div>
      <DiscoveryWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      {/* "Who is this for?" strip — buttons scroll to id-anchored sections below */}
      <AudienceSelector />

      {/* ── anchor: #for-residents → GuidedPathways ── */}
      <div id="for-residents">
        <GuidedPathways />
      </div>
      <AuthorityStrip />

      {/* ═══ UNDERSTAND MY COMMUNITY CTA ═══ */}
      <LazySection minHeight="80px">
        <Suspense fallback={<SectionFallback />}>
          <section className="py-10 container max-w-2xl">
            <UnderstandMyCommunity />
          </section>
        </Suspense>
      </LazySection>

      <LazySection minHeight="60px">
        <Suspense fallback={<SectionFallback />}>
          <WatchlistPanel />
          <BetaImpactCounter />
        </Suspense>
      </LazySection>

      <SocialProofStrip />

      {/* ═══ EXPLORE MICHIGAN — 3-card entry points ═══════════
          Solves: first-time visitors need an immediate, scannable
          answer to "what can I DO here?" before hitting detailed data.
      ═══════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/10" aria-labelledby="explore-heading">
        <div className="container max-w-5xl">
          <div className="mb-7 text-center">
            <h2 id="explore-heading" className="text-xl font-bold text-foreground md:text-2xl">
              Explore &amp; Compare Michigan
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Three tools to understand your community and compare counties side by side.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* ── Card 1: Health Map ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/health-map"
                className="group flex flex-col h-full rounded-xl border border-border/60 bg-white/80 dark:bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 p-5 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Explore Your Region</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Interactive map of Michigan showing health resources, utility outages, and service gaps by county.
                  </p>
                </div>
                <span className="mt-auto text-xs font-semibold text-primary group-hover:underline" aria-hidden="true">
                  Open map →
                </span>
              </Link>
            </motion.div>

            {/* ── Card 2: Compare Counties ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Link
                to="/compare"
                className="group flex flex-col h-full rounded-xl border border-border/60 bg-white/80 dark:bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 p-5 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 rounded-lg bg-michigan-forest/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-michigan-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Compare Counties</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Side-by-side Census data, community voice ratings, and equity scores for up to 4 Michigan counties.
                  </p>
                </div>
                <span className="mt-auto text-xs font-semibold text-michigan-forest group-hover:underline" aria-hidden="true">
                  Start comparing →
                </span>
              </Link>
            </motion.div>

            {/* ── Card 3: Civic Insight Score teaser ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.16 }}
            >
              <Link
                to="/compare"
                className="group flex flex-col h-full rounded-xl border border-border/60 bg-white/80 dark:bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 p-5 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 rounded-lg bg-michigan-gold/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-michigan-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Civic Insight Score</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    A 0–100 composite index of income, poverty, education, and employment — spot opportunity gaps at a glance.
                  </p>
                </div>
                {/* Static gauge preview — no network call */}
                <div className="flex items-center gap-3 mt-1">
                  <CivicInsightGauge score={65} color="#01579B" />
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground block">Wayne County</span>
                    example score
                  </div>
                </div>
                <span className="text-xs font-semibold text-michigan-gold group-hover:underline" aria-hidden="true">
                  See all county scores →
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY HEALTH & EQUITY BAND
          anchor: #community-health-equity
          Groups: equity insight cards + county heatmap + CTA
      ═══════════════════════════════════════════════════════ */}
      <LazySection minHeight="200px">
        <section id="community-health-equity" className="py-14 bg-muted/20">
          <div className="container">

            {/* Band header */}
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                Community Data
              </div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl mb-2">
                Community Health & Equity
              </h2>
              <p className="text-muted-foreground">
                Michigan residents face unequal barriers to health. Understanding these disparities
                helps residents, advocates, and policymakers drive meaningful change.
              </p>
            </div>

            {/* Equity insight cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <EquityInsightCard
                icon={Heart} title="Black Infant Mortality" stat="2.4x higher"
                description="Black infants in Michigan face 2.4 times higher mortality rates than white infants."
                color="coral" trend="up" ctaText="View equity data" ctaHref="/data-and-insights"
              />
              <EquityInsightCard
                icon={Users} title="Rural Uninsured Rate" stat="14%"
                description="Rural Michiganders are twice as likely to be uninsured as urban residents."
                color="gold" trend="stable" ctaText="View equity data" ctaHref="/data-and-insights"
              />
              <EquityInsightCard
                icon={AlertCircle} title="Primary Care Shortage" stat="23 counties"
                description="Nearly a third of Michigan counties lack adequate primary care providers."
                color="teal" trend="down" ctaText="View equity data" ctaHref="/data-and-insights"
              />
            </div>

            {/* County heatmap — collapses on mobile */}
            <MobileAccordionToggle
              open={mapOpen}
              openLabel="Hide county health map"
              closedLabel="Advanced: Explore statewide health map"
              onToggle={() => setMapOpen((v) => !v)}
            />
            {/* On desktop: always visible via open={true | !isMobile} */}
            <Collapsible open={mapOpen || !isMobile} onOpenChange={setMapOpen}>
              <CollapsibleContent>
                <div className="pt-4 pb-2">
                  <Suspense fallback={<SectionFallback />}>
                    <div className="max-w-5xl mx-auto">
                      <CountyChoropleth highlightCounty="Oakland" />
                    </div>
                  </Suspense>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Primary CTA */}
            <div className="mt-8 text-center">
              <Link to="/data-and-insights">
                <Button size="lg" className="gap-2">
                  Open full health & equity dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ═══ LAYER 3 — PERSONALIZED SNAPSHOT ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection>
          <Suspense fallback={<SectionFallback />}>
            <HealthDataSnapshot />

            {/* NearbyResourceFinder — collapses on mobile with explanatory label */}
            <MobileAccordionToggle
              open={nearbyOpen}
              openLabel="Hide address search"
              closedLabel="Use address instead — find services closest to your front door"
              onToggle={() => setNearbyOpen((v) => !v)}
            />
            <Collapsible open={nearbyOpen || !isMobile} onOpenChange={setNearbyOpen}>
              <CollapsibleContent>
                <NearbyResourceFinder />
              </CollapsibleContent>
            </Collapsible>

            <CoreAccessGrid />
            <TransportationSafetyCallout />
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      {/* ═══ LAYER 4 — EXPLORATION (compact) ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <LazySection>
          <Suspense fallback={<SectionFallback />}>
            {/* Browse all resources CTA */}
            <section className="py-10">
              <div className="container text-center">
                <h2 className="text-xl font-bold text-foreground mb-3">Explore Community Resources</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  Browse 700+ verified programs across housing, food, health, transportation, energy, education, legal, and more.
                </p>
                <Link to="/resources">
                  <Button size="lg" className="gap-2">
                    Browse All Programs <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </section>

            <CommunityAlerts />
            <RegionalGateway />
            <SuccessStories />

            {/* ── anchor: #for-organizations → ProfessionalGateway ── */}
            <div id="for-organizations">
              <MobileAccordionToggle
                open={proOpen}
                openLabel="Hide professional tools"
                closedLabel="Advanced: Tools for organizations & health systems"
                onToggle={() => setProOpen((v) => !v)}
              />
              <Collapsible open={proOpen || !isMobile} onOpenChange={setProOpen}>
                <CollapsibleContent>
                  <ProfessionalGateway />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Suspense>
        </LazySection>
      </SectionErrorBoundary>

      <AccessChat />
    </Layout>
  );
};

export default Index;
