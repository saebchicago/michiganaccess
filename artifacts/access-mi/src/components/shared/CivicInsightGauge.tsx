/**
 * CivicInsightGauge - semicircle 0-100 score gauge.
 *
 * Renders an accessible SVG arc with colour-coded tiers:
 *   ≥75  → "Strong"          (#2E7D32 forest green)
 *   ≥50  → "Moderate"        (#F57C00 harvest orange)
 *   <50  → "Needs Attention" (#c62828 alert red)
 *
 * Phase 3: Animates score from 0 → target on viewport entry.
 */
import { useRef, useState, useEffect } from "react";

export function CivicInsightGauge({ score, color, showClassification = false }: { score: number; color: string; showClassification?: boolean }) {
  const r = 40;
  const circumference = Math.PI * r; // semicircle arc length

  // Count-up animation
  const ref = useRef<HTMLDivElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          if (prefersReducedMotion) {
            setDisplayScore(score);
            return;
          }
          const startTime = performance.now();
          const duration = 1200;
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplayScore(Math.round(score * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [score]);

  const filled = circumference * (displayScore / 100);
  const tier =
    score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Attention";
  const tierColor =
    score >= 75 ? "#2E7D32" : score >= 50 ? "#F57C00" : "#c62828";

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
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
          style={{ transition: "stroke-dasharray 0.1s linear" }}
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
          {displayScore}
        </text>
      </svg>
      <span className="text-[10px] font-semibold" style={{ color: tierColor }}>
        {tier}
      </span>
      <span className="text-[9px] text-muted-foreground">Civic Insight Score</span>
      {showClassification && (
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] leading-tight font-medium text-michigan-teal-deep bg-michigan-teal/8 border-michigan-teal/20 mt-0.5">
          Modeled estimate
        </span>
      )}
      <a href="/methodology" className="text-[9px] text-primary hover:underline mt-0.5">
        How we build these scores →
      </a>
    </div>
  );
}