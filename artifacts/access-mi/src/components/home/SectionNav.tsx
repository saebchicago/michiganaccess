import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, Route, Layers, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavTab {
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string }[];
}

const TABS: NavTab[] = [
  {
    label: "Pathways",
    icon: <Route className="h-3.5 w-3.5" />,
    items: [
      { label: "Find Care", href: "/find-care" },
      { label: "Financial Help", href: "/financial-help" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals" },
      { label: "Life Navigator", href: "/life-navigator" },
      { label: "Prevention & Wellness", href: "/wellness" },
    ],
  },
  {
    label: "Services",
    icon: <Layers className="h-3.5 w-3.5" />,
    items: [
      { label: "Health Conditions", href: "/conditions" },
      { label: "Environment & Air", href: "/environment" },
      { label: "Transportation", href: "/transportation" },
      { label: "Civic Data", href: "/civic-data" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Cost Transparency", href: "/costs" },
    ],
  },
  {
    label: "Counties",
    icon: <MapPin className="h-3.5 w-3.5" />,
    items: [
      { label: "Wayne County", href: "/county/wayne" },
      { label: "Oakland County", href: "/county/oakland" },
      { label: "Kent County", href: "/county/kent" },
      { label: "Genesee County", href: "/county/genesee" },
      { label: "Washtenaw County", href: "/county/washtenaw" },
      { label: "All Regions", href: "/regions" },
    ],
  },
];

export default function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 340);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-16 left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md"
      role="navigation"
      aria-label="Section navigation"
    >
      <div className="container flex items-center h-10" ref={panelRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground h-8 px-3"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {open ? <X className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
          Browse
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full w-full border-b border-border bg-card shadow-lg z-50"
            >
              <div className="container py-4">
                {/* Tabs */}
                <div className="flex gap-1 mb-3 border-b border-border pb-2" role="tablist">
                  {TABS.map((tab, i) => (
                    <button
                      key={tab.label}
                      role="tab"
                      aria-selected={activeTab === i}
                      onClick={() => setActiveTab(i)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeTab === i
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1" role="tabpanel">
                  {TABS[activeTab].items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
