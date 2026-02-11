import { Link } from "react-router-dom";
import { Heart, Phone, ExternalLink } from "lucide-react";

const footerSections = [
  {
    title: "Find Help",
    links: [
      { label: "Find Care Near You", href: "/find-care" },
      { label: "Financial Assistance", href: "/financial-help" },
      { label: "Community Resources", href: "/resources" },
      { label: "Health Map", href: "/health-map" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Health Conditions", href: "/conditions" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Health Education", href: "/learn" },
      { label: "Prevention & Wellness", href: "/wellness" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Support Groups", href: "/support" },
      { label: "Clinical Trials", href: "/clinical-trials" },
      { label: "Health News", href: "/news" },
      { label: "Health Data Dashboard", href: "/data" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About This Platform", href: "/about" },
      { label: "Cost Transparency", href: "/costs" },
      { label: "Data Sources", href: "/about#data-sources" },
      { label: "Methodology", href: "/about#methodology" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-border bg-muted/50">
    {/* Crisis Banner */}
    <div className="bg-michigan-coral/10 border-b border-michigan-coral/20">
      <div className="container flex flex-wrap items-center justify-center gap-4 py-3 text-sm">
        <Phone className="h-4 w-4 text-michigan-coral" />
        <span className="font-medium">In Crisis?</span>
        <span className="text-muted-foreground">
          Call <strong>988</strong> (Suicide & Crisis) · Text <strong>HOME</strong> to 741741 · Call{" "}
          <strong>2-1-1</strong> for resources
        </span>
      </div>
    </div>

    <div className="container py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-michigan">
              <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-foreground">Michigan Health</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A citizen-driven initiative to improve health access for all Michigan families. Independent, non-commercial,
            data-driven.
          </p>
          <div className="mt-4 flex items-center gap-1.5 rounded-md bg-michigan-forest/10 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-michigan-forest">
              ✓ Independent · Non-Commercial
            </span>
          </div>
        </div>

        {/* Link sections */}
        {footerSections.map((section) => (
          <div key={section.title}>
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
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-muted-foreground">
          Data Sources: CMS, HRSA, Michigan DHHS, CDC, Leapfrog Group, County Health Rankings
        </p>
        <p className="text-xs text-muted-foreground">
          No advertising · No data selling · Built to serve Michigan residents
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
