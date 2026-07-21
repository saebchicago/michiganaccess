// Build: force-rebuild-20260325
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import "./styles/design-system-excellence.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker in production builds only - dev servers
// and tests never see it. virtual:pwa-register is provided by
// vite-plugin-pwa (see vite.config.ts).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
