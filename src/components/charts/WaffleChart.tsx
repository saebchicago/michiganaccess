import { motion } from "framer-motion";

interface WaffleChartProps {
  value: number;
  color: string;
  emptyColor?: string;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const GRID = { sm: 10, md: 10, lg: 10 };
const CELL = { sm: 6, md: 8, lg: 10 };

export default function WaffleChart({
  value, color, emptyColor = "hsl(var(--muted))",
  label, sublabel, size = "md", animate = true,
}: WaffleChartProps) {
  const squares = Math.min(100, Math.max(0, Math.round(value)));
  const gridSize = GRID[size];
  const cellSize = CELL[size];
  const totalCells = gridSize * gridSize;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}
        initial={animate ? "hidden" : "visible"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.006 } } }}
      >
        {Array.from({ length: totalCells }, (_, i) => (
          <motion.div
            key={i}
            className="rounded-[1px]"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: i < squares ? color : emptyColor,
            }}
            variants={animate ? {
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1 },
            } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        ))}
      </motion.div>
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums" style={{ color }}>{value.toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sublabel && <p className="text-[9px] text-muted-foreground/60">{sublabel}</p>}
      </div>
    </div>
  );
}
