import { User, Building2, Heart, Globe, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCounty,
  type Audience,
  type SubPersona,
} from "@/contexts/CountyContext";
import { cn } from "@/lib/utils";
import type { PersonaView } from "@/pages/Index";

// Display labels and scroll targets for each audience button.
// scrollTarget must match an id added to the relevant section in Index.tsx.
const audienceIds: {
  id: Audience;
  icon: React.ElementType;
  label: string;
  desc: string;
  scrollTarget: string;
  personaView: PersonaView;
  badge?: string;
}[] = [
  {
    id: "resident",
    icon: User,
    label: "Resident",
    desc: "Find help for me or my family.",
    scrollTarget: "#for-residents",
    personaView: "resident",
  },
  {
    id: "health-system",
    icon: Building2,
    label: "Analyst",
    desc: "Show provenance and methodology.",
    scrollTarget: "#for-organizations",
    personaView: "professional",
  },
] as const;

const SUB_PERSONAS: { id: SubPersona; label: string; icon: typeof Heart }[] = [
  { id: "caregiver", label: "Caregiver", icon: Heart },
  { id: "immigrant", label: "Newcomer", icon: Globe },
  { id: "disabled", label: "Disability services", icon: Accessibility },
];

function scrollTo(selector: string) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface AudienceSelectorProps {
  onPersonaChange?: (view: PersonaView) => void;
}

export default function AudienceSelector({
  onPersonaChange,
}: AudienceSelectorProps) {
  const { audience, setAudience, subPersonas, toggleSubPersona } = useCounty();
  const isResident = audience === "resident";

  return (
    <section
      className="py-6 border-b border-border/40 bg-muted/20"
      aria-label="I'm here as"
    >
      <div className="container">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground text-center mb-3 font-semibold">
          I'm here as
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {audienceIds.map((a) => {
            const active = audience === a.id;
            return (
              <Button
                key={a.id}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-1.5 text-xs transition-all min-h-[44px]",
                  active ? "shadow-md" : "hover:border-primary/40",
                )}
                onClick={() => {
                  setAudience(active ? null : a.id);
                  // Drive persona view on homepage
                  if (!active) {
                    onPersonaChange?.(a.personaView);
                    setTimeout(() => scrollTo(a.scrollTarget), 80);
                  } else {
                    onPersonaChange?.("resident");
                  }
                }}
                aria-pressed={active}
                title={a.desc}
              >
                <a.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {a.label}
                {a.badge && (
                  <span className="ml-1 rounded-full bg-michigan-gold/20 text-michigan-gold-deep px-1.5 py-px text-[9px] font-bold uppercase leading-none">
                    {a.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Sub-persona tags - visible when Resident is selected */}
        {isResident && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
            <span className="text-[10px] text-muted-foreground mr-1">
              Also…
            </span>
            {SUB_PERSONAS.map((sp) => {
              const active = subPersonas.includes(sp.id);
              return (
                <Badge
                  key={sp.id}
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer gap-1 text-[10px] py-1 px-2.5 min-h-[32px] transition-all select-none",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:border-primary/40 hover:bg-primary/5",
                  )}
                  onClick={() => toggleSubPersona(sp.id)}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSubPersona(sp.id);
                    }
                  }}
                >
                  <sp.icon className="h-3 w-3" aria-hidden="true" />
                  {sp.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Analyst-mode banner: reinforces that the view is now deeper, so the
            switch feels load-bearing rather than ornamental during a demo. */}
        {audience === "health-system" && (
          <p
            className="mt-3 text-center text-[11px] text-muted-foreground italic"
            role="status"
            aria-live="polite"
          >
            Analyst view on. Provenance and methodology emphasized below.
          </p>
        )}
      </div>
    </section>
  );
}
