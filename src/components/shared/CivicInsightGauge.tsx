/**
 * CivicInsightGauge — semicircle 0-100 score gauge.
 *
 * Renders an accessible SVG arc with colour-coded tiers:
 *   ≥75  → "Strong"          (#2E7D32 forest green)
 *   ≥50  → "Moderate"        (#F57C00 harvest orange)
 *   <50  → "Needs Attention" (#c62828 alert red)
 */
export function CivicInsightGauge({ score, color }: { score: number; color: string }) {
  const r = 40;
  const circumference = Math.PI * r; // semicircle arc length
  const filled = circumference * (score / 100);
  const tier =
    score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Attention";
  const tierColor =
    score >= 75 ? "#2E7D32" : score >= 50 ? "#F57C00" : "#c62828";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="100"
        height="56"
        viewBox="0 0 100 56"
        aria-label={`Civic Insight Score: ${score} out of 100`}
      >
        {/* Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* Score text */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="currentColor"
        >
          {score}
        </text>
      </svg>
      <span className="text-[10px] font-semibold" style={{ color: tierColor }}>
        {tier}
      </span>
      <span className="text-[9px] text-muted-foreground">Civic Insight Score</span>
    </div>
  );
}
