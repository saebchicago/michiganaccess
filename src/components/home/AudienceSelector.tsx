import { User, Stethoscope, Building2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCounty, type Audience } from "@/contexts/CountyContext";

const audiences = [
  { id: "resident" as Audience, label: "Resident", icon: User, desc: "Find care, resources & benefits" },
  { id: "provider" as Audience, label: "Provider", icon: Stethoscope, desc: "Referral tools & gap data" },
  { id: "health-system" as Audience, label: "Health System", icon: Building2, desc: "Market intelligence & ROI" },
  { id: "policymaker" as Audience, label: "Policymaker", icon: Landmark, desc: "Equity metrics & impact data" },
];

export default function AudienceSelector() {
  const { audience, setAudience } = useCounty();

  return (
    <section className="py-4" aria-label="Personalize your experience">
      <div className="container">
        <p className="text-xs text-muted-foreground text-center mb-2">Personalize content for:</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {audiences.map((a) => {
            const active = audience === a.id;
            return (
              <Button
                key={a.id}
                variant={active ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 text-xs transition-all ${active ? "shadow-md" : "hover:border-primary/40"}`}
                onClick={() => setAudience(active ? null : a.id)}
                aria-pressed={active}
              >
                <a.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {a.label}
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
