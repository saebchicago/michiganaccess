import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISS_KEY = "mi-pwa-banner-dismissed";
const VISIT_KEY = "mi-visit-count";
const MIN_VISITS = 2;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Skip if not mobile, already installed, or dismissed
    if (!isMobile) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    // Track visits
    const count = Number(localStorage.getItem(VISIT_KEY) || "0") + 1;
    localStorage.setItem(VISIT_KEY, String(count));
    if (count < MIN_VISITS) return;

    // Show after short delay for better UX
    const timer = setTimeout(() => setShow(true), 2500);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [isMobile]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 safe-bottom animate-in slide-in-from-bottom-full duration-300">
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-michigan">
          <Download className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">Install MI Access</p>
          <p className="text-xs text-muted-foreground">Instant access from your home screen</p>
        </div>
        {deferredPrompt ? (
          <Button size="sm" onClick={handleInstall} className="shrink-0 bg-gradient-michigan text-xs">
            Install
          </Button>
        ) : (
          <Link to="/install" onClick={dismiss}>
            <Button size="sm" className="shrink-0 bg-gradient-michigan text-xs">
              How to
            </Button>
          </Link>
        )}
        <button onClick={dismiss} className="shrink-0 p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
