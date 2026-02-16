import { motion } from "framer-motion";
import { CheckCircle2, Database, MapPin, Shield, Activity, FileText } from "lucide-react";

const metrics = [
  { icon: MapPin, value: "83/83", label: "Counties Indexed", status: "active" },
  { icon: Shield, value: "✓", label: "Verified Resource Protocols Active", status: "active" },
  { icon: Database, value: "6", label: "Federal Data Feeds Integrated", status: "active" },
  { icon: Activity, value: "<3s", label: "p95 Page Load", status: "active" },
  { icon: FileText, value: "15K+", label: "Resources Cataloged", status: "active" },
];

export default function SystemImpactBar() {
  return (
    <section className="border-y border-border bg-card py-6">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-michigan-forest animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              System Status — All Services Operational
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex flex-col items-center text-center gap-1"
              >
                <div className="flex items-center gap-1.5">
                  <m.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-lg font-bold text-foreground">{m.value}</span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">{m.label}</span>
                <CheckCircle2 className="h-3 w-3 text-michigan-forest" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
