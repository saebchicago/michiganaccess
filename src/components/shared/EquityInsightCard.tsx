import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface EquityInsightCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  stat: string;
  description: string;
  source?: string;
  ctaText?: string;
  ctaHref?: string;
  color: "teal" | "gold" | "coral" | "sky" | "forest";
  trend?: "up" | "down" | "stable";
}

const colorMap = {
  teal: {
    bg: "bg-michigan-teal/5",
    border: "border-michigan-teal/30",
    icon: "text-michigan-teal",
    stat: "text-michigan-teal",
    accent: "bg-michigan-teal/10",
  },
  gold: {
    bg: "bg-michigan-gold/5",
    border: "border-michigan-gold/30",
    icon: "text-michigan-gold",
    stat: "text-michigan-gold",
    accent: "bg-michigan-gold/10",
  },
  coral: {
    bg: "bg-michigan-coral/5",
    border: "border-michigan-coral/30",
    icon: "text-michigan-coral",
    stat: "text-michigan-coral",
    accent: "bg-michigan-coral/10",
  },
  sky: {
    bg: "bg-michigan-sky/5",
    border: "border-michigan-sky/30",
    icon: "text-michigan-sky",
    stat: "text-michigan-sky",
    accent: "bg-michigan-sky/10",
  },
  forest: {
    bg: "bg-michigan-forest/5",
    border: "border-michigan-forest/30",
    icon: "text-michigan-forest",
    stat: "text-michigan-forest",
    accent: "bg-michigan-forest/10",
  },
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") {
    return <TrendingUp className="h-3.5 w-3.5" />;
  }
  return null;
};

export const EquityInsightCard = forwardRef<HTMLDivElement, EquityInsightCardProps>(({
  icon: Icon,
  title,
  stat,
  description,
  source,
  ctaText = "Learn more",
  ctaHref = "/data-and-insights",
  color,
  trend,
}, ref) => {
  const colors = colorMap[color];

  const cardContent = (
    <Card
      className={`h-full border-l-4 ${colors.bg} ${colors.border} overflow-hidden transition-all duration-200 motion-safe:hover:shadow-lg motion-reduce:hover:shadow-md ${
        ctaHref ? "cursor-pointer motion-safe:hover:scale-[1.02]" : ""
      }`}
    >
      <CardContent className="py-6 space-y-4">
        <div className={`inline-flex items-center justify-center rounded-lg p-3 ${colors.accent}`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug">{title}</h3>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${colors.stat}`}>{stat}</p>
            {trend && (
              <span className={`text-xs font-medium ${colors.stat} flex items-center gap-0.5`}>
                <TrendIcon trend={trend} />
                {trend === "up" ? "Worsening" : trend === "down" ? "Improving" : "Stable"}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {source && <p className="text-[9px] text-muted-foreground/60">Source: {source}</p>}
        {ctaHref && (
          <div className="pt-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors.icon} group-hover:underline transition-colors`}>
              {ctaText}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {ctaHref ? <Link to={ctaHref}>{cardContent}</Link> : cardContent}
    </motion.div>
  );
});

EquityInsightCard.displayName = "EquityInsightCard";

export default EquityInsightCard;