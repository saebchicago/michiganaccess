import { ExternalLink } from "lucide-react";

/**
 * FloatingFeedback — minimal pill button fixed at bottom-left.
 * Opens mailto link on click; no modal, no state.
 */
export default function FloatingFeedback() {
  return (
    <a
      href="mailto:feedback@accessmichigan.org"
      className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 shadow-sm text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-colors"
      aria-label="Report an issue"
    >
      <ExternalLink className="h-[14px] w-[14px]" aria-hidden="true" />
      Report an issue
    </a>
  );
}
