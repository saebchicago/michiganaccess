import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, HeartPulse, Activity } from "lucide-react";

interface ValueBadgesProps {
  specialty: string;
  boardCertified?: boolean | null;
  yearsExperience?: number | null;
}

/**
 * Displays Michigan Value Collaborative (MVC) PY 2026-2027 value badges
 * based on provider specialty and credentials.
 */
export default function ValueBadges({ specialty, boardCertified, yearsExperience }: ValueBadgesProps) {
  const badges: { label: string; tooltip: string; icon: React.ElementType; color: string }[] = [];

  const specLower = specialty.toLowerCase();

  // Sepsis follow-up metric — relevant for hospitalists, IM, critical care
  if (["internal medicine", "hospitalist", "critical care", "pulmonology", "infectious disease"].some((s) => specLower.includes(s))) {
    badges.push({
      label: "Sepsis Follow-Up",
      tooltip: "MVC PY 2026-2027: High 14-day post-sepsis follow-up rate",
      icon: HeartPulse,
      color: "bg-michigan-coral/10 text-michigan-coral border-michigan-coral/20",
    });
  }

  // Cardiac rehab participation — cardiology, family med, IM
  if (["cardiology", "internal medicine", "family medicine", "cardiac", "cardiovascular"].some((s) => specLower.includes(s))) {
    badges.push({
      label: "Cardiac Rehab",
      tooltip: "MVC PY 2026-2027: High cardiac rehabilitation participation rate",
      icon: Activity,
      color: "bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20",
    });
  }

  // General VBC excellence — board certified with 10+ years
  if (boardCertified && (yearsExperience || 0) >= 10) {
    badges.push({
      label: "VBC Leader",
      tooltip: "Value-based care excellence: Board-certified, 10+ years experience",
      icon: Award,
      color: "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <Tooltip key={b.label}>
            <TooltipTrigger asChild>
              <Badge className={`${b.color} text-[10px] cursor-help`}>
                <Icon className="mr-0.5 h-2.5 w-2.5" />{b.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">
              {b.tooltip}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
