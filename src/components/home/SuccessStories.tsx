import { motion } from "framer-motion";
import { Search, FileText, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    icon: Search,
    title: "Find Affordable Care",
    description: "Search for sliding-scale dental, medical, or mental health services by county — and get matched in under 2 minutes.",
    color: "text-michigan-teal",
    bg: "bg-michigan-teal/10",
  },
  {
    icon: FileText,
    title: "Appeal an Insurance Denial",
    description: "Use the appeal generator to build a structured letter after a claim denial, with guidance on DIFS external review and Medicaid fair hearings.",
    color: "text-michigan-forest",
    bg: "bg-michigan-forest/10",
  },
  {
    icon: MapPin,
    title: "Coordinate Senior Services",
    description: "Discover Meals on Wheels, free ride programs, and caregiver resources for an elderly family member — all from a single search.",
    color: "text-primary",
    bg: "bg-primary/10",
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
        <h2 className="text-2xl font-bold text-foreground">How Access Michigan Works</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Three common ways residents use the platform to connect with services.
        </p>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-3">
        {useCases.map((uc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover-lift">
              <CardContent className="py-6 space-y-3">
                <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${uc.bg}`}>
                  <uc.icon className={`h-6 w-6 ${uc.color}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SuccessStories;
