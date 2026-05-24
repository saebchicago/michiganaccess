import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const { fontFamily: displayFont } = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineY = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 90 } });
  const eyebrowOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleBlur = interpolate(frame, [12, 40], [14, 0], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 12, fps, config: { damping: 20 } }), [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });
  const underline = interpolate(spring({ frame: frame - 32, fps, config: { damping: 24, stiffness: 120 } }), [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ padding: "120px 140px", justifyContent: "center" }}>
      <div style={{ maxWidth: 1400 }}>
        {/* Hairline */}
        <div
          style={{
            width: 80,
            height: 2,
            background: COLORS.gold,
            marginBottom: 36,
            transform: `scaleX(${lineY})`,
            transformOrigin: "left",
          }}
        />
        <div
          style={{
            fontFamily: bodyFont,
            color: COLORS.gold,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 500,
            opacity: eyebrowOpacity,
            marginBottom: 32,
          }}
        >
          Access Michigan · Civic Data Hub
        </div>
        <h1
          style={{
            fontFamily: displayFont,
            color: COLORS.cream,
            fontSize: 168,
            lineHeight: 0.95,
            fontWeight: 600,
            letterSpacing: -4,
            margin: 0,
            opacity: titleOpacity,
            filter: `blur(${titleBlur}px)`,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Michigan,
          <br />
          <em style={{ color: COLORS.gold, fontStyle: "italic", fontWeight: 700 }}>by the numbers.</em>
        </h1>
        <div
          style={{
            width: 280,
            height: 2,
            background: COLORS.cream + "55",
            marginTop: 48,
            transform: `scaleX(${underline})`,
            transformOrigin: "left",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
