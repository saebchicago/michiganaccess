import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bus, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Story {
  name: string;
  county: string;
  narrative: string;
  connections: { label: string; href: string }[];
  accent: string;
  icon: React.ElementType;
}

const STORIES: Story[] = [
  {
    name: "Maria",
    county: "Wayne County",
    narrative:
      "After losing her insurance, Maria used Access Michigan to find a sliding-scale clinic 2 miles from her home in Southwest Detroit. The platform showed her that Wayne County has the highest density of FQHCs in the state - 23 clinics serving 180,000+ patients. She enrolled in the Healthy Michigan Plan within a week.",
    connections: [
      { label: "Find Care → FQHC filter", href: "/find-care" },
      { label: "Medicaid enrollment", href: "/insurance-coverage" },
    ],
    accent: "border-l-michigan-coral",
    icon: Heart,
  },
  {
    name: "James",
    county: "Genesee County",
    narrative:
      "As a veteran managing diabetes and PTSD in Flint, James needed both VA care and community support. Access Michigan's county profile showed that Genesee County has a 13.8% diabetes rate - 1.5× the state average - and connected him to three peer support groups and a CHW navigator.",
    connections: [
      { label: "County health profile", href: "/brief?county=Genesee" },
      { label: "Community resources", href: "/resources" },
    ],
    accent: "border-l-primary",
    icon: MapPin,
  },
  {
    name: "Dorothy",
    county: "Marquette County",
    narrative:
      "Living alone in the Upper Peninsula, Dorothy's nearest hospital is 45 minutes away. Access Michigan's transportation section showed her ALTRAN dial-a-ride service and the GATIS data revealed there are zero sidewalks in her township - highlighting why medical transport, not walking, is her only option.",
    connections: [
      { label: "Transportation services", href: "/transportation" },
      {
        label: "GATIS infrastructure data",
        href: "/transportation#active-transport",
      },
    ],
    accent: "border-l-michigan-teal",
    icon: Bus,
  },
  {
    name: "The Nguyen Family",
    county: "Kent County",
    narrative:
      "After their apartment's water tested positive for elevated PFAS levels, the Nguyen family used Access Michigan's water safety section to find MPART's interactive map, identify their contamination source, and locate a free water testing lab. The Benefits Wizard then connected them to LIHEAP for their heating bills.",
    connections: [
      { label: "PFAS tracker", href: "/environment#water-safety" },
      { label: "Benefits Wizard → LIHEAP", href: "/financial-help" },
    ],
    accent: "border-l-michigan-gold",
    icon: Droplets,
  },
];

export default function ImpactStories() {
  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge
            variant="outline"
            className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
          >
            Why This Matters
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            How Michigan Residents Use This Platform
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Composited scenarios based on real community needs data
          </p>
        </motion.div>

        <div className="space-y-4">
          {STORIES.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border-l-4 ${story.accent}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <story.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {story.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          - {story.county}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        {story.narrative}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {story.connections.map((c) => (
                          <Link
                            key={c.href}
                            to={c.href}
                            className="text-[10px] rounded-full border border-border px-2 py-0.5 text-primary hover:bg-muted transition-colors"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          These stories are composited illustrations of how the platform serves
          Michigan residents. They represent real scenarios based on community
          needs data but are not accounts of specific individuals.
        </p>
      </div>
    </section>
  );
}
