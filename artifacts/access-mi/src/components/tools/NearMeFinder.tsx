import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Heart, Pill, Brain, Apple, Home, Bus, Scale, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  zipCode: string;
  zipData: Record<string, number>;
}

const RESOURCES = [
  { icon: Building2, label: "Hospitals & Clinics", href: "/find-care", key: "hospitals" },
  { icon: Heart, label: "Community Health Centers (FQHCs)", href: "/find-care", key: "fqhcs" },
  { icon: Pill, label: "Pharmacies", href: "/resources", key: "pharmacies" },
  { icon: Brain, label: "Mental Health / SUD Treatment", href: "/find-care", key: "mental" },
  { icon: Apple, label: "Food Assistance (SNAP)", href: "/resources", key: "food" },
  { icon: Home, label: "Housing Assistance", href: "/resources", key: "housing" },
  { icon: Bus, label: "Public Transit", href: "/transportation", key: "transit" },
  { icon: Scale, label: "Legal Help", href: "/resources", key: "legal" },
];

function getHighlighted(data: Record<string, number>): Set<string> {
  const h = new Set<string>();
  if ((data["Lack of Health Insurance"] || 0) > 8) h.add("fqhcs");
  if ((data["Depression"] || 0) > 25 || (data["Frequent Mental Health Not Good Days"] || 0) > 18) h.add("mental");
  if ((data["Diabetes"] || 0) > 14 || (data["High Blood Pressure"] || 0) > 35) h.add("hospitals");
  if ((data["Fair or Poor Self-Rated Health Status"] || 0) > 22) h.add("food");
  return h;
}

export default function NearMeFinder({ zipCode, zipData }: Props) {
  const highlighted = useMemo(() => getHighlighted(zipData), [zipData]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">What's Near ZIP {zipCode}?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {RESOURCES.map((r) => {
              const isHighlighted = highlighted.has(r.key);
              return (
                <Link
                  key={r.key}
                  to={`${r.href}?location=${zipCode}`}
                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors group hover:bg-muted/50 ${
                    isHighlighted ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                >
                  <r.icon className={`h-4 w-4 shrink-0 ${isHighlighted ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs text-foreground flex-1">{r.label}</span>
                  {isHighlighted && <Badge className="text-[7px] bg-primary/10 text-primary border-primary/20">Based on data</Badge>}
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">
            Resources highlighted based on your ZIP's health profile. Links navigate to service finders.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
