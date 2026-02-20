import { motion } from "framer-motion";
import { Building2, Users, MapPin, Heart, FileText, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Building2, value: "88", label: "Healthcare Facilities" },
    { icon: MapPin, value: "83", label: t("stats.counties") },
    { icon: Heart, value: "700+", label: "Community Resources" },
    { icon: Users, value: "170+", label: "Municipalities Tracked" },
    { icon: FileText, value: "11", label: "Financial Aid Programs" },
    { icon: Zap, value: "7", label: "Live Data Feeds" },
  ];

  return (
    <section className="bg-gradient-michigan py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
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
          {t("stats.updatedWeekly")}
        </motion.p>
      </div>
    </section>
  );
};

export default StatsBar;
