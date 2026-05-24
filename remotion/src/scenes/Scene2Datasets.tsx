import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: displayFont } = loadDisplay("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });
const { fontFamily: monoFont } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

const DATASETS = [
  { code: "SVI",      name: "Social Vulnerability Index",     source: "CDC / ATSDR" },
  { code: "ALICE",    name: "Asset Limited, Income Constrained", source: "United Way" },
  { code: "EJSCREEN", name: "Environmental Justice Screen",   source: "EPA" },
  { code: "CMS",      name: "Provider Quality & Cost",        source: "Medicare.gov" },
  { code: "MDHHS",    name: "County Health Outcomes",         source: "Michigan DHHS" },
  { code: "FEMA",     name: "Disaster Declarations",          source: "FEMA" },
  { code: "ACS",      name: "American Community Survey",      source: "U.S. Census" },
  { code: "BRFSS",    name: "Behavioral Risk Factors",        source: "CDC" },
];

export const Scene2Datasets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = interpolate(spring({ frame, fps, config: { damping: 22 } }), [0, 1], [30, 0]);
  const headerOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "100px 140px" }}>
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 48,
        }}
      >
        <div style={{ fontFamily: monoFont, color: COLORS.gold, fontSize: 18, letterSpacing: 2, marginBottom: 12 }}>
          16 AUTHORITATIVE DATASETS / LOADED
        </div>
        <div
          style={{
            fontFamily: displayFont,
            color: COLORS.cream,
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: -1.5,
            lineHeight: 1.05,
          }}
        >
          From <em style={{ color: COLORS.gold, fontStyle: "italic" }}>EPA</em> to <em style={{ color: COLORS.gold, fontStyle: "italic" }}>CMS</em> —
          <br />
          organized for citizens.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
        {DATASETS.map((d, i) => {
          const delay = 18 + i * 6;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
          const x = interpolate(s, [0, 1], [-40, 0]);
          const op = interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateRight: "clamp" });
          const lineW = interpolate(spring({ frame: frame - delay - 4, fps, config: { damping: 30 } }), [0, 1], [0, 100]);
          return (
            <div
              key={d.code}
              style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                paddingBottom: 12,
                borderBottom: `1px solid ${COLORS.cream}15`,
              }}
            >
              <div
                style={{
                  fontFamily: monoFont,
                  color: COLORS.gold,
                  fontSize: 14,
                  width: 50,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: bodyFont,
                    color: COLORS.cream,
                    fontSize: 30,
                    fontWeight: 600,
                    letterSpacing: -0.3,
                  }}
                >
                  {d.code}
                  <span style={{ color: COLORS.cream + "70", fontWeight: 400, marginLeft: 14, fontSize: 22 }}>
                    {d.name}
                  </span>
                </div>
                <div
                  style={{
                    width: `${lineW}%`,
                    height: 1,
                    background: COLORS.gold,
                    marginTop: 6,
                    opacity: 0.5,
                  }}
                />
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 13, color: COLORS.cream + "55", letterSpacing: 1 }}>
                {d.source.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
