import { User, Building2, Landmark, Heart, Globe, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCounty, type Audience, type SubPersona } from "@/contexts/CountyContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const audienceIds = [
  { id: "resident" as Audience, icon: User, tKey: "resident" },
  { id: "health-system" as Audience, icon: Building2, tKey: "health_system" },
  { id: "policymaker" as Audience, icon: Landmark, tKey: "policymaker" },
];

const SUB_PERSONAS: { id: SubPersona; label: string; icon: typeof Heart }[] = [
  { id: "caregiver", label: "Caregiver", icon: Heart },
  { id: "immigrant", label: "Immigrant / Refugee", icon: Globe },
  { id: "disabled", label: "Disability Services", icon: Accessibility },
];

export default function AudienceSelector() {
  const { audience, setAudience, subPersonas, toggleSubPersona } = useCounty();
  const { t } = useTranslation();

  const isResident = audience === "resident";

  return (
    <section className="py-4" aria-label="Personalize your experience">
      <div className="container">
        <p className="text-xs text-muted-foreground text-center mb-2">{t("audience.personalizeFor")}</p>
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
                  active ? "shadow-md" : "hover:border-primary/40"
                )}
                onClick={() => setAudience(active ? null : a.id)}
                aria-pressed={active}
                title={t(`audience.${a.tKey}_desc`)}
              >
                <a.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {t(`audience.${a.tKey}`)}
              </Button>
            );
          })}
        </div>

        {/* Sub-persona tags — visible when Resident is selected */}
        {isResident && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
            <span className="text-[10px] text-muted-foreground mr-1">I'm also a:</span>
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
                      : "hover:border-primary/40 hover:bg-primary/5"
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
      </div>
    </section>
  );
}

// Re-export types for backward compat
export type { Audience, SubPersona };
