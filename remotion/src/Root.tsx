import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 5 scenes, 30fps
// Scene 1: 75f  (2.5s)  hook
// Scene 2: 120f (4.0s)  dataset cascade
// Scene 3: 90f  (3.0s)  Michigan / 83 counties
// Scene 4: 90f  (3.0s)  stats counter
// Scene 5: 105f (3.5s)  resolve / wordmark
// Transitions: 4 × 20f overlap = 80f
// Total = 480 - 80 = 400f ≈ 13.3s
export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={400}
    fps={30}
    width={1920}
    height={1080}
  />
);
