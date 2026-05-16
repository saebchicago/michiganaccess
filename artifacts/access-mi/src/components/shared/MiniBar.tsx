/**
 * Mini CSS bar indicator — a single horizontal bar with label, value, and fill %.
 * No chart libraries, pure CSS.
 */

interface MiniBarProps {
  label: string;
  value: string;
  /** Fill percentage 0–100 */
  fill: number;
  /** CSS class for the fill color (should be a Tailwind bg- class) */
  colorClass?: string;
  /** Short context note */
  context?: string;
}

export default function MiniBar({ label, value, fill, colorClass = "bg-primary", context }: MiniBarProps) {
  const clampedFill = Math.max(0, Math.min(100, fill));

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clampedFill}%` }}
        />
      </div>
      {context && (
        <p className="text-[10px] text-muted-foreground">{context}</p>
      )}
    </div>
  );
}
