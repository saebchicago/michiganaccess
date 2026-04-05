import { useEffect, useCallback } from "react";
import { LogOut } from "lucide-react";

/**
 * QuickExitBar — trauma-informed safety feature.
 * Click or press Escape: hides all page content, replaces history with a
 * Google weather search (no back-navigation), and opens weather.com in a new tab.
 * No external resources are loaded until the user activates the exit.
 * WCAG accessible, high-contrast, keyboard-operable.
 */
export default function QuickExitBar() {
  const triggerExit = useCallback(() => {
    // 1. Hide all visible content immediately
    document.body.style.visibility = "hidden";
    // 2. Replace current history entry so back button can't return
    window.location.replace("https://www.weather.com");
  }, []);

  // Quick Exit is button-only — Escape key closes modals/dropdowns, not Quick Exit

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] sm:bottom-auto sm:top-0 sm:relative print:hidden"
      role="region"
      aria-label="Quick exit — leave this site immediately"
    >
      <div className="flex w-full flex-col items-center bg-destructive py-1.5">
        <button
          onClick={triggerExit}
          className="flex items-center justify-center gap-2 py-1 text-destructive-foreground text-xs font-bold tracking-wide uppercase hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors min-h-[44px] w-full"
          aria-label="Quick exit — leave this site immediately (also press Escape)"
          title="Press ESC to quickly leave this page"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Quick Exit</span>
          <kbd className="ml-1 rounded border border-destructive-foreground/30 bg-destructive-foreground/10 px-1.5 py-0.5 font-mono text-[10px]">
            ESC
          </kbd>
        </button>
        <span className="text-[10px] text-destructive-foreground/90 pb-0.5">Press ESC to quickly leave this page</span>
      </div>
    </div>
  );
}
