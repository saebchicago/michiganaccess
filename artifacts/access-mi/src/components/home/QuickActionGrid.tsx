import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, ShieldCheck, FileWarning, Bus, Baby, Home, HeartPulse, Pill } from "lucide-react";

const actions = [
  { icon: Apple, label: "Find a Food Pantry", href: "/resources", color: "bg-michigan-forest/10 text-michigan-forest-deep" },
  { icon: ShieldCheck, label: "Renew Medicaid", href: "/financial-help", color: "bg-primary/10 text-primary" },
  { icon: FileWarning, label: "Appeal a Denial", href: "/health/insurance-appeals", color: "bg-michigan-coral/10 text-michigan-coral-deep" },
  { icon: Bus, label: "Find a Bus Route", href: "/transportation", color: "bg-michigan-teal/10 text-michigan-teal-deep" },
  { icon: HeartPulse, label: "Find Urgent Care", href: "/find-care", color: "bg-destructive/10 text-destructive" },
  { icon: Pill, label: "Get Rx Help", href: "/financial-help", color: "bg-michigan-gold/10 text-michigan-gold-deep" },
  { icon: Home, label: "Find Housing", href: "/resources", color: "bg-michigan-navy/10 text-michigan-navy" },
  { icon: Baby, label: "Family Services", href: "/resources", color: "bg-michigan-sky/10 text-michigan-sky" },
];

const item = {
  hidden: { opacity: 0, scale: 0.92 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.04, duration: 0.25 } }),
};

export default function QuickActionGrid() {
  return (
    <section className="py-10">
      <div className="container">
        <h2 className="mb-1 text-lg font-bold text-foreground md:text-xl">I need to…</h2>
        <p className="mb-5 text-sm text-muted-foreground">Pick what you need - we'll take you straight there.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {actions.map((a, i) => (
            <motion.div key={a.label} initial="hidden" whileInView="show" viewport={{ once: true }} variants={item} custom={i}>
              <Link
                to={a.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-center card-hover hover:border-primary/30 hover:shadow-michigan"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.color} transition-transform group-hover:scale-110`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold leading-tight text-foreground">{a.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
