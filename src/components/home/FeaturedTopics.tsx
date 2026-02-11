import { motion } from "framer-motion";
import { Syringe, HeartPulse, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const topics = [
  {
    icon: Syringe,
    tag: "Seasonal Health",
    title: "Flu Season: Where to Get Vaccinated",
    description: "Find vaccination sites near you. Walk-in and appointment options available across all 83 counties.",
    color: "text-michigan-teal",
    bg: "bg-accent/10",
  },
  {
    icon: HeartPulse,
    tag: "Heart Health",
    title: "Heart Disease: Prevention & Treatment",
    description: "Michigan's #1 cause of death. Learn about prevention strategies and find top-rated cardiac care.",
    color: "text-michigan-coral",
    bg: "bg-michigan-coral/10",
  },
  {
    icon: Brain,
    tag: "Mental Health",
    title: "New Crisis Services Available",
    description: "988 Suicide & Crisis Lifeline now active. New community mental health centers opening statewide.",
    color: "text-michigan-sky",
    bg: "bg-michigan-sky/10",
  },
  {
    icon: TrendingUp,
    tag: "Community Win",
    title: "Maternal Mortality Rates Improving",
    description: "Michigan sees 12% improvement in maternal outcomes. New programs expanding access to prenatal care.",
    color: "text-michigan-forest",
    bg: "bg-michigan-forest/10",
  },
];

const FeaturedTopics = () => (
  <section className="py-16 md:py-20 bg-muted/30">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">Featured Health Topics</h2>
        <p className="mt-2 text-muted-foreground">Stay informed about what matters most to Michigan families</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="group h-full cursor-pointer border-border/50 transition-all duration-300 hover:border-primary/20 hover:shadow-michigan hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${topic.bg}`}>
                  <topic.icon className={`h-5 w-5 ${topic.color}`} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${topic.color}`}>{topic.tag}</span>
                <h3 className="mt-2 text-base font-semibold text-foreground">{topic.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedTopics;
