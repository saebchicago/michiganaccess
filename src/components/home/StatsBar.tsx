import { motion } from "framer-motion";
import { Building2, Users, MapPin, Heart, FileText, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCountUp } from "@/hooks/useCountUp";
import { useRef, useEffect, useState } from "react";

function AnimatedStat({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { value: display, ref } = useCountUp(value, 1200);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className="text-4xl font-light tracking-tight text-primary-foreground tabular-nums">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Building2, value: 88, suffix: "", label: "Healthcare Facilities" },
    { icon: MapPin, value: 83, suffix: "", label: t("stats.counties") },
    { icon: Heart, value: 700, suffix: "+", label: "Community Resources" },
    { icon: Users, value: 170, suffix: "+", label: "Municipalities Tracked" },
    { icon: FileText, value: 11, suffix: "", label: "Financial Aid Programs" },
    { icon: Zap, value: 7, suffix: "", label: "Live Data Feeds" },
  ];

  return (
    <section className="bg-gradient-michigan py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <stat.icon className="mb-1 h-5 w-5 text-michigan-gold" />
              <AnimatedStat value={stat.value} suffix={stat.suffix} />
              <span className="text-[11px] font-medium uppercase tracking-widest text-primary-foreground/60">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-[11px] uppercase tracking-wider text-primary-foreground/40"
        >
          {t("stats.updatedWeekly")}
        </motion.p>
      </div>
    </section>
  );
};

export default StatsBar;
