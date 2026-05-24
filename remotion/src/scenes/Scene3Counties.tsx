import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: displayFont } = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFont } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

// Generate 83 dots in a rough Michigan-mitt silhouette using parametric placement
// Two lobes: Lower Peninsula (mitt) and Upper Peninsula.
function generateDots(count: number, seed = 1) {
  const dots: { x: number; y: number; size: number; delay: number }[] = [];
  // Pseudo-random with seed
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Upper Peninsula: horizontal band, ~20 dots
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const x = 0.15 + t * 0.55 + (rand() - 0.5) * 0.04;
    const y = 0.25 + Math.sin(t * Math.PI) * 0.06 + (rand() - 0.5) * 0.05;
    dots.push({ x, y, size: 6 + rand() * 6, delay: i * 1.5 });
  }
  // Lower Peninsula mitt: ~63 dots
  for (let i = 0; i < 63; i++) {
    // Approximate mitt: an oval with a "thumb"
    let x: number, y: number;
    if (rand() < 0.18) {
      // Thumb (east side)
      x = 0.65 + rand() * 0.1;
      y = 0.55 + rand() * 0.18;
    } else {
      const a = rand() * Math.PI;          // 0..PI
      const r = 0.18 + rand() * 0.12;
      x = 0.48 + Math.cos(a) * r * 0.9;
      y = 0.72 - Math.sin(a) * r * 1.1;
    }
    dots.push({ x, y, size: 6 + rand() * 6, delay: 20 + i * 0.7 });
  }
  return dots;
}

const DOTS = generateDots(83);

export const Scene3Counties: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Counter: 0 → 83
  const countT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = Math.round(countT * 83);

  const labelOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const labelY = interpolate(spring({ frame: frame - 55, fps, config: { damping: 22 } }), [0, 1], [20, 0]);

  return (
    <AbsoluteFill>
      {/* Dots: cover full canvas, anchored to a centered 1100px-wide playfield */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 1100, height: 760 }}>
          {DOTS.map((d, i) => {
            const s = spring({ frame: frame - d.delay, fps, config: { damping: 18, stiffness: 220 } });
            const scale = interpolate(s, [0, 1], [0, 1]);
            const op = interpolate(s, [0, 0.6, 1], [0, 0.9, 1]);
            // Subtle pulse after appearing
            const pulseT = Math.max(0, frame - d.delay - 30);
            const pulse = 1 + Math.sin(pulseT / 8 + i) * 0.06;
            const isAccent = i % 11 === 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${d.x * 100}%`,
                  top: `${d.y * 100}%`,
                  width: d.size * 2,
                  height: d.size * 2,
                  marginLeft: -d.size,
                  marginTop: -d.size,
                  borderRadius: "50%",
                  background: isAccent ? COLORS.gold : COLORS.cream,
                  boxShadow: isAccent ? `0 0 20px ${COLORS.gold}cc` : `0 0 10px ${COLORS.cream}55`,
                  transform: `scale(${scale * pulse})`,
                  opacity: op,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Overlay text — bottom left */}
      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 120,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <div style={{ fontFamily: monoFont, color: COLORS.gold, fontSize: 16, letterSpacing: 3, marginBottom: 14 }}>
          COVERAGE
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <span
            style={{
              fontFamily: displayFont,
              color: COLORS.cream,
              fontSize: 200,
              fontWeight: 700,
              letterSpacing: -6,
              lineHeight: 0.9,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(count).padStart(2, "0")}
          </span>
          <span style={{ fontFamily: displayFont, color: COLORS.cream, fontSize: 56, fontWeight: 600 }}>
            counties.
          </span>
        </div>
        <div style={{ fontFamily: monoFont, color: COLORS.cream + "80", fontSize: 18, marginTop: 8, letterSpacing: 1 }}>
          Every. Single. One.
        </div>
      </div>
    </AbsoluteFill>
  );
};
