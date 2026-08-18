import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, Download, Search, BarChart2 } from "lucide-react";
import { AccessMILogo } from "@/components/branding/AccessMILogo";
import MySettingsDrawer from "@/components/shared/MySettingsDrawer";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeToggle from "@/components/shared/ThemeToggle";
import CountySelector from "@/components/shared/CountySelector";
import SiteSearch, { commandSiteSearch } from "@/components/shared/SiteSearch";
import { useCounty } from "@/contexts/CountyContext";
import {
  NAV_GROUPS,
  getManifestEntry,
  isNavGroup,
  type NavGroup,
  type NavLink as NavLinkType,
} from "@/routes/manifest";

/** Check if current path matches a nav href - supports exact match and prefix match for nested routes */
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

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        className="relative bg-background/95 backdrop-blur-md border-b border-border/60"
        role="banner"
      >
        <div className="container flex min-h-16 items-center gap-3 py-2">
          {/* Logo */}
          <Link
            to="/"
            className="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:min-w-[16.5rem]"
            aria-label="Access Michigan Home"
          >
            <AccessMILogo className="h-9 w-9 shrink-0" variant="compact" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="whitespace-nowrap text-sm font-bold text-foreground">
                Access Michigan
              </span>
              <span
                className="hidden whitespace-nowrap text-[10px] font-medium tracking-[0.01em] text-muted-foreground sm:block"
                aria-hidden="true"
              >
                Independent civic intelligence · Michigan-wide
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="ml-auto hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1"
            aria-label="Main navigation"
          >
            {resolvedNavGroups.map((link) =>
              isNavGroup(link) ? (
                <DropdownNav
                  key={link.label}
                  label={link.label}
                  items={(link as NavGroup).children}
                  panel={(link as NavGroup).panel}
                  currentPath={location.pathname}
                />
              ) : (
                <Link
                  key={(link as NavLinkType).href}
                  to={(link as NavLinkType).href!}
                  className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isRouteActive(location.pathname, (link as NavLinkType).href)
                      ? "text-primary font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                  aria-current={
                    isRouteActive(location.pathname, (link as NavLinkType).href)
                      ? "page"
                      : undefined
                  }
                >
                  {link.label}
                  {(link as NavLinkType).badge && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none">
                      {(link as NavLinkType).badge}
                    </span>
                  )}
                </Link>
              ),
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:ml-3 lg:border-l lg:border-border/70 lg:pl-3">
            <DesktopSearchTrigger />
            <div className="lg:hidden">
              <SiteSearch />
            </div>
            <Link
              to="/compare"
              className={`hidden lg:inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                location.pathname === "/compare"
                  ? "text-primary font-bold"
                  : "text-foreground hover:text-primary"
              }`}
              aria-current={
                location.pathname === "/compare" ? "page" : undefined
              }
              aria-label="Compare Michigan places"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Compare
            </Link>
            <CountySelector variant="header" />
            <MySettingsDrawer />
            <ThemeToggle />
            <Button
              size="sm"
              className="hidden sm:flex bg-gradient-michigan hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              asChild
            >
              <a href="tel:988">{t("getHelp")}</a>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  data-testid="mobile-nav"
                  variant="ghost"
                  size="icon"
                  className="lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
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
                            className={`flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                              location.pathname === child.href
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none shrink-0">
                                {child.badge}
                              </span>
                            )}
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
                    ),
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
    </>
  );
};

/** Desktop persistent search input that opens the SiteSearch dialog */
function DesktopSearchTrigger() {
  const { county } = useCounty();
  const placeholder = county
    ? `Search near ${county}…`
    : "Search services, care, benefits…";

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
        <kbd className="ml-auto rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}

/**
 * Accessible disclosure nav for the desktop header.
 *
 * Click-toggle (not hover) is deliberate: hover menus are hostile to
 * touch, to switch access, and to anyone with a tremor. The trigger is a
 * plain aria-expanded disclosure button; the panel is a labelled region
 * of ordinary links in natural Tab order. This intentionally does NOT use
 * role="menu"/"menuitem": those imply a linear widget with roving focus,
 * and a multi-column panel with descriptions is a navigation region, not
 * a menu widget (see APG disclosure navigation pattern).
 *
 * - Enter/Space toggles open (native button behavior)
 * - ArrowDown from the trigger opens and focuses the first link
 * - Escape closes and returns focus to the trigger - but note the
 *   sacrosanct QuickExitBar binds Escape on window as the DV-safety
 *   panic key (immediate exit to weather.com), so in practice Escape
 *   leaves the site entirely. These handlers deliberately do NOT call
 *   stopPropagation: the menu must never swallow the safety key.
 * - Outside click and route change close
 *
 * Entry descriptions are resolved from the route manifest at render time
 * (summary, else description) - the nav never stores its own copy of
 * them, so menu text can never drift from the page it points to.
 * Groups without a `panel` config fall back to a single-column list.
 */
function DropdownNav({
  label,
  items,
  panel,
  currentPath,
}: {
  label: string;
  items: NavLinkType[];
  panel?: NavGroup["panel"];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (open) {
          panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
        } else {
          setOpen(true);
          // Focus the first link once the panel has rendered.
          requestAnimationFrame(() => {
            panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
          });
        }
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    },
    [open],
  );

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      }
    },
    [close],
  );

  const menuId = `nav-menu-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const byHref = new Map(items.map((child) => [child.href, child]));
  const columns = panel
    ? panel.columns.map((col) => ({
        heading: col.heading,
        links: col.hrefs
          .map((href) => byHref.get(href))
          .filter((c): c is NavLinkType => c !== undefined),
      }))
    : [{ heading: null, links: items }];

  return (
    // NOT position:relative - the panel anchors to the header itself so it
    // can span the full width. The ref still scopes outside-click closing.
    <div ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isGroupActive(currentPath, items)
            ? "text-primary font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary relative"
            : "text-muted-foreground"
        }`}
        aria-expanded={open}
        aria-controls={menuId}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            ref={panelRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            onKeyDown={handlePanelKeyDown}
            className="absolute left-0 right-0 top-full z-50 border-b border-border bg-popover shadow-xl"
            aria-label={label}
          >
            <div
              className={`container grid max-w-6xl gap-x-8 gap-y-4 py-5 ${
                panel
                  ? "grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.9fr)]"
                  : "max-w-xs grid-cols-1"
              }`}
            >
              {columns.map((col, colIndex) => (
                <div key={col.heading ?? colIndex}>
                  {col.heading && (
                    <h3 className="mb-2 border-b border-border pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {col.heading}
                    </h3>
                  )}
                  <ul className="space-y-0.5">
                    {col.links.map((child) => {
                      const entry = getManifestEntry(child.href);
                      const description = entry?.summary ?? entry?.description;
                      return (
                        <li key={child.href + child.label}>
                          <Link
                            to={child.href}
                            onClick={() => close(false)}
                            className={`block rounded-md px-2.5 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                              isRouteActive(currentPath, child.href)
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                            aria-current={
                              isRouteActive(currentPath, child.href)
                                ? "page"
                                : undefined
                            }
                          >
                            <span className="flex items-center gap-2 text-sm font-medium">
                              {child.label}
                              {child.badge && (
                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none shrink-0">
                                  {child.badge}
                                </span>
                              )}
                            </span>
                            {description && (
                              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                {description}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {panel && (
                <div className="flex flex-col rounded-lg border border-border bg-muted/40 p-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Start here
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {panel.promo.title}
                  </p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {panel.promo.body}
                  </p>
                  <Link
                    to={panel.promo.href}
                    onClick={() => close(false)}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {panel.promo.cta}
                    <ChevronDown
                      className="h-3.5 w-3.5 -rotate-90"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;
