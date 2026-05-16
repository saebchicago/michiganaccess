import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, Smartphone, Monitor, Share2, MoreVertical, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import NotificationPrompt from "@/components/shared/NotificationPrompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const { t } = useTranslation();
  usePageMeta({ title: "Install App", description: "Install Access Michigan on your device for instant access to services.", path: "/install" });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12 md:py-20">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-michigan">
            <Download className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Install Access Michigan</h1>
          <p className="mt-3 text-muted-foreground">
            Add to your home screen for instant, app-like access — no app store needed.
          </p>
        </div>

        {/* Install button (Android/Desktop) */}
        {installed ? (
          <div className="mb-10 flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
            <CheckCircle2 className="h-6 w-6 text-michigan-forest" />
            <span className="font-semibold text-foreground">Access Michigan is installed on this device!</span>
          </div>
        ) : deferredPrompt ? (
          <div className="mb-10 text-center">
            <Button size="lg" onClick={handleInstall} className="bg-gradient-michigan px-8 text-lg hover:opacity-90">
              <Download className="mr-2 h-5 w-5" /> Install Now
            </Button>
          </div>
        ) : null}

        {/* Platform instructions */}
        <div className="space-y-6">
          {/* iOS */}
          <div className={`rounded-xl border bg-card p-6 ${platform === "ios" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">iPhone & iPad</h2>
                <p className="text-xs text-muted-foreground">Safari required</p>
              </div>
              {platform === "ios" && <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Your device</span>}
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span>Open this page in <strong className="text-foreground">Safari</strong> (not Chrome or other browsers)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span>Tap the <Share2 className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">Share</strong> button at the bottom of the screen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span>Scroll down and tap <Plus className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">Add to Home Screen</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                <span>Tap <strong className="text-foreground">Add</strong> — MI Access appears on your home screen</span>
              </li>
            </ol>
          </div>

          {/* Android */}
          <div className={`rounded-xl border bg-card p-6 ${platform === "android" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Android</h2>
                <p className="text-xs text-muted-foreground">Chrome or Edge</p>
              </div>
              {platform === "android" && <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Your device</span>}
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span>Tap the <MoreVertical className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">menu</strong> (three dots) in Chrome</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span>Tap <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home Screen</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span>Confirm by tapping <strong className="text-foreground">Install</strong></span>
              </li>
            </ol>
          </div>

          {/* Desktop */}
          <div className={`rounded-xl border bg-card p-6 ${platform === "desktop" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Monitor className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Desktop</h2>
                <p className="text-xs text-muted-foreground">Chrome, Edge, or Brave</p>
              </div>
              {platform === "desktop" && <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Your device</span>}
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span>Look for the <Download className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">install icon</strong> in the address bar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span>Click <strong className="text-foreground">Install</strong> to add MI Access as a desktop app</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Notification opt-in */}
        <NotificationPrompt className="mt-8" />

        {/* Benefits */}
        <div className="mt-8 rounded-xl border border-border bg-muted/50 p-6">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">Why install?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "⚡", title: "Instant access", desc: "Launch from your home screen like any app" },
              { icon: "📶", title: "Works offline", desc: "Previously viewed pages load without internet" },
              { icon: "🔔", title: "Notifications", desc: "Get alerts when new services open near you" },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <div className="text-2xl">{b.icon}</div>
                <p className="mt-1 text-sm font-semibold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstallPage;
