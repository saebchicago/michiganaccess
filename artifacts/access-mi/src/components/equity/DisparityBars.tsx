import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface DisparityGroup {
  label: string;
  value: number;
  color: string;
}

interface Props {
  title: string;
  unit: string;
  groups: DisparityGroup[];
  source: string;
  className?: string;
}

export default function DisparityBars({ title, unit, groups, source, className = "" }: Props) {
  const maxValue = Math.max(...groups.map((g) => g.value));
  const sorted = [...groups].sort((a, b) => b.value - a.value);
  const ratio =
    sorted.length >= 2
      ? (sorted[0].value / sorted[sorted.length - 1].value).toFixed(1)
      : null;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {ratio && parseFloat(ratio) > 1.3 && (
          <span className="text-xs font-bold text-destructive">{ratio}× disparity</span>
        )}
      </div>
      <div className="space-y-2">
        {sorted.map((g, i) => (
          <div key={g.label} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-16 text-right shrink-0">
              {g.label}
            </span>
            <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(g.value / maxValue) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: g.color }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground">
                <AnimatedCounter value={g.value} decimals={1} suffix={unit} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-2">Source: {source}</p>
    </div>
  );
}
