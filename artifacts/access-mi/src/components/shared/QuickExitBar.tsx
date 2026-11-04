import { useCallback } from "react";
import { LogOut } from "lucide-react";

export default function QuickExitBar() {
  const triggerExit = useCallback(() => {
    // 1. Hide all visible content immediately
    document.body.style.visibility = "hidden";
    // 2. Replace the current history entry with a neutral site
    window.location.replace("https://www.weather.com");
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] sm:bottom-auto sm:top-0 sm:relative print:hidden"
      role="region"
      aria-label="Quick exit - leave this site immediately"
    >
      <div className="flex w-full flex-col items-center bg-destructive py-1.5">
        <button
          onClick={triggerExit}
          className="flex items-center justify-center gap-2 py-1 text-destructive-foreground text-xs font-bold tracking-wide uppercase hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors min-h-[44px] w-full"
          aria-label="Quick exit - leave this site immediately"
          title="Quick exit - leave this site immediately"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Quick Exit</span>
        </button>
      </div>
    </div>
  );
}
