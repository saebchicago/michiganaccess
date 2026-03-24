import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Heart, ChevronDown, Download, Sparkles, Search, BarChart2 } from "lucide-react";
import MySettingsDrawer from "@/components/shared/MySettingsDrawer";
import BenefitsWizard from "@/components/home/BenefitsWizard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeToggle from "@/components/shared/ThemeToggle";
import CountySelector from "@/components/shared/CountySelector";
import SiteSearch, { commandSiteSearch } from "@/components/shared/SiteSearch";
import { useCounty } from "@/contexts/CountyContext";
import { NAV_GROUPS, isNavGroup, type NavGroup, type NavLink as NavLinkType } from "@/config/routes";
import { useLens, type Lens } from "@/hooks/useLens";
import { cn } from "@/lib/utils";

/** Check if current path matches a nav href — supports exact match and prefix match for nested routes */
function isRouteActive(currentPath: string, href: string): boolean {
  if (currentPath === href) return true;
  // For routes like /zip/:code, match the prefix /zip
  if (href.startsWith("/zip/") && currentPath.startsWith("/zip/")) return true;
  return false;
}

/** Check if any child in a nav group matches the current path */
function isGroupActive(currentPath: string, items: NavLinkType[]): boolean {
  return items.some((c) => isRouteActive(currentPath, c.href));
}

const LENS_OPTIONS: { value: Lens; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "equity", label: "Equity" },
  { value: "economic", label: "Economic" },
  { value: "family", label: "Family" },
];

function LensSwitcher({ className }: { className?: string }) {
  const { activeLens, setLens } = useLens();
  return (
    <div className={cn("flex items-center gap-0.5 rounded-full bg-muted/60 p-0.5", className)} role="radiogroup" aria-label="Data lens">
      {LENS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={activeLens === opt.value}
          onClick={() => setLens(opt.value)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            activeLens === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Resolve i18n labels
  const resolvedNavGroups = NAV_GROUPS.map((item) => {
    if (isNavGroup(item)) {
      return {
        ...item,
        label: item.i18nKey ? t(item.i18nKey) : item.label,
        children: item.children.map((child) => ({
          ...child,
          label: child.i18nKey ? t(child.i18nKey) : child.label,
        })),
      };
    }
    return {
      ...item,
      label: item.i18nKey ? t(item.i18nKey) : item.label,
    };
  });

  return (
    <>
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg" aria-label="Access Michigan Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-michigan">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-foreground">Access Michigan</span>
        </Link>

        {/* Lens Switcher — desktop */}
        <LensSwitcher className="hidden lg:flex" />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {resolvedNavGroups.map((link) =>
            isNavGroup(link) ? (
              <DropdownNav key={link.label} label={link.label} items={(link as NavGroup).children} currentPath={location.pathname} />
            ) : (
              <Link
                key={(link as NavLinkType).href}
                to={(link as NavLinkType).href!}
                className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isRouteActive(location.pathname, (link as NavLinkType).href)
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary"
                    : "text-foreground hover:text-primary"
                }`}
                aria-current={isRouteActive(location.pathname, (link as NavLinkType).href) ? "page" : undefined}
              >
                {link.label}
                {(link as NavLinkType).badge && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none">
                    {(link as NavLinkType).badge}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <DesktopSearchTrigger />
          <div className="lg:hidden">
            <SiteSearch />
          </div>
          <Link
            to="/compare"
            className={`hidden lg:inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              location.pathname === "/compare" ? "text-primary font-bold" : "text-foreground hover:text-primary"
            }`}
            aria-current={location.pathname === "/compare" ? "page" : undefined}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Compare
          </Link>
          <CountySelector variant="header" />
          <MySettingsDrawer />
          <ThemeToggle />
          <Button
            size="sm"
            onClick={() => setWizardOpen(true)}
            className="hidden sm:flex bg-michigan-gold text-foreground hover:bg-michigan-gold/90 rounded-full px-3 gap-1.5 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Check Benefits
          </Button>
          <Button size="sm" className="hidden sm:flex bg-gradient-michigan hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" asChild>
            <a href="tel:988">{t("getHelp")}</a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {resolvedNavGroups.map((link) =>
                  isNavGroup(link) ? (
                    <div key={link.label} className="mt-4">
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {link.label}
                      </p>
                      {(link as NavGroup).children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
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
                      key={(link as NavLinkType).href}
                      to={(link as NavLinkType).href!}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        location.pathname === (link as NavLinkType).href
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
                      Data Lens
                    </p>
                    <LensSwitcher />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("county.selectCounty")}
                    </p>
                    <CountySelector variant="compact" />
                  </div>
                  <Link
                    to="/install"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-0 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
    <div className="nav-accent" aria-hidden="true" />
    <BenefitsWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  );
};

/** Desktop persistent search input that opens the SiteSearch dialog */
function DesktopSearchTrigger() {
  const { county } = useCounty();
  const placeholder = county ? `Search services near ${county}…` : "Search services…";

  return (
    <div className="hidden lg:flex items-center">
      <button
        onClick={() => {
          commandSiteSearch("open");
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors min-w-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Search site (⌘K). ${placeholder}`}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="truncate">{placeholder}</span>
        <kbd className="ml-auto rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
    </div>
  );
}

/**
 * Accessible dropdown nav: click-toggle (not hover), full keyboard support.
 * - Enter/Space toggles open
 * - Escape closes
 * - ArrowDown/ArrowUp navigates items
 * - Tab moves focus naturally; closing on blur-outside
 */
function DropdownNav({ label, items, currentPath }: { label: string; items: NavLinkType[]; currentPath: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setFocusedIndex(-1);
      return !prev;
    });
  }, []);

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        toggle();
        break;
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setFocusedIndex(0);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
    }
  }, [open, toggle]);

  const handleItemKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index === 0) {
          setOpen(false);
          // Return focus to trigger
          containerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
        } else {
          setFocusedIndex(index - 1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        containerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
        break;
      case "Tab":
        // Let tab work naturally but close dropdown
        setOpen(false);
        break;
    }
  }, [items.length]);

  // Focus management
  useEffect(() => {
    if (open && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  const handleItemClick = useCallback((child: NavLinkType) => {
    setOpen(false);
    const isAnchor = child.href.includes("#");
    if (isAnchor) {
      const [path, hash] = child.href.split("#");
      if (currentPath === (path || "/")) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(child.href);
      }
    }
  }, [currentPath, navigate]);

  const menuId = `nav-menu-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          items.some((c) => currentPath === c.href) ? "text-primary font-semibold" : "text-muted-foreground"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-border bg-popover p-1.5 shadow-lg z-50"
            role="menu"
            aria-label={label}
          >
            {items.map((child, index) => (
              <Link
                key={child.href + child.label}
                to={child.href}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => handleItemClick(child)}
                onKeyDown={(e) => handleItemKeyDown(e, index)}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
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
