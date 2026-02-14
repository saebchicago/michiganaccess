import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ChevronDown, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import HighContrastToggle from "@/components/shared/HighContrastToggle";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t("nav.findCare"), href: "/find-care" },
    { label: t("nav.healthMap"), href: "/health-map" },
    { label: t("nav.environment"), href: "/environment" },
    { label: t("nav.civicData"), href: "/civic-data" },
    {
      label: t("nav.more"),
      children: [
        { label: t("nav.financialHelp"), href: "/financial-help" },
        { label: t("nav.qualityRatings"), href: "/quality" },
        { label: t("nav.healthConditions"), href: "/conditions" },
        { label: t("nav.communityResources"), href: "/resources" },
        { label: t("nav.transportation"), href: "/transportation" },
        { label: t("nav.healthNews"), href: "/news" },
        { label: t("nav.costTransparency"), href: "/costs" },
        { label: t("nav.prevention"), href: "/wellness" },
        { label: t("nav.clinicalTrials"), href: "/clinical-trials" },
        { label: t("nav.supportGroups"), href: "/support" },
        { label: t("nav.healthEducation"), href: "/learn" },
        { label: t("nav.healthData"), href: "/data" },
        { label: t("nav.partnerships"), href: "/partnerships" },
        { label: "Community Events", href: "/events" },
        { label: t("nav.siteReport"), href: "/site-report" },
        { label: t("nav.about"), href: "/about" },
        { label: t("nav.contact"), href: "/contact" },
        { label: "Methodology", href: "/methodology" },
        { label: "Research", href: "/research" },
        { label: "Impact", href: "/impact" },
        { label: "Technical", href: "/technical" },
      ],
    },
  ];

  const handlePrintReport = () => {
    if (location.pathname === "/site-report") {
      window.print();
    } else {
      navigate("/site-report");
      setTimeout(() => window.print(), 2000);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md"
      role="banner"
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:p-2 focus:rounded">
        Skip to main content
      </a>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Michigan Access Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-michigan">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">Michigan Access</span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">Resources for Health, Safety & Transportation</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 w-56 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg"
                      role="menu"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMoreOpen(false)}
                          role="menuitem"
                          className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                            location.pathname === child.href
                              ? "font-medium text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href!}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <HighContrastToggle />
          <LanguageSwitcher />
          <Button
            size="icon"
            onClick={handlePrintReport}
            className="bg-primary hover:bg-primary/90 h-9 w-9 rounded-lg"
            title="Download Site Report as PDF"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download PDF Report</span>
          </Button>
          <Button size="sm" className="hidden sm:flex bg-gradient-michigan hover:opacity-90 transition-opacity" asChild>
            <a href="tel:988">{t("getHelp")}</a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label} className="mt-4">
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {link.label}
                      </p>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${
                            location.pathname === child.href
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href!}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        location.pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="mt-6 px-3">
                  <Button className="w-full bg-gradient-michigan" asChild>
                    <a href="tel:988">{t("getHelp")}</a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
