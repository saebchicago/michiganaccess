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
    // 2. Open weather.com in new tab
    window.open("https://www.weather.com", "_blank", "noopener,noreferrer");
    // 3. Replace current history entry so back button can't return
    window.location.replace("https://www.google.com/search?q=Michigan+weather");
  }, []);

  // Escape key handler (skip when typing in form fields)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        // Don't trigger if a Radix popover, dialog, sheet, or dropdown is open
        if (document.querySelector('[data-radix-popper-content-wrapper], [role="dialog"], [data-state="open"]')) return;
        e.preventDefault();
        triggerExit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [triggerExit]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] lg:bottom-auto lg:top-0 lg:relative print:hidden"
      role="region"
      aria-label="Quick exit — leave this site immediately"
    >
      <button
        onClick={triggerExit}
        className="flex w-full items-center justify-center gap-2 bg-destructive py-2 text-destructive-foreground text-xs font-bold tracking-wide uppercase hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors min-h-[44px]"
        aria-label="Quick exit — leave this site immediately (also press Escape)"
        title="Leave this site immediately"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span>Quick Exit</span>
        <kbd className="ml-1 rounded border border-destructive-foreground/30 bg-destructive-foreground/10 px-1.5 py-0.5 font-mono text-[10px]">
          ESC
        </kbd>
      </button>
    </div>
  );
}
