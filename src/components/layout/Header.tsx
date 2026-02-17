import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Heart, ChevronDown, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeToggle from "@/components/shared/ThemeToggle";
import CountySelector from "@/components/shared/CountySelector";
import SiteSearch from "@/components/shared/SiteSearch";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    {
      label: t("nav.findHelp"),
      children: [
        { label: t("nav.findCare"), href: "/find-care" },
        { label: t("nav.healthMap"), href: "/health-map" },
        { label: t("nav.financialHelp"), href: "/financial-help" },
        { label: t("nav.communityResources"), href: "/resources" },
        { label: t("nav.transportation"), href: "/transportation" },
      ],
    },
    {
      label: t("nav.serviceCategories"),
      children: [
        { label: t("nav.healthConditions"), href: "/conditions" },
        { label: "Insurance Appeals", href: "/health/insurance-appeals" },
        { label: t("nav.environment"), href: "/environment" },
        { label: t("nav.civicData"), href: "/civic-data" },
        { label: t("nav.qualityRatings"), href: "/quality" },
        { label: t("nav.costTransparency"), href: "/costs" },
        { label: t("nav.prevention"), href: "/wellness" },
        { label: t("nav.healthData"), href: "/data" },
        { label: "Life Navigator", href: "/life-navigator" },
        { label: "Regions", href: "/regions" },
      ],
    },
    {
      label: "Strategy",
      children: [
        { label: "Executive Summary", href: "/executive-summary" },
        { label: "Health Equity", href: "/equity" },
        { label: "Lean Healthcare", href: "/lean-healthcare" },
        { label: "For Health Systems", href: "/for-health-systems" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Impact Dashboard", href: "/impact" },
      ],
    },
    {
      label: t("nav.eligibility"),
      href: "/financial-help",
    },
    {
      label: t("nav.about"),
      href: "/about",
    },
    {
      label: t("nav.contact"),
      href: "/contact",
    },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md"
      role="banner"
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:p-2 focus:rounded">
        Skip to main content
      </a>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Michigan Access Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-michigan">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-foreground">Michigan Access</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.children ? (
              <DropdownNav key={link.label} label={link.label} items={link.children} currentPath={location.pathname} />
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
          <SiteSearch />
          <CountySelector variant="header" />
          <ThemeToggle />
          <LanguageSwitcher />
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
                <div className="mt-4 border-t border-border pt-4 px-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("county.selectCounty")}
                    </p>
                    <CountySelector variant="compact" />
                  </div>
                  <Link
                    to="/install"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-0 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {t("nav.installApp")}
                  </Link>
                </div>
                <div className="mt-2 px-3">
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

function DropdownNav({ label, items, currentPath }: { label: string; items: { label: string; href: string }[]; currentPath: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg"
            role="menu"
          >
            {items.map((child) => (
              <Link
                key={child.href}
                to={child.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                  currentPath === child.href
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
  );
}

export default Header;
