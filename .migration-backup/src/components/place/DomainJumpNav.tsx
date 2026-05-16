/**
 * Sticky domain jump navigation for long Place pages.
 * Scrolls to sections by domain ID.
 */
import { useState, useEffect } from "react";
import { Heart, Home, Zap, Droplets, Bus, Shield, GraduationCap, Apple, Briefcase, Compass, FileText } from "lucide-react";

const DOMAINS = [
  { id: "domain-health", label: "Health", icon: Heart },
  { id: "domain-housing", label: "Housing", icon: Home },
  { id: "domain-workforce", label: "Work", icon: Briefcase },
  { id: "domain-food", label: "Food", icon: Apple },
  { id: "domain-energy", label: "Energy", icon: Zap },
  { id: "domain-transportation", label: "Transit", icon: Bus },
  { id: "domain-education", label: "Education", icon: GraduationCap },
  { id: "domain-safety", label: "Safety", icon: Shield },
  { id: "domain-environment", label: "Environ.", icon: Droplets },
  { id: "sources", label: "Sources", icon: FileText },
] as const;

export default function DomainJumpNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 rounded-full border border-border bg-background/95 backdrop-blur-sm px-2 py-1.5 shadow-lg max-w-[95vw] overflow-x-auto"
    >
      {DOMAINS.map(d => (
        <button
          key={d.id}
          onClick={() => document.getElementById(d.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0"
          aria-label={`Jump to ${d.label}`}
        >
          <d.icon className="h-3 w-3" />
          <span className="hidden sm:inline">{d.label}</span>
        </button>
      ))}
    </nav>
  );
}
