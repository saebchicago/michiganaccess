import { motion } from "framer-motion";
import { Building2, Users, MapPin, Heart, FileText } from "lucide-react";

const stats = [
  { icon: Users, value: "20,000+", label: "Healthcare Providers" },
  { icon: Building2, value: "500+", label: "Facilities" },
  { icon: MapPin, value: "83", label: "Counties Covered" },
  { icon: Heart, value: "200+", label: "Financial Assistance Locations" },
  { icon: FileText, value: "15,000+", label: "Community Resources" },
];

const StatsBar = () => (
  <section className="bg-gradient-michigan py-10">
    <div className="container">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <stat.icon className="mb-2 h-5 w-5 text-michigan-gold" />
            <span className="text-2xl font-bold text-primary-foreground">{stat.value}</span>
            <span className="text-xs text-primary-foreground/70">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center text-xs text-primary-foreground/50"
      >
        Updated weekly with latest health data
      </motion.p>
    </div>
  </section>
);

export default StatsBar;
