import { User, Stethoscope, Building2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCounty, type Audience } from "@/contexts/CountyContext";
import { useTranslation } from "react-i18next";

const audienceIds = [
  { id: "resident" as Audience, icon: User, tKey: "resident" },
  { id: "provider" as Audience, icon: Stethoscope, tKey: "provider" },
  { id: "health-system" as Audience, icon: Building2, tKey: "health_system" },
  { id: "policymaker" as Audience, icon: Landmark, tKey: "policymaker" },
];

export default function AudienceSelector() {
  const { audience, setAudience } = useCounty();
  const { t } = useTranslation();

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
                className={`gap-1.5 text-xs transition-all ${active ? "shadow-md" : "hover:border-primary/40"}`}
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
      </div>
    </section>
  );
}

// Re-export type for backward compat
export type { Audience };
