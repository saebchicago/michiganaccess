import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function NotificationPrompt({ className = "" }: { className?: string }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    // Don't show if already interacted
    if (sessionStorage.getItem("notif-prompt-dismissed")) setDismissed(true);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        toast.success("Notifications enabled! You'll receive alerts about new services near you.");
        // Show a demo notification
        new Notification("Access Michigan", {
          body: "You'll now receive alerts about new services and health updates.",
          icon: "/pwa-192x192.png",
        });
      } else {
        toast.info("You can enable notifications anytime from your browser settings.");
      }
    } catch {
      toast.error("Unable to request notification permission.");
    }
  };

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("notif-prompt-dismissed", "true");
  };

  if (dismissed || permission === "granted" || permission === "unsupported") return null;

  return (
    <Card className={`border-michigan-teal/20 bg-michigan-teal/5 ${className}`}>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-michigan-teal/10 flex-shrink-0">
            <Bell className="h-4 w-4 text-michigan-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Stay Updated</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get notified when new urgent care opens near you, health alerts, or community events.
                </p>
              </div>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1" aria-label="Dismiss">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {permission === "denied" ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BellOff className="h-3 w-3" /> Notifications blocked — enable in browser settings
                </span>
              ) : (
                <>
                  <Button size="sm" onClick={requestPermission} className="h-7 text-xs gap-1">
                    <Bell className="h-3 w-3" /> Enable Notifications
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismiss} className="h-7 text-xs">
                    Not now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
