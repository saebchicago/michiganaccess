import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  Phone,
  Lock,
  CheckCircle2,
  MapPin,
  Database,
  Activity,
  FileText,
  Shield,
  Building2,
  HandHeart,
  Landmark,
  Sparkles,
  Timer,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ReportIssue from "@/components/shared/ReportIssue";
import {
  useFooterStats,
  formatLoadTime,
  loadTimeColor,
} from "@/hooks/useFooterStats";
import { replayTour } from "@/components/shared/OnboardingTour";
import { DATA_SOURCE_DISPLAY } from "@/config/platformConstants";

function FooterSection({
  title,
  links,
  collapsible,
}: {
  title: string;
  links: { label: string; href: string }[];
  collapsible?: boolean;
}) {
  // Progressive disclosure on ALL breakpoints: long (collapsible) sections show
  // a capped preview with a "Show all N" toggle, so the comprehensive footer
  // index no longer renders as a ~30-link wall by default. Every link stays
  // reachable via the toggle (and via /sitemap).
  const PREVIEW = 7;
  const [open, setOpen] = useState(false);
  const canCap = collapsible && links.length > PREVIEW;
  const visible = canCap && !open ? links.slice(0, PREVIEW) : links;

  return (
    <nav aria-label={title}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        {visible.map((link) => (
          <li key={link.href + link.label}>
            <Link
              to={link.href}
              className="text-sm text-foreground/70 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {canCap && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-expanded={open}
        >
          {open ? "Show less" : `Show all ${links.length}`}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </nav>
  );
}

const HELP_ROUTES = [
  "/find-care",
  "/financial-help",
  "/resources",
  "/housing",
  "/conditions",
];

const Footer = () => {
  const { t } = useTranslation();
  const stats = useFooterStats();
  const { pathname } = useLocation();
  const isHelpPage = HELP_ROUTES.some((r) => pathname.startsWith(r));

  const footerSections = [
    {
      title: "Understand",
      links: [
        { label: "Data & Insights Hub", href: "/data-and-insights" },
        { label: "ZIP Scorecard", href: "/zip/48201" },
        { label: "ZIP Intelligence", href: "/zip-intelligence" },
        { label: "ZIP Finder", href: "/zip-finder" },
        { label: "Compare Counties", href: "/compare" },
        { label: "Data Explorer", href: "/data-explorer" },
        { label: "CHNA Explorer", href: "/chna-explorer" },
        { label: "Dataset Explorer", href: "/datasets" },
        { label: "Domain Dashboard", href: "/domain-dashboard" },
        { label: "Detection Gap", href: "/detection-gap" },
        { label: "Find Your City", href: "/find-your-city" },
        { label: "Public Investment", href: "/public-investment" },
        { label: "SBA Lending Insights", href: "/sba-insights" },
        { label: "Decision Science", href: "/decision-science" },
        { label: "Service Area Builder", href: "/service-area" },
        { label: "Tax Comparison", href: "/tax-comparison" },
        { label: "Medicaid Coverage at Risk", href: "/data/medicaid-coverage-at-risk" },
        { label: "SNAP Coverage at Risk", href: "/data/snap-coverage-at-risk" },
        { label: "Dual-Eligible Exposure", href: "/data/dual-eligible-exposure" },
        { label: "SNAP in Michigan", href: "/data/snap-michigan" },
        { label: "Methodology", href: "/methodology" },
        { label: `Data Sources (${DATA_SOURCE_DISPLAY})`, href: "/data-sources" },
        { label: "Downloads", href: "/downloads" },
      ],
    },
    {
      title: "Visualize",
      links: [
        { label: "Health Map", href: "/health-map" },
        { label: "Health Data Dashboard", href: "/data" },
        { label: "Health Equity", href: "/equity" },
        { label: "Health Equity Atlas", href: "/health-equity-atlas" },
        { label: "Deep Map (GIS)", href: "/map/layers" },
        { label: "Energy Burden", href: "/energy-burden" },
        { label: "Closure Watch", href: "/closure-watch" },
        { label: "Disaster History", href: "/disaster-history" },
        { label: "Data Centers", href: "/data-centers" },
        { label: "Civic Data", href: "/civic-data" },
        { label: "Civic Data Hub", href: "/civic-data-hub" },
        { label: "Environment", href: "/environment" },
        { label: "Water Safety & PFAS", href: "/environment/water" },
        { label: "Air Quality", href: "/environment/air" },
        { label: "Energy Burden (Environment)", href: "/environment/energy" },
        { label: "Disaster Risk", href: "/environment/disaster" },
      ],
    },
    {
      title: "Belong",
      links: [
        { label: "Find Help", href: "/find-care" },
        { label: "Community Resources", href: "/resources" },
        { label: "Financial Help", href: "/financial-help" },
        { label: "Housing Options", href: "/housing-options" },
        { label: "Insurance & Coverage", href: "/insurance-coverage" },
        { label: "Transportation", href: "/transportation" },
        { label: "Health Conditions", href: "/conditions" },
        { label: "Insurance Appeals", href: "/health/insurance-appeals" },
        { label: "Quality Ratings", href: "/quality" },
        { label: "Cost Transparency", href: "/costs" },
        { label: "Behavioral Health", href: "/behavioral-health" },
        { label: "Michigan Tribal Nations", href: "/tribal-nations" },
        { label: "Reentry Resources", href: "/reentry" },
        { label: "Social Services & Benefits", href: "/social-services" },
        { label: "Learn About Benefits", href: "/benefits" },
        { label: "Public Safety", href: "/public-safety" },
        { label: "Community Alerts", href: "/environment" },
        { label: "Civic Power Map", href: "/civic-power" },
        { label: "Where to Serve", href: "/civic-power/boards" },
        { label: "Races That Need Candidates", href: "/civic-power/races" },
        { label: "Federal Presence", href: "/civic-power/federal" },
        { label: "Elections & Civic Access", href: "/elections" },
        { label: "Your Representatives", href: "/officials" },
        { label: "Transparency Hub", href: "/transparency" },
        { label: "Federal Contractors", href: "/transparency/contractors" },
        { label: "Follow the Money", href: "/transparency/money" },
        { label: "All Parties", href: "/transparency/parties" },
        { label: "Public Records & FOIA", href: "/transparency/records" },
        { label: "FOIA Request Builder", href: "/foia" },
      ],
    },
    {
      title: "About & Legal",
      links: [
        { label: "About Access Michigan", href: "/about" },
        { label: "Support This Project", href: "/about#support" },
        { label: "Our Story", href: "/story" },
        { label: "Impact", href: "/impact" },
        { label: "Contact", href: "/contact" },
        { label: "Report an issue", href: "/feedback" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Site Map", href: "/sitemap" },
        { label: "System Status", href: "/status" },
        { label: "Replicate for Your State", href: "/replicate" },
        { label: "ourintel.org", href: "/about/ourintel" },
      ],
    },
    {
      title: "For Organizations",
      links: [
        { label: "Health System Leaders", href: "/partners" },
        { label: "Community Organizations", href: "/partnerships" },
        { label: "For Health Systems", href: "/for-health-systems" },
        { label: "Executive Summary", href: "/executive-summary" },
        { label: "Illustrative Scenarios", href: "/case-studies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30" role="contentinfo">
      {/* Crisis strip */}
      <div className="border-b border-border bg-muted/50">
        <div className="container flex flex-wrap items-center justify-center gap-3 py-2.5 text-sm">
          <Phone
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">
            {t("crisis.inCrisis")}{" "}
            <a
              href="tel:988"
              className="font-semibold text-foreground hover:underline"
            >
              988
            </a>
            {" · "}
            {t("crisis.textHome")}
            {" · "}
            <a
              href="tel:211"
              className="font-semibold text-foreground hover:underline"
            >
              2-1-1
            </a>
          </span>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-michigan">
                <Heart
                  className="h-3.5 w-3.5 text-primary-foreground"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-bold text-foreground">
                Access Michigan
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.brandDescription")}
            </p>
          </div>

          {/* Link sections - long indexes show a capped preview with "Show all N" */}
          {footerSections.map((section) => (
            <FooterSection
              key={section.title}
              title={section.title}
              links={section.links}
              collapsible={
                section.title === "Understand" ||
                section.title === "Visualize" ||
                section.title === "Belong" ||
                section.title.includes("About")
              }
            />
          ))}
        </div>

        {/* System Status */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-michigan-forest animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              All systems normal
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              {
                icon: MapPin,
                value: "✓",
                label: "Statewide coverage",
                colorClass: "text-foreground",
              },
              {
                icon: Shield,
                value: "✓",
                label: "Verified feeds",
                colorClass: "text-foreground",
              },
              {
                icon: Database,
                value: String(stats.dataFeeds),
                label: "Live sources",
                title: `${stats.dataFeeds} uptime-monitored API endpoints. Distinct from the ${DATA_SOURCE_DISPLAY} public source organizations behind the platform's data.`,
                colorClass: "text-foreground",
              },
              {
                icon: FileText,
                value: stats.resourceCount,
                label: "Community resources",
                colorClass: "text-foreground",
              },
            ]
              // Hide any stat whose value is not yet available (e.g. the live
              // community-resource count before its query resolves) so no
              // blank or unverified figure is shown.
              .filter((m) => m.value != null && m.value !== "")
              .map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-1.5"
                title={"title" in m ? (m.title as string) : undefined}
              >
                <m.icon className="h-3 w-3 text-primary" aria-hidden="true" />
                <span className={`text-xs font-bold ${m.colorClass}`}>
                  {m.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {m.label}
                </span>
                <CheckCircle2
                  className="h-2.5 w-2.5 text-michigan-forest-deep"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-3 max-w-xl mx-auto">
            Independent civic project. Not affiliated with any agency, employer,
            or health system.
          </p>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Site updated{" "}
            {new Date(__BUILD_TIMESTAMP__).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Data Sources */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Including data from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: "MDHHS", icon: Building2 },
              { label: "Michigan 2-1-1", icon: Phone },
              { label: "CMS (Medicare)", icon: Shield },
              { label: "HRSA", icon: HandHeart },
              { label: "CDC", icon: Activity },
              { label: "EPA AirNow", icon: Landmark },
              { label: "Leapfrog (Safety)", icon: CheckCircle2 },
            ].map((src) => (
              <div key={src.label} className="flex items-center gap-1.5">
                <src.icon
                  className="h-3 w-3 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                  {src.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            <Link to="/data-sources" className="hover:underline text-primary">
              View all {DATA_SOURCE_DISPLAY} public sources →
            </Link>
          </p>
        </div>

        {/* Public Beta Badge */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="mx-auto max-w-xl rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold">Access Michigan</span> - built by
              residents, improved by feedback.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Suggestion?{" "}
              <Link
                to="/contact"
                className="font-medium text-primary hover:underline"
              >
                Tell us.
              </Link>
            </p>
            {!isHelpPage && (
              <a
                href="https://buymeacoffee.com/michigans"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                ☕ Support this project
              </a>
            )}
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
            <Shield className="h-3 w-3 text-michigan-forest-deep" />
            <Link
              to="/methodology#trust-log"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              How we keep this honest →
            </Link>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mb-3">
            Verified datasets. Modeled estimates clearly labeled.{" "}
            <Link to="/methodology" className="text-primary hover:underline">
              See how →
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mb-3">
            Independent · Not a government agency · Data from MDHHS, CMS, HRSA,
            CDC, EPA, and more.
          </p>
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto mb-3">
            Crisis support:{" "}
            <a
              href="tel:988"
              className="font-semibold text-foreground hover:underline"
            >
              988
            </a>{" "}
            (Suicide &amp; Crisis Lifeline) -{" "}
            <a
              href="tel:211"
              className="font-semibold text-foreground hover:underline"
            >
              211
            </a>{" "}
            (Local Resources)
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
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Michigan edition. National and global coverage at{" "}
            <a
              href="https://ourintel.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              ourintel.org
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
