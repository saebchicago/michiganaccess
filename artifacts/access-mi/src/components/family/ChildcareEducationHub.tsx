import { motion } from "framer-motion";
import { Baby, GraduationCap, Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RESOURCES = [
  {
    icon: Baby,
    title: "Licensed Childcare Search",
    desc: "Find licensed childcare providers by ZIP code, age, and schedule. Includes daycare centers, family homes, and group homes.",
    stats: "~7,500 licensed providers statewide",
    url: "https://childcaresearch.apps.lara.state.mi.us/",
    source: "LARA (Licensing & Regulatory Affairs)",
    color: "text-michigan-coral",
  },
  {
    icon: Star,
    title: "Great Start to Quality Ratings",
    desc: "Quality-rated childcare programs using Michigan's 5-star rating system. Higher stars = more rigorous quality standards.",
    stats: "Only 24% of eligible children enrolled in preschool",
    url: "https://www.greatstarttoquality.org/",
    source: "Great Start to Quality",
    color: "text-michigan-gold",
  },
  {
    icon: GraduationCap,
    title: "Michigan School Data",
    desc: "School performance data, proficiency rates, graduation rates, and the MI School Index for every public school and district.",
    stats: "1,500+ school districts · 3,500+ schools",
    url: "https://www.mischooldata.org/",
    source: "Center for Educational Performance & Information",
    color: "text-primary",
  },
];

export default function ChildcareEducationHub() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Baby className="h-5 w-5 text-michigan-coral" />
            Childcare & Education Access
          </CardTitle>
          <CardDescription>
            Finding safe, affordable childcare and quality schools in Michigan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {RESOURCES.map((r) => (
              <div key={r.title} className="rounded-lg border border-border p-4 space-y-3">
                <r.icon className={`h-6 w-6 ${r.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                <Badge variant="outline" className="text-[9px]">{r.stats}</Badge>
                <Button variant="outline" size="sm" className="w-full h-7 text-xs" asChild>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.source} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Childcare licensing: LARA. Quality ratings: Great Start to Quality. School data: MI School Data / CEPI.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
