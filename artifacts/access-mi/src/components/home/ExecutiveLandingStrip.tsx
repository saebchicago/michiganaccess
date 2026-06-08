import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

// Dismissible strip pointing health-systems/partner audiences at the BD tools.
// Extracted from src/pages/Index.tsx during the Layer-3 IA restructure so the
// content can live at /about/ourintel (executive audience landing page) rather
// than disappearing with the home-page rewrite.
export default function ExecutiveLandingStrip() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("exec-strip-dismissed") === "1";
    } catch {
      return false;
    }
  });
  if (dismissed) return null;
  const dismiss = () => {
    try {
      localStorage.setItem("exec-strip-dismissed", "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };
  return (
    <div className="border-t border-border/40 bg-muted/30 py-2 px-4">
      <div className="container max-w-5xl flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          <Link
            to="/for-health-systems"
            className="text-primary hover:underline font-medium"
          >
            For health systems &amp; partners &rarr;
          </Link>{" "}
          BD scenario modeler, market intelligence, and SDOH ROI tools.
        </span>
        <button
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
