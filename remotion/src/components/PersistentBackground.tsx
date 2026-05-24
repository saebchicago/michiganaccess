import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../theme";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Subtle drift on the radial gradient
  const drift = interpolate(frame, [0, durationInFrames], [0, 40]);
  const driftY = interpolate(frame, [0, durationInFrames], [0, -20]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 1400px 900px at ${50 + drift * 0.3}% ${50 + driftY * 0.5}%, ${COLORS.navyLight} 0%, ${COLORS.navy} 60%, #060e1a 100%)`,
      }}
    >
      {/* Faint grid overlay — data feel */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.gold}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gold}08 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.6,
          transform: `translate(${drift * 0.4}px, ${driftY * 0.4}px)`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
