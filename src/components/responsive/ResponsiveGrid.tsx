import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home, Menu, Search, MapPinned } from "lucide-react";
import CountySelector from "@/components/shared/CountySelector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

interface StickyCountyHeaderProps {
  title: string;
  subtitle: string;
  secondaryLinks: { label: string; href: string }[];
}

interface MobileCivicNavProps {
  menuLinks: { label: string; href: string }[];
}

type GridStyle = CSSProperties & {
  "--grid-cols-mobile": number;
  "--grid-cols-compact": number;
  "--grid-cols-tablet": number;
  "--grid-cols-desktop": number;
  "--grid-cols-wide": number;
};

export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  const style: GridStyle = {
    "--grid-cols-mobile": 1,
    "--grid-cols-compact": 1,
    "--grid-cols-tablet": 2,
    "--grid-cols-desktop": 3,
    "--grid-cols-wide": 4,
  };

  return (
    <div className={cn("responsive-grid", className)} style={style}>
      {children}
    </div>
  );
}

export function StickyCountyHeader({ title, subtitle, secondaryLinks }: StickyCountyHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-[4.5rem] z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="container flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="civic-eyebrow">County intelligence</p>
          <h1 className="civic-section-title">{title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div id="county-dashboard-selector">
            <CountySelector />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Open section menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Explore domains</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 grid gap-2" aria-label="Secondary navigation">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted min-h-11"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export function MobileCivicNav({ menuLinks }: MobileCivicNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border/60 bg-background/95 backdrop-blur md:hidden print:hidden" aria-label="Dashboard mobile navigation">
      <Link to="/" className="flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-foreground">
        <Home className="h-4 w-4" />
        Home
      </Link>
      <Link to="/data-explorer" className="flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-foreground">
        <Search className="h-4 w-4" />
        Search
      </Link>
      <a href="#county-dashboard-selector" className="flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-foreground">
        <MapPinned className="h-4 w-4" />
        County
      </a>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" className="flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-foreground" aria-label="Open dashboard menu">
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>Dashboard shortcuts</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted min-h-11"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
