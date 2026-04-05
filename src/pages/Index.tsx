import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, DollarSign, X, Sparkles, ArrowRight, Heart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
const FrontDoorTriage = lazy(() => import("@/components/home/FrontDoorTriage"));
const DetectionGapFunnel = lazy(() => import("@/components/shared/DetectionGapFunnel"));

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
import MichiganPulse from "@/components/home/MichiganPulse";
import CapabilityStrip from "@/components/home/CapabilityStrip";
import LiveDemoPreview from "@/components/home/LiveDemoPreview";
import QuickCompare from "@/components/home/QuickCompare";
const LifeEventNavigator = lazy(() => import("@/components/tools/LifeEventNavigator"));
const DataStoriesSection = lazy(() => import("@/components/stories/DataStoriesSection"));
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessChat } from "@/components/AccessChat";
import SectionErrorBoundary from "@/components/shared/SectionErrorBoundary";
import LazySection from "@/components/shared/LazySection";
import DataProvenance from "@/components/shared/DataProvenance";
import YourCommunity from "@/components/home/YourCommunity";
const InsightOfWeek = lazy(() => import("@/components/home/InsightOfWeek"));
const NewsletterSignup = lazy(() => import("@/components/home/NewsletterSignup"));
const TransparencyPanel = lazy(() => import("@/components/home/TransparencyPanel"));

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

function WhatsNewBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("whats-new-v9-dismissed") === "1"; } catch { return false; }
  });
  if (dismissed) return null;
  const dismiss = () => {
    try { sessionStorage.setItem("whats-new-v9-dismissed", "1"); } catch { /* ignore */ }
    setDismissed(true);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-primary/20 bg-primary/5"
    >
      <div className="container max-w-5xl flex items-center justify-between gap-3 py-2.5 px-4">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-foreground font-medium truncate">
            <span className="font-bold">NEW:</span> ZIP Code Health Scorecards &middot; Service Area Builder &middot; Impact Stories &middot; HUD Housing Data
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/zip-intelligence"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Explore <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className="rounded p-1 hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [triageOpen, setTriageOpen] = useState(false);

  usePageMeta({
    title: "Access Michigan: Health, Housing, Energy & Services | Open Data",
    description:
      "Independent civic resource organizing health, housing, energy, transportation, and legal services across all 83 Michigan counties. Free, no tracking, open data.",
    path: "/",
  });

  return (
    <Layout>
      {/* ═══ FRONT DOOR TRIAGE ═══ */}
      <AnimatePresence>
        {triageOpen && (
          <Suspense fallback={null}>
            <FrontDoorTriage onClose={() => setTriageOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* ═══ ALERTS ═══ */}
      <OutageAlertBanner />
      <CountyWelcomeBanner />

      {/* ═══ HERO — mission + search ═══ */}
      <HeroSection />

      {/* ═══ GET HELP NOW — front door triage trigger ═══ */}
      <section className="container -mt-6 mb-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mx-auto max-w-md">
          <button onClick={() => setTriageOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-michigan-teal text-white py-3.5 px-6 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <Heart className="h-4.5 w-4.5" fill="currentColor" />
            Get Help Now — Find Resources in Your County
          </button>
        </motion.div>
      </section>

      {/* ═══ LIFE EVENT NAVIGATOR — primary engagement hook (shown early for discoverability) ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <LifeEventNavigator />
        </Suspense>
      </SectionErrorBoundary>

      {/* ═══ WHAT'S NEW BANNER ═══ */}
      <WhatsNewBanner />

      {/* ═══ CAPABILITY STRIP ═══ */}
      <CapabilityStrip />

      {/* ═══ ROLE-BASED JOURNEYS ═══ */}
      <section className="container py-10">
        <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-xl font-bold text-foreground text-center mb-6">
          Where do you want to start?
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "\u{1F464}", label: "I'm a Michigan Resident", desc: "Health resources, water safety, who represents you", href: "/zip/48201", color: "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40", cta: "Check My ZIP" },
            { icon: "\u{1F3E5}", label: "I Work in Healthcare", desc: "Market intelligence, SDOH gaps, CHNA export", href: "/detection-gap", color: "bg-primary/5 border-primary/20", cta: "Explore Service Area" },
            { icon: "\u{1F4CB}", label: "I'm a Policymaker", desc: "Federal investment, fiscal risk, civic participation", href: "/public-investment", color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40", cta: "Public Investment" },
            { icon: "\u{1F52C}", label: "I'm a Researcher", desc: "Full data export, methodology, transparency layer", href: "/downloads", color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40", cta: "Access Data" },
          ].map((role, i) => (
            <motion.div key={role.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={role.href} className="block group">
                <div className={`rounded-xl border p-5 h-full transition-all hover:shadow-md ${role.color}`}>
                  <span className="text-2xl">{role.icon}</span>
                  <h3 className="text-sm font-bold text-foreground mt-2 group-hover:text-primary transition-colors">{role.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{role.desc}</p>
                  <span className="text-xs text-primary font-medium inline-flex items-center gap-1 group-hover:underline">{role.cta} <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ DETECTION GAP — compact funnel ═══ */}
      <section className="container py-10">
        <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-xl" />}>
          <DetectionGapFunnel variant="compact" />
        </Suspense>
      </section>

      {/* ═══ YOUR COMMUNITY — moved to hero ZIP search above ═══ */}

      {/* ═══ MICHIGAN PULSE — live intelligence signals ═══ */}
      <MichiganPulse />

      {/* ═══ LIVE DEMO PREVIEW ═══ */}
      <LiveDemoPreview />

      {/* ═══ INSIGHT OF THE WEEK ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <Suspense fallback={<SectionSkeleton height="160px" />}>
          <InsightOfWeek />
        </Suspense>
      </SectionErrorBoundary>

      {/* ═══ DATA STORIES ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <DataStoriesSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* ═══ TAX TEASER ═══ */}
      <section className="py-4 border-b border-border/30">
        <div className="container max-w-5xl">
          <Link to="/tax-comparison" className="flex items-center gap-3 rounded-xl border border-michigan-gold/20 bg-michigan-gold/5 px-4 py-3 hover:bg-michigan-gold/10 transition-colors group">
            <DollarSign className="h-5 w-5 text-michigan-gold shrink-0" />
            <p className="text-sm text-foreground">
              Living in <strong>Troy vs Detroit</strong> on an $80K salary? You'd keep roughly <strong className="text-michigan-forest">$2,523 more</strong> per year based on current Michigan tax schedules.{" "}
              <span className="text-primary font-medium group-hover:underline">See full calculator &rarr;</span>
            </p>
          </Link>
        </div>
      </section>

      {/* ═══ RESEARCH & COMPARE ═══ */}
      <section className="py-8 bg-muted/20 border-y border-border/40">
        <div className="container max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-bold text-foreground mb-2">For research & policy</h2>
              <p className="text-sm text-muted-foreground mb-4">Compare counties, export briefs, explore the equity atlas.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <Link to="/health-equity-atlas"><Button size="sm" className="gap-1.5"><Database className="h-3.5 w-3.5" /> Equity Atlas</Button></Link>
                <Link to="/compare"><Button size="sm" variant="outline">Compare Counties</Button></Link>
                <Link to="/data-sources"><Button size="sm" variant="outline">40+ Data Sources</Button></Link>
              </div>
            </div>
            <QuickCompare />
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER SIGNUP ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <Suspense fallback={<SectionSkeleton height="120px" />}>
          <NewsletterSignup />
        </Suspense>
      </SectionErrorBoundary>

      {/* ═══ TRANSPARENCY PANEL ═══ */}
      <SectionErrorBoundary title="Some content didn't load">
        <Suspense fallback={<SectionSkeleton height="140px" />}>
          <TransparencyPanel />
        </Suspense>
      </SectionErrorBoundary>

      {/* ═══ PROVENANCE ═══ */}
      <div className="container py-4">
        <DataProvenance
          source="Public datasets (State of Michigan + federal agencies). Independently organized."
          updated="2026-03-22"
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
