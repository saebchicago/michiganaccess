import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, FileText, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    icon: Search,
    title: "Find Affordable Care",
    description: "Search for sliding-scale dental, medical, or mental health services by county - results in under 2 minutes.",
    color: "text-michigan-teal",
    bg: "bg-michigan-teal/10",
    cta: { label: "Search Now", href: "/find-care" },
  },
  {
    icon: FileText,
    title: "Appeal an Insurance Denial",
    description: "Build a structured appeal letter step-by-step after a claim denial, with guidance on your review options.",
    color: "text-michigan-forest",
    bg: "bg-michigan-forest/10",
    cta: { label: "Start an Appeal", href: "/health/insurance-appeals" },
  },
  {
    icon: MapPin,
    title: "Coordinate Senior Services",
    description: "Find Meals on Wheels, free ride programs, and caregiver resources for an elderly family member - all from one search.",
    color: "text-primary",
    bg: "bg-primary/10",
    cta: { label: "Explore Resources", href: "/resources" },
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
            key={uc.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group relative h-full bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/40 hover:-translate-y-1 hover:border-primary/20">
              <div className="absolute left-0 top-0 h-full w-1 bg-primary/0 transition-all duration-300 group-hover:bg-primary" />
              <CardContent className="py-6 space-y-3">
                <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${uc.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <uc.icon className={`h-6 w-6 ${uc.color}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                <Button variant="ghost" size="sm" className="mt-2 w-fit px-0 text-primary hover:bg-transparent" asChild>
                  <Link to={uc.cta.href}>
                    {uc.cta.label} <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SuccessStories;
