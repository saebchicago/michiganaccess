import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Users, Map, BarChart2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Heart, label: "Find Care", href: "/find-care" },
  { icon: BarChart2, label: "Compare", href: "/compare" },
  { icon: Map, label: "Map", href: "/health-map" },
];

const moreLinks = [
  { label: "Resources", href: "/resources" },
  { label: "Financial Help", href: "/financial-help" },
  { label: "Transportation", href: "/transportation" },
  { label: "Energy & Environment", href: "/environment" },
  { label: "Civic Data", href: "/civic-data" },
  { label: "Support Us", href: "/support" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex min-h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md lg:hidden print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] min-w-[44px] min-h-[44px] transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <motion.div whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }}>
              <item.icon className="h-5 w-5" />
            </motion.div>
            <span className={active ? "font-semibold" : "font-normal"}>{item.label}</span>
            {active && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] text-muted-foreground min-w-[44px] min-h-[44px]">
            <motion.div whileTap={{ scale: 0.92 }} transition={{ duration: 0.12 }}>
              <MoreHorizontal className="h-5 w-5" />
            </motion.div>
            <span className="font-normal">More Tools</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="z-[60] rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>More Pages</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {moreLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
