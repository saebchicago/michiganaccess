import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: displayFont } = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: monoFont } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const titleY = interpolate(titleS, [0, 1], [40, 0]);
  const titleOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const titleBlur = interpolate(frame, [0, 28], [10, 0], { extrapolateRight: "clamp" });

  const urlOp = interpolate(frame, [28, 50], [0, 1], { extrapolateRight: "clamp" });
  const urlY = interpolate(spring({ frame: frame - 28, fps, config: { damping: 22 } }), [0, 1], [20, 0]);

  const lineW = interpolate(spring({ frame: frame - 18, fps, config: { damping: 30 } }), [0, 1], [0, 1]);

  // Subtle breathing on the wordmark
  const breath = 1 + Math.sin(frame / 18) * 0.005;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 140 }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: monoFont,
            color: COLORS.gold,
            fontSize: 20,
            letterSpacing: 6,
            marginBottom: 40,
            opacity: titleOp,
          }}
        >
          ACCESS MICHIGAN
        </div>
        <h1
          style={{
            fontFamily: displayFont,
            color: COLORS.cream,
            fontSize: 200,
            fontWeight: 700,
            letterSpacing: -6,
            lineHeight: 0.95,
            margin: 0,
            opacity: titleOp,
            transform: `translateY(${titleY}px) scale(${breath})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          The data,
          <br />
          <em style={{ color: COLORS.gold, fontStyle: "italic" }}>open.</em>
        </h1>
        <div
          style={{
            width: 380,
            height: 2,
            background: COLORS.gold,
            margin: "56px auto 36px",
            transform: `scaleX(${lineW})`,
          }}
        />
        <div
          style={{
            fontFamily: monoFont,
            color: COLORS.cream,
            fontSize: 26,
            letterSpacing: 4,
            opacity: urlOp,
            transform: `translateY(${urlY}px)`,
          }}
        >
          accessmi.org<span style={{ color: COLORS.gold }}>/civic-data-hub</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
