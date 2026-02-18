import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Route, Layers, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface NavSection {
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string }[];
}

const SECTIONS: NavSection[] = [
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
    label: "Sectors",
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
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 340);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenIdx(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      ref={navRef}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-16 left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md"
    >
      <div className="container flex items-center gap-1 h-10">
        {SECTIONS.map((section, i) => (
          <div key={section.label} className="relative">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={openIdx === i}
            >
              {section.icon}
              {section.label}
              <ChevronDown className={`h-3 w-3 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-lg z-50"
                >
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpenIdx(null)}
                      className="block rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
