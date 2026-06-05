import { useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Database,
  MapPin,
  Shield,
  Activity,
  FileText,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import {
  RESOURCE_COUNT_DISPLAY,
  COUNTIES_COVERED,
} from "@/config/platformConstants";

function AnimatedMetric({
  icon: Icon,
  rawValue,
  label,
}: {
  icon: React.ElementType;
  rawValue: string;
  label: string;
}) {
  const numericMatch = rawValue.match(/^([\d,]+)/);
  const numericPart = numericMatch
    ? parseInt(numericMatch[1].replace(/,/g, ""), 10)
    : null;
  const suffix = numericPart !== null ? rawValue.replace(/^[\d,]+/, "") : "";
  const { value, ref } = useCountUp(numericPart ?? 0, 1400);

  return (
    <div
      className="flex flex-col items-center text-center gap-1"
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-lg font-bold text-foreground tabular-nums">
          {numericPart !== null
            ? `${value.toLocaleString()}${suffix}`
            : rawValue}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {label}
      </span>
      <CheckCircle2 className="h-3 w-3 text-michigan-forest" />
    </div>
  );
}

const metrics = [
  {
    icon: MapPin,
    value: String(COUNTIES_COVERED),
    suffix: `/${COUNTIES_COVERED}`,
    label: "Counties Indexed",
  },
  { icon: Shield, value: "✓", label: "Verified Resource Protocols Active" },
  { icon: Database, value: "6", label: "Federal Data Feeds Integrated" },
  { icon: Activity, value: "<3s", label: "p95 Page Load" },
  {
    icon: FileText,
    value: RESOURCE_COUNT_DISPLAY,
    label: "Resources Cataloged",
  },
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
              >
                <AnimatedMetric
                  icon={m.icon}
                  rawValue={m.suffix ? m.value + m.suffix : m.value}
                  label={m.label}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
