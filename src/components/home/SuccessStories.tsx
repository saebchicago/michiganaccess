import { motion } from "framer-motion";
import { Quote, Heart, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stories = [
  {
    icon: Heart,
    quote: "Found sliding-scale dental care in under 2 minutes — my family hadn't seen a dentist in 3 years.",
    persona: "Parent in Genesee County",
    metric: "2 min to care",
    color: "text-michigan-teal",
  },
  {
    icon: Shield,
    quote: "Used the appeal generator after my MRI was denied. Won my appeal and saved over $8,400.",
    persona: "Patient in Wayne County",
    metric: "$8,400 recovered",
    color: "text-michigan-forest",
  },
  {
    icon: Users,
    quote: "Connected my elderly mother to Meals on Wheels and a free ride program — all from one search.",
    persona: "Caregiver in Kent County",
    metric: "2 services linked",
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
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Real Impact</p>
        <h2 className="text-2xl font-bold text-foreground">How Michiganders Use This Platform</h2>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stories.map((s, i) => (
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
                  <span className="text-xs font-bold text-foreground">{s.metric}</span>
                </div>
                <div className="flex gap-2">
                  <Quote className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 italic leading-relaxed">{s.quote}</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">— {s.persona}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SuccessStories;
