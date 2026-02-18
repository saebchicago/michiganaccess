import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, HandHeart, Landmark, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: Building2,
    title: "Health System Leaders",
    subtitle: "Hospital Networks in Michigan",
    description:
      "Track referral patterns, optimize ambulatory networks, and measure community health ROI across your service area.",
    cta: "Explore Pilot Program",
    href: "/partners",
    gradient: "from-primary to-michigan-navy",
  },
  {
    icon: HandHeart,
    title: "Community Organizations",
    subtitle: "Non-profits · FQHCs · Coalitions",
    description:
      "Amplify your services to the residents who need them most. Measure impact with institutional-grade analytics.",
    cta: "Collaborate With Us",
    href: "/partnerships",
    gradient: "from-michigan-forest to-michigan-teal",
  },
  {
    icon: Landmark,
    title: "Government & Policy",
    subtitle: "County Health · MDHHS · Legislature",
    description:
      "Gap analysis, SDOH mapping, and outcome tracking to inform evidence-based policy across all 83 counties.",
    cta: "View Impact Data",
    href: "/impact",
    gradient: "from-michigan-blue to-michigan-sky",
  },
];

export default function StakeholderCTAs() {
  return (
    <section className="py-16 bg-muted/30" aria-label="Stakeholder pathways">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Built for Every Stakeholder
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Who uses Michigan Access?</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={c.href}
                className="group block h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-michigan hover:-translate-y-1"
              >
                <div className={`inline-flex rounded-lg bg-gradient-to-br ${c.gradient} p-3 mb-4`}>
                  <c.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{c.title}</h3>
                <p className="text-xs font-medium text-muted-foreground mb-3">{c.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                  {c.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
