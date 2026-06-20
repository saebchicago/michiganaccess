import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, UserX, Scale, CalendarCheck, ArrowRight } from "lucide-react";
import { PLATFORM_FRESHNESS } from "@/config/platformConstants";

const cards = [
  {
    icon: Shield,
    title: "Verified public data",
    description: "MDHHS, CMS, CDC, EPA, Leapfrog - organized and cited.",
  },
  {
    icon: UserX,
    title: "No account required",
    description: "Aggregated analytics only; see Privacy Policy.",
  },
  {
    icon: Scale,
    title: "Independent",
    description: "Not a government agency or sponsored platform.",
  },
  {
    icon: CalendarCheck,
    title: `Verified ${PLATFORM_FRESHNESS.lastVerified}`,
    description: `Last pulled ${PLATFORM_FRESHNESS.lastPulled}. Methodology and trust log published openly.`,
  },
];

export default function TrustPanel() {
  return (
    <section
      id="trust-panel"
      className="py-10 bg-muted/20 border-y border-border/40"
      aria-labelledby="trust-heading"
    >
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h2
            id="trust-heading"
            className="text-lg font-bold text-foreground sm:text-xl"
          >
            Why trust Access Michigan?
          </h2>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="rounded-lg border border-border bg-card p-4 text-center"
            >
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <c.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {c.description}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Read our full methodology <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
