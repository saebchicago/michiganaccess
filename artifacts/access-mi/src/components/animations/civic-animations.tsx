import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGGER_DELAY_STEP = 0.03;
const MAX_STAGGER_DELAY = 0.18;
const COUNTER_ANIMATION_DURATION_MS = 1000;

interface AnimationWrapperProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

interface CounterAnimationProps {
  target: number;
  className?: string;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

interface ChartAnimationProps {
  points: string;
  className?: string;
  stroke?: string;
}

export function SignalCardAnimation({ children, className, index = 0 }: AnimationWrapperProps) {
  const reducedMotion = useReducedMotion();
  const delay = Math.min(index * STAGGER_DELAY_STEP, MAX_STAGGER_DELAY);

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reducedMotion ? undefined : { duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({ children, className }: AnimationWrapperProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reducedMotion ? undefined : { y: -4, boxShadow: "0 18px 36px -20px rgba(15, 23, 42, 0.35)" }}
      transition={reducedMotion ? undefined : { duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function CounterAnimation({
  target,
  className,
  decimals = 0,
  suffix = "",
  prefix = "",
}: CounterAnimationProps) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / COUNTER_ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - elapsed) ** 3;
      setValue(target * eased);
      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  const formatted = useMemo(() => {
    const rounded = Number(value.toFixed(decimals));
    return `${prefix}${rounded.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  }, [decimals, prefix, suffix, value]);

  return <span className={cn("civic-metric-lg", className)}>{formatted}</span>;
}

export function ChartAnimation({ points, className, stroke = "currentColor" }: ChartAnimationProps) {
  const reducedMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 160 64" className={cn("h-16 w-full", className)} fill="none" aria-hidden="true">
      <motion.path
        d={points}
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        initial={reducedMotion ? false : { pathLength: 0 }}
        whileInView={reducedMotion ? undefined : { pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={reducedMotion ? undefined : { duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}
