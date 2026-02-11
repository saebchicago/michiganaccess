import { motion } from "framer-motion";
import { ShieldCheck, Database, Ban, Lock } from "lucide-react";

const indicators = [
  { icon: ShieldCheck, label: "Independent, Non-Commercial Initiative" },
  { icon: Database, label: "Data from CMS, HRSA, CDC, Michigan DHHS" },
  { icon: Ban, label: "No Advertising · No Data Selling" },
  { icon: Lock, label: "Built to Serve Michigan Residents" },
];

const TrustIndicators = () => (
  <section className="border-t border-border bg-muted/30 py-10">
    <div className="container">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
      >
        {indicators.map((ind, i) => (
          <motion.div
            key={ind.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <ind.icon className="h-4 w-4 text-michigan-forest" />
            <span className="text-xs font-medium text-muted-foreground">{ind.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TrustIndicators;
