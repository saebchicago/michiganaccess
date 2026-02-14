import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Phone, ExternalLink, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = forwardRef(() => {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t("footer.findHelp"),
      links: [
        { label: t("nav.findCare"), href: "/find-care" },
        { label: t("nav.financialHelp"), href: "/financial-help" },
        { label: t("nav.communityResources"), href: "/resources" },
        { label: t("nav.transportation"), href: "/transportation" },
        { label: t("nav.healthMap"), href: "/health-map" },
      ],
    },
    {
      title: t("footer.envCivic"),
      links: [
        { label: t("nav.environment"), href: "/environment" },
        { label: t("nav.civicData"), href: "/civic-data" },
        { label: t("nav.healthConditions"), href: "/conditions" },
        { label: t("nav.qualityRatings"), href: "/quality" },
        { label: t("nav.partnerships"), href: "/partnerships" },
      ],
    },
    {
      title: t("footer.learnConnect"),
      links: [
        { label: t("nav.healthEducation"), href: "/learn" },
        { label: t("nav.prevention"), href: "/wellness" },
        { label: t("nav.supportGroups"), href: "/support" },
        { label: t("nav.clinicalTrials"), href: "/clinical-trials" },
        { label: t("nav.healthNews"), href: "/news" },
        { label: t("nav.healthData"), href: "/data" },
      ],
    },
    {
      title: t("footer.about"),
      links: [
        { label: t("nav.about"), href: "/about" },
        { label: t("nav.costTransparency"), href: "/costs" },
        { label: "Data Sources", href: "/about#data-sources" },
        { label: t("nav.siteReport"), href: "/site-report" },
        { label: t("nav.contact"), href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/50" role="contentinfo">
      {/* Crisis Banner */}
      <div className="bg-michigan-coral/10 border-b border-michigan-coral/20">
        <div className="container flex flex-wrap items-center justify-center gap-4 py-3 text-sm">
          <Phone className="h-4 w-4 text-michigan-coral" aria-hidden="true" />
          <span className="font-medium">{t("crisis.inCrisis")}</span>
          <span className="text-muted-foreground">
            {t("crisis.call988")} <strong>(988)</strong> · {t("crisis.textHome")} · {t("crisis.call211")} <strong>(2-1-1)</strong>
          </span>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-michigan">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-foreground">Michigan Access</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Resources for Health, Safety, Transportation, Environment & Civic Engagement — helping Michigan families navigate healthcare, community services, and government. Independent, non-commercial, data-driven.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-md bg-michigan-forest/10 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-michigan-forest">
                ✓ Independent · Non-Commercial
              </span>
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h4 className="mb-3 text-sm font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Ethical Disclaimer */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Ethical & Non-Commercial Platform</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("footer.disclaimer")}
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                {t("footer.ethicalNote")}
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Notice */}
        <div className="mt-4 rounded-lg border border-michigan-gold/30 bg-michigan-gold/5 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-michigan-gold">⚠ {t("footer.prototype")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Facility names and locations are real Michigan healthcare facilities. Quality scores, digital capabilities, and some program details are <strong>demo data</strong> for prototype purposes. Real-world deployment would source live data from{" "}
            <a href="https://data.cms.gov/provider-data/" target="_blank" rel="noopener" className="text-primary underline">CMS Hospital Compare</a>,{" "}
            <a href="https://www.hospitalsafetygrade.org/" target="_blank" rel="noopener" className="text-primary underline">Leapfrog Safety Grades</a>,{" "}
            <a href="https://www.nursingworld.org/organizational-programs/magnet/" target="_blank" rel="noopener" className="text-primary underline">ANCC Magnet Recognition</a>,{" "}
            <a href="https://www.bcbs.com/blue-distinction-specialty-care" target="_blank" rel="noopener" className="text-primary underline">BCBS Blue Distinction</a>, and{" "}
            <a href="https://www.michigan.gov/mdhhs" target="_blank" rel="noopener" className="text-primary underline">Michigan DHHS</a>.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-border pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            Data Sources:{" "}
            <a href="https://data.cms.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">CMS</a>,{" "}
            <a href="https://data.hrsa.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">HRSA</a>,{" "}
            <a href="https://www.michigan.gov/mdhhs" target="_blank" rel="noopener" className="underline hover:text-primary">Michigan DHHS</a>,{" "}
            <a href="https://www.cdc.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">CDC</a>,{" "}
            <a href="https://www.hospitalsafetygrade.org/" target="_blank" rel="noopener" className="underline hover:text-primary">Leapfrog Group</a>,{" "}
            <a href="https://www.countyhealthrankings.org/explore-health-rankings/michigan" target="_blank" rel="noopener" className="underline hover:text-primary">County Health Rankings</a>
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.noAds")}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
