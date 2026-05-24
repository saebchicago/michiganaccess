import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: displayFont } = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: monoFont } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

const STATS = [
  { value: 700, suffix: "+", label: "Community resources",     sub: "curated, validated" },
  { value: 16,  suffix: "",  label: "Authoritative datasets",  sub: "EPA · CMS · MDHHS · Census" },
  { value: 100, suffix: "%", label: "Open & free to use",      sub: "no paywall, no signup" },
];

export const Scene4Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(spring({ frame, fps, config: { damping: 22 } }), [0, 1], [24, 0]);

  return (
    <AbsoluteFill style={{ padding: "100px 140px", justifyContent: "center" }}>
      <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 80 }}>
        <div style={{ fontFamily: monoFont, color: COLORS.gold, fontSize: 18, letterSpacing: 3, marginBottom: 14 }}>
          WHAT IT MEANS
        </div>
        <div
          style={{
            fontFamily: displayFont,
            color: COLORS.cream,
            fontSize: 88,
            fontWeight: 600,
            letterSpacing: -2.5,
            lineHeight: 1,
          }}
        >
          Built <em style={{ color: COLORS.gold, fontStyle: "italic" }}>by</em> citizens.<br />
          Built <em style={{ color: COLORS.gold, fontStyle: "italic" }}>for</em> citizens.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 80, marginTop: 20 }}>
        {STATS.map((s, i) => {
          const delay = 25 + i * 10;
          const t = interpolate(frame, [delay, delay + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const value = Math.round(t * s.value);
          const colOp = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
          const colY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 22 } }), [0, 1], [30, 0]);
          const lineW = interpolate(spring({ frame: frame - delay, fps, config: { damping: 30 } }), [0, 1], [0, 100]);
          return (
            <div key={i} style={{ opacity: colOp, transform: `translateY(${colY}px)` }}>
              <div style={{ width: `${lineW}%`, height: 2, background: COLORS.gold, marginBottom: 28 }} />
              <div
                style={{
                  fontFamily: displayFont,
                  color: COLORS.cream,
                  fontSize: 140,
                  fontWeight: 700,
                  letterSpacing: -4,
                  lineHeight: 0.9,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
                <span style={{ color: COLORS.gold }}>{s.suffix}</span>
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  color: COLORS.cream,
                  fontSize: 26,
                  fontWeight: 500,
                  marginTop: 18,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: monoFont,
                  color: COLORS.cream + "70",
                  fontSize: 14,
                  letterSpacing: 1.5,
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
