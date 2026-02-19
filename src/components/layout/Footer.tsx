import { Link } from "react-router-dom";
import { Heart, Phone, Lock, CheckCircle2, MapPin, Database, Activity, FileText, Shield, Building2, HandHeart, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

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
      title: t("nav.serviceCategories"),
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
        { label: t("nav.about"), href: "/about" },
        { label: t("nav.contact"), href: "/contact" },
        { label: t("footer.methodology"), href: "/methodology" },
        { label: t("footer.research"), href: "/research" },
        { label: t("footer.impact"), href: "/impact" },
        { label: t("footer.technical"), href: "/technical" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Press & Media", href: "/press" },
        { label: "Site Map", href: "/sitemap" },
        { label: t("nav.installApp"), href: "/install" },
      ],
    },
    {
      title: "Partners",
      links: [
        { label: "Health System Leaders", href: "/partners" },
        { label: "Community Organizations", href: "/partnerships" },
        { label: "Government & Policy", href: "/impact" },
        { label: "For Health Systems", href: "/for-health-systems" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Partner Impact", href: "/partners" },
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

          {/* Link sections */}
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
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
            </nav>
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
              { icon: MapPin, value: "83/83", label: "Counties" },
              { icon: Shield, value: "✓", label: "Verified" },
              { icon: Database, value: "6", label: "Data Feeds" },
              { icon: Activity, value: "<3s", label: "p95 Load" },
              { icon: FileText, value: "15K+", label: "Resources" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1.5">
                <m.icon className="h-3 w-3 text-primary" />
                <span className="text-xs font-bold text-foreground">{m.value}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
                <CheckCircle2 className="h-2.5 w-2.5 text-michigan-forest" />
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-6 border-t border-border pt-6">
          <details className="group">
            <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              <Database className="h-3 w-3" />
              Data Sources
              <span className="transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {["CMS (Medicare)", "HRSA (Health Resources)", "CDC (Public Health)", "MDHHS (Michigan)", "Leapfrog (Safety)", "EPA AirNow"].map((src) => (
                <span key={src} className="text-xs text-muted-foreground">{src}</span>
              ))}
            </div>
          </details>
        </div>

        {/* Trust statement */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto mb-3">
            Access Michigan is a community-oriented project to help Michiganders understand and navigate services. Content is informational and will improve over time with community feedback.
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
