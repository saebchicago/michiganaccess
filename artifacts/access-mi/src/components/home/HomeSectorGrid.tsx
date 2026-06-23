import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Home,
  Zap,
  Droplets,
  Bus,
  TreePine,
  Database,
  ArrowRight,
} from "lucide-react";

const sectors = [
  {
    icon: Stethoscope,
    title: "Health & Insurance",
    description: "Clinics, coverage options, Medicaid, Medicare, FQHC, and appeals.",
    href: "/insurance-coverage",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Home,
    title: "Housing & Legal",
    description: "Shelter, rental assistance, legal aid, eviction prevention, and FOIA.",
    href: "/resources",
    color: "text-michigan-forest-deep",
    bg: "bg-michigan-forest/10",
  },
  {
    icon: Zap,
    title: "Utilities & Energy",
    description: "Outage alerts, energy assistance, billing help, and reliability data.",
    href: "/environment#energy",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Droplets,
    title: "Water",
    description: "Drinking water quality, violations, lead service line info, and local contacts.",
    href: "/environment#water",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: Bus,
    title: "Transportation",
    description: "Transit routes, medical transport, crash data, and accessibility.",
    href: "/transportation",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: TreePine,
    title: "Environment",
    description: "Air quality, environmental justice, Superfund sites, and PFAS monitoring.",
    href: "/environment",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Database,
    title: "Civic Data & Open Gov",
    description: "Explore verified open datasets, FOIA tools, budget transparency, and election info.",
    href: "/civic-data-hub",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function HomeSectorGrid() {
  return (
    <section className="py-10 bg-muted/20 border-y border-border/40" aria-labelledby="sectors-heading">
      <div className="container max-w-5xl">
        <div className="text-center mb-7">
          <h2 id="sectors-heading" className="text-2xl font-bold text-foreground">
            Explore by sector
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Every service and dataset, organized by what matters to you.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                to={s.href}
                className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 card-hover cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.description}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
