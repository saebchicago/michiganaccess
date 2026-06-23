// Brand mark: Michigan silhouette with a decorative civic-data network overlay.
//
// Silhouette path: derived from the public-domain us-atlas states-10m TopoJSON
// (Census TIGER-derived), filtered to FIPS 26, run through topojson-simplify
// presimplify + simplify at weight 0.02, sub-pixel islands dropped, projected
// with d3-geo geoMercator fitted into a 64x64 viewBox with 4px padding. The
// surviving polygons are the Upper Peninsula, the Lower Peninsula, and Isle
// Royale. One simplified path is the single source of truth for the React
// component, the standalone preview, and the favicon.svg.
//
// Colors: every literal below maps to a brand token in src/index.css.
//   #0E2A47  ->  --color-navy        (211 67% 17%)
//   #1C7293  ->  --color-teal        (197 68% 34%)
//   #159A8C  ->  --color-teal-bright (174 76% 34%, aliased by --forest-green)
//   #E0A33E  ->  --color-amber       (37 72% 56%)
// The teal-bright stop is permitted here per the standing rule that green is
// excluded from UI chrome and lives only in the logo gradient.

import { cn } from "@/lib/utils";

export const ACCESSMI_SILHOUETTE_D =
  "M29.519,59.469L30.776,58.371L32.982,53.813L33.158,49.027L31.261,43.59L31.416,40.274L32.937,37.726L33.004,34.743L35.761,32.503L36.93,30.447L37.04,34.104L38.297,32.667L38.452,29.712L41.231,28.639L39.995,27.05L42.113,25.161L45.554,26.522L46.524,27.796L49.965,28.954L51.355,31.868L50.318,32.585L51.332,34.55L50.98,37.771L49.436,40.201L47.914,40.781L47.142,42.809L48.818,44.174L51.399,40.913L53.538,40.083L55.214,41.946L56.56,49.092L55.942,52.445L54.112,52.287L51.84,57.442L50.23,59.696L41.914,60L41.914,59.469ZM14.586,6.414L18.248,4L18.182,5.177L15.38,6.847ZM7.44,18.269L11.278,16.006L13.462,15.821L21.181,10.232L24.049,10.747L20.873,12.576L19.571,14.623L19.483,16.538L20.784,15.01L24.291,15.844L26.034,18.637L30.974,19.189L33.731,17.316L37.768,17.246L41.032,16.446L40.569,19.013L43.216,19.618L45.488,18.553L46.414,22.443L47.649,23.363L49.436,22.512L49.568,24.077L46.171,23.493L44.561,23.903L42.841,22.839L41.76,24.434L40.635,23.204L37.569,22.466L36.643,23.591L33.379,23.629L32.342,25.153L30.158,26.227L31.327,24.6L28.328,24.729L24.799,31.24L23.21,29.097L23.21,29.097L23.63,26.182L21.446,24.903L21.667,23.994L17.476,23.158L15.579,22.078L9.249,20.315L7.837,18.522L7.837,18.522Z";

// Decorative civic-data network. Hand-placed so each node sits inside the
// simplified silhouette and the edges suggest county-to-county data flow
// without encoding any specific value. Two UP nodes, four LP nodes, five
// edges. The (32, 12.5) UP-east node was nudged from (33, 14.5) so it
// anchors inside the UP body; the cross-strait edge to (36, 28) reads as a
// bridge connection between the two peninsulas.
const NODES: ReadonlyArray<readonly [number, number]> = [
  [21, 14],
  [32, 12.5],
  [36, 28],
  [37, 39],
  [47, 42],
  [33, 47],
];

const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
];

// Compact variant nodes. Same coordinates as the favicon's two amber dots:
// (25, 15) sits inside the UP body; (43, 42) sits in the central LP. Sized
// to read at the 32px header render where the full-variant hairlines and
// r=1.2 dots go sub-pixel. The cross-strait edge between them is drawn
// without a clipPath so it visibly spans the water gap between peninsulas.
const COMPACT_NODES: ReadonlyArray<readonly [number, number]> = [
  [25, 15],
  [43, 42],
];

export type AccessMILogoVariant = "full" | "compact";

interface AccessMILogoProps {
  className?: string;
  variant?: AccessMILogoVariant;
}

export function AccessMILogo({
  className,
  variant = "full",
}: AccessMILogoProps) {
  if (variant === "compact") {
    return <CompactAccessMILogo className={className} />;
  }
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("block", className)}
    >
      <defs>
        <linearGradient
          id="accessmi-gradient"
          x1="0.78"
          y1="0.05"
          x2="0.18"
          y2="0.95"
        >
          <stop offset="0%" stopColor="#0E2A47" />
          <stop offset="55%" stopColor="#1C7293" />
          <stop offset="100%" stopColor="#159A8C" />
        </linearGradient>
        <clipPath id="accessmi-clip">
          <path d={ACCESSMI_SILHOUETTE_D} />
        </clipPath>
      </defs>
      <path d={ACCESSMI_SILHOUETTE_D} fill="url(#accessmi-gradient)" />
      <g clipPath="url(#accessmi-clip)">
        {EDGES.map(([a, b], i) => {
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          return (
            <line
              key={`e${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#E0A33E"
              strokeWidth="0.5"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />
          );
        })}
        {NODES.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x} cy={y} r="1.2" fill="#E0A33E" />
        ))}
      </g>
    </svg>
  );
}

function CompactAccessMILogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("block", className)}
    >
      <defs>
        <linearGradient
          id="accessmi-gradient-compact"
          x1="0.78"
          y1="0.05"
          x2="0.18"
          y2="0.95"
        >
          <stop offset="0%" stopColor="#0E2A47" />
          <stop offset="55%" stopColor="#1C7293" />
          <stop offset="100%" stopColor="#159A8C" />
        </linearGradient>
      </defs>
      <path d={ACCESSMI_SILHOUETTE_D} fill="url(#accessmi-gradient-compact)" />
      <line
        x1={COMPACT_NODES[0][0]}
        y1={COMPACT_NODES[0][1]}
        x2={COMPACT_NODES[1][0]}
        y2={COMPACT_NODES[1][1]}
        stroke="#E0A33E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {COMPACT_NODES.map(([x, y], i) => (
        <circle key={`cn${i}`} cx={x} cy={y} r="2.75" fill="#E0A33E" />
      ))}
    </svg>
  );
}
