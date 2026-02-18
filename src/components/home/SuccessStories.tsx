import { motion } from "framer-motion";
import { Lightbulb, Heart, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const journeys = [
  {
    icon: Heart,
    scenario: "A parent in Genesee County could search for sliding-scale dental care and find options in under 2 minutes — connecting their family to affordable dental services.",
    persona: "Example: Parent seeking dental care",
    color: "text-michigan-teal",
  },
  {
    icon: Shield,
    scenario: "A patient in Wayne County could use the appeal generator after an MRI denial, building a structured appeal letter to submit to their insurance carrier.",
    persona: "Example: Patient navigating a claim denial",
    color: "text-michigan-forest",
  },
  {
    icon: Users,
    scenario: "A caregiver in Kent County could search once and discover both Meals on Wheels and free ride programs for their elderly parent — all from a single platform.",
    persona: "Example: Caregiver coordinating senior services",
    color: "text-primary",
  },
];

const SuccessStories = () => (
  <section className="py-12 bg-muted/20">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Example Journeys</p>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Ways Michiganders Could Use This Tool</h2>
        <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
          These are illustrative examples, not real user stories. We will update this section with community stories as the project grows.
        </p>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-3">
        {journeys.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover-lift">
              <CardContent className="py-6 space-y-3">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{s.persona}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{s.scenario}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SuccessStories;
