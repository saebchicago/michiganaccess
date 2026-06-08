/**
 * ConfettiBurst - lightweight celebration animation using Framer Motion.
 * No external dependencies (canvas-confetti, party-js, etc.) required.
 *
 * Usage:
 *   const [burst, setBurst] = useState(false);
 *   <ConfettiBurst active={burst} onDone={() => setBurst(false)} />
 *   <button onClick={() => setBurst(true)}>Export</button>
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = [
  "#01579B", // great-lakes blue
  "#2E7D32", // forest green
  "#F57C00", // harvest orange
  "#26A69A", // teal
  "#E91E63", // coral-pink
  "#FFB300", // amber gold
  "#7C3AED", // violet
  "#0288D1", // sky blue
];

interface Particle {
  id: number;
  x: number; // final x (vw units from center)
  y: number; // final y (negative = upward, in vh)
  color: string;
  size: number; // px
  rotate: number; // degrees
  delay: number; // seconds
  shape: "square" | "circle" | "rect";
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + (Math.random() - 0.5) * 30;
    const rad = (angle * Math.PI) / 180;
    const dist = 12 + Math.random() * 22; // vw/vh units
    return {
      id: i,
      x: Math.cos(rad) * dist,
      y: -Math.abs(Math.sin(rad) * dist) - 8 - Math.random() * 12,
      color: PALETTE[i % PALETTE.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.18,
      shape: (["square", "circle", "rect"] as const)[i % 3],
    };
  });
}

const PARTICLES = generateParticles(28);

interface ConfettiBurstProps {
  active: boolean;
  onDone?: () => void;
}

export default function ConfettiBurst({ active, onDone }: ConfettiBurstProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 1400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [active, onDone]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                opacity: [1, 1, 0],
                rotate: p.rotate,
                scale: [1, 1.2, 0.6],
              }}
              transition={{
                duration: 1.1 + Math.random() * 0.3,
                delay: p.delay,
                ease: [0.2, 0.8, 0.4, 1],
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.shape === "rect" ? p.size * 0.45 : p.size,
                backgroundColor: p.color,
                borderRadius:
                  p.shape === "circle"
                    ? "50%"
                    : p.shape === "rect"
                      ? "2px"
                      : "3px",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
