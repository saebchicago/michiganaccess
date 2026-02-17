import { useState } from "react";
import { User, Stethoscope, Building2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Audience = "resident" | "provider" | "health-system" | "policymaker";

const audiences = [
  { id: "resident" as Audience, label: "I'm a Resident", icon: User, desc: "Find care, resources & benefits" },
  { id: "provider" as Audience, label: "I'm a Provider", icon: Stethoscope, desc: "Referral tools & gap data" },
  { id: "health-system" as Audience, label: "I'm a Health System Leader", icon: Building2, desc: "Market intelligence & ROI" },
  { id: "policymaker" as Audience, label: "I'm a Policymaker", icon: Landmark, desc: "Equity metrics & impact data" },
];

const STORAGE_KEY = "mi-access-audience";

export function useAudience() {
  const [audience, setAudience] = useState<Audience | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY) as Audience | null; } catch { return null; }
  });

  const select = (a: Audience) => {
    setAudience(a);
    try { localStorage.setItem(STORAGE_KEY, a); } catch {}
  };

  return { audience, select };
}

interface Props {
  audience: Audience | null;
  onSelect: (a: Audience) => void;
}

export default function AudienceSelector({ audience, onSelect }: Props) {
  return (
    <section className="py-4">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {audiences.map((a) => {
            const active = audience === a.id;
            return (
              <Button
                key={a.id}
                variant={active ? "default" : "outline"}
                size="sm"
                className={`gap-2 text-xs transition-all ${active ? "shadow-md" : "hover:border-primary/40"}`}
                onClick={() => onSelect(a.id)}
              >
                <a.icon className="h-3.5 w-3.5" />
                {a.label}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
