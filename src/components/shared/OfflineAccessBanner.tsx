import { useState } from "react";
import { Phone, X, MessageSquare } from "lucide-react";

const HELP_PATHS = ["/find-care", "/financial-help", "/resources", "/housing", "/reentry"];

export default function OfflineAccessBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Only show on help-seeking pages
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (!HELP_PATHS.some((p) => path.startsWith(p))) return null;
  }

  if (dismissed) return null;

  return (
    <div className="bg-muted/50 border-b border-border print:hidden">
      <div className="container flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>
            Can't access this online?{" "}
            <a href="tel:211" className="font-semibold text-foreground hover:underline">Call 211</a>
            {" "}(free, 24/7) for the same resources by phone.{" "}
            <span className="hidden sm:inline">
              Text your ZIP to{" "}
              <a href="sms:898211" className="font-semibold text-foreground hover:underline">898-211</a>
              {" "}for local help.{" "}
              Para español: marque 211.
            </span>
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
