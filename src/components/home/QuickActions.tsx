import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hospital, DollarSign, BookOpen, Users, Bus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    icon: Hospital,
    title: "Find Care Now",
    description: "Search doctors, hospitals, urgent care by location and specialty",
    href: "/find-care",
    bgClass: "bg-primary/10",
    iconClass: "text-primary",
  },
  {
    icon: Bus,
    title: "Transportation & Safety",
    description: "Public transit, school buses, AI stop-arm cameras, accessible rides for seniors",
    href: "/transportation",
    bgClass: "bg-michigan-coral/10",
    iconClass: "text-michigan-coral",
  },
  {
    icon: DollarSign,
    title: "Financial Help",
    description: "Free and reduced-cost care, insurance enrollment, prescription assistance",
    href: "/financial-help",
    bgClass: "bg-michigan-forest/10",
    iconClass: "text-michigan-forest",
  },
  {
    icon: BookOpen,
    title: "Understand Your Condition",
    description: "Evidence-based health information, treatment options, care pathways",
    href: "/conditions",
    bgClass: "bg-accent/10",
    iconClass: "text-accent",
  },
  {
    icon: Users,
    title: "Community Resources",
    description: "Food, housing, transportation, support groups, social services",
    href: "/resources",
    bgClass: "bg-michigan-gold/10",
    iconClass: "text-michigan-gold",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const QuickActions = () => (
  <section className="py-16 md:py-20">
    <div className="container">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        {actions.map((action) => (
          <motion.div key={action.title} variants={item}>
            <Link to={action.href} className="block h-full">
              <Card className="group h-full border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-michigan hover:-translate-y-1">
                <CardContent className="flex flex-col items-start p-6">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${action.bgClass} transition-transform group-hover:scale-110`}>
                    <action.icon className={`h-6 w-6 ${action.iconClass}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>
                  <span className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore →
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default QuickActions;
