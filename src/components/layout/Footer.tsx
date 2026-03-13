import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Phone, Lock, CheckCircle2, MapPin, Database, Activity, FileText, Shield, Building2, HandHeart, Landmark, Sparkles, Timer, RotateCcw, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReportIssue from "@/components/shared/ReportIssue";
import { useFooterStats, DATA_SOURCES, formatLoadTime, loadTimeColor } from "@/hooks/useFooterStats";
import { replayTour } from "@/components/shared/OnboardingTour";
import { useIsMobile } from "@/hooks/use-mobile";
// toast import removed — no longer needed

function FooterSection({ title, links, collapsible }: { title: string; links: { label: string; href: string }[]; collapsible?: boolean }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!collapsible || !isMobile);
  const shouldCollapse = collapsible && isMobile;

  return (
    <nav aria-label={title}>
      {shouldCollapse ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between mb-3"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      )}
      {(!shouldCollapse || open) && (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link to={link.href} className="text-sm text-foreground/70 transition-colors hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

const Footer = () => {
  const { t } = useTranslation();
  const stats = useFooterStats();

  const footerSections = [
    {
      title: t("nav.findHelp"),
      links: [
        { label: t("nav.findCare"), href: "/find-care" },
        { label: t("nav.financialHelp"), href: "/financial-help" },
        { label: t("nav.communityResources"), href: "/resources" },
        { label: t("nav.transportation"), href: "/transportation" },
        { label: t("nav.healthMap"), href: "/health-map" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: t("nav.healthConditions"), href: "/conditions" },
        { label: "Insurance Appeals", href: "/health/insurance-appeals" },
        { label: t("nav.environment"), href: "/environment" },
        { label: t("nav.civicData"), href: "/civic-data" },
        { label: t("nav.qualityRatings"), href: "/quality" },
        { label: t("nav.costTransparency"), href: "/costs" },
        { label: t("nav.healthData"), href: "/data" },
      ],
    },
    {
      title: t("nav.about"),
      links: [
        { label: t("nav.about"),           href: "/about" },
        { label: t("nav.contact"),          href: "/contact" },
        { label: t("footer.methodology"),   href: "/methodology" },
        { label: t("footer.impact"),        href: "/impact" },
        { label: "Privacy Policy",          href: "/privacy" },
        { label: "Terms of Use",            href: "/terms" },
        { label: "Accessibility",           href: "/accessibility" },
        { label: "Site Map",                href: "/sitemap" },
      ],
    },
    {
      title: "For Organizations",
      links: [
        { label: "Health System Leaders", href: "/partners" },
        { label: "Community Organizations", href: "/partnerships" },
        { label: "Government & Policy", href: "/impact" },
        { label: "For Health Systems", href: "/for-health-systems" },
        { label: "Case Studies", href: "/case-studies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30" role="contentinfo">
      {/* Crisis strip */}
      <div className="border-b border-border bg-muted/50">
        <div className="container flex flex-wrap items-center justify-center gap-3 py-2.5 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {t("crisis.inCrisis")} <a href="tel:988" className="font-semibold text-foreground hover:underline">988</a>
            {" · "}
            {t("crisis.textHome")}
            {" · "}
            <a href="tel:211" className="font-semibold text-foreground hover:underline">2-1-1</a>
          </span>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-michigan">
                <Heart className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-foreground">Access Michigan</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.brandDescription")}
            </p>
          </div>

          {/* Link sections — collapsible on mobile for Services & About */}
          {footerSections.map((section) => (
            <FooterSection key={section.title} title={section.title} links={section.links} collapsible={section.title === "Services" || section.title.includes("About")} />
          ))}
        </div>

        {/* System Status */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-michigan-forest animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              System Status — All Services Operational
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { icon: MapPin, value: `${stats.countyCount}/${stats.countyCount}`, label: "Counties", colorClass: "text-foreground" },
              { icon: Shield, value: "✓", label: "Verified", colorClass: "text-foreground" },
              { icon: Database, value: String(stats.dataFeeds), label: "Data Feeds", colorClass: "text-foreground" },
              {
                icon: Timer,
                value: stats.loadMs !== null ? `~${formatLoadTime(stats.loadMs)}` : "…",
                label: "Load Time",
                colorClass: loadTimeColor(stats.loadMs),
              },
              { icon: FileText, value: stats.resourceCount, label: "Resources", colorClass: "text-foreground" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1.5">
                <m.icon className="h-3 w-3 text-primary" aria-hidden="true" />
                <span className={`text-xs font-bold ${m.colorClass}`}>{m.value}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
                <CheckCircle2 className="h-2.5 w-2.5 text-michigan-forest" aria-hidden="true" />
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Data refreshed March 2026
          </p>
        </div>

        {/* Data Sources */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Public Data Sources
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {(
              [
                { label: "MDHHS", icon: Building2 },
                { label: "Michigan 2-1-1", icon: Phone },
                { label: "CMS (Medicare)", icon: Shield },
                { label: "HRSA", icon: HandHeart },
                { label: "CDC", icon: Activity },
                { label: "EPA AirNow", icon: Landmark },
                { label: "Leapfrog (Safety)", icon: CheckCircle2 },
              ] satisfies { label: (typeof DATA_SOURCES)[number]; icon: React.ElementType }[]
            ).map((src) => (
              <div key={src.label} className="flex items-center gap-1.5">
                <src.icon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{src.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            <Link to="/methodology" className="hover:underline text-primary">View full data sources & methodology →</Link>
          </p>
        </div>

        {/* Public Beta Badge */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="mx-auto max-w-xl rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
               <span className="font-semibold">Access Michigan</span> — founded as a citizen initiative by Michigan residents, continuously improving with community feedback.
             </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Have a suggestion? <Link to="/contact" className="font-medium text-primary hover:underline">We'd love to hear from you.</Link>
            </p>
          </div>
        </div>

        {/* Report Issue + Replay Tour */}
        <div className="mt-4 border-t border-border pt-4 flex flex-col items-center gap-3">
          <ReportIssue variant="footer" />
          <button
            type="button"
            onClick={replayTour}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Replay welcome tour
          </button>
        </div>

        {/* Trust statement */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-3 w-3 text-michigan-forest" />
            <Link to="/methodology#trust-log" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              How we keep this honest →
            </Link>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mb-3">
            Access Michigan organizes verified public datasets and clearly labels modeled estimates.{" "}
            <Link to="/methodology" className="text-primary hover:underline">Learn more →</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mb-3">
            Independent civic project using data from MDHHS, Michigan 2-1-1, CMS, and other public sources. Not run by any government agency.
            We organize public data to help residents find services and communities understand their needs.
            For live help, call <a href="tel:211" className="font-semibold text-foreground hover:underline">2-1-1</a>.
          </p>
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{t("footer.privacyStatement")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("footer.dataAttribution")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
