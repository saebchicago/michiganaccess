import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MapPin, BarChart3, ArrowRight } from "lucide-react";

const paths = [
  {
    icon: Heart,
    title: "I need help now",
    description: "Find clinics, food, housing, financial assistance, and crisis resources near you.",
    href: "/find-care",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: MapPin,
    title: "See my community's data",
    description: "Health, coverage, utilities, environment, and transportation — for your ZIP or county.",
    href: "/brief",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "For research & policy",
    description: "Compare counties, export briefs, download CSVs, and explore raw datasets.",
    href: "/data-and-insights",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

export default function HomePrimaryPaths() {
  return (
    <section className="py-10" aria-labelledby="paths-heading">
      <div className="container max-w-4xl">
        <h2 id="paths-heading" className="sr-only">Primary pathways</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {paths.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={p.href}
                className="group flex flex-col h-full rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 p-5 gap-3"
              >
                <div className={`w-10 h-10 rounded-lg ${p.bg} flex items-center justify-center`}>
                  <p.icon className={`h-5 w-5 ${p.color}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                </div>
                <span className={`mt-auto text-xs font-semibold ${p.color} group-hover:underline flex items-center gap-1`}>
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
