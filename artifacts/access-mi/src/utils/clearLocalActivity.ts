/**
 * Erase locally stored activity from this device.
 *
 * Why this is deny-by-default rather than a list of keys to delete:
 *
 * This site ships a Quick Exit control and a crisis bar, so its threat
 * model explicitly includes someone whose browser may be inspected by
 * another person. Meanwhile the app persists a lot to localStorage -
 * verbatim recent search terms ("mi-recent-searches"), the last 20 pages
 * viewed with human-readable labels ("mi-browsing-history"), ZIP, county,
 * eligibility profile, saved resources. Quick Exit hides the page and
 * replaces the history entry, but none of that touches localStorage, so
 * the record of the visit survives the exit.
 *
 * An allowlist of keys to *delete* would silently miss anything a future
 * feature adds - which is the same failure shape as the rest of this
 * audit. So this removes every key except a short list of display
 * preferences that reveal nothing about what a person looked for. New
 * storage is therefore covered automatically, and the only way to exempt
 * something is to add it to KEEP_KEYS deliberately, in a reviewable diff.
 *
 * See docs/audit-2026-07.md (S12, S13).
 */

/**
 * Keys preserved across a clear. These describe how the page looks, not
 * who the visitor is or what they searched for. Keeping them means a
 * high-contrast or dark-mode user does not lose their accessibility
 * setup as a side effect of covering their tracks.
 */
export const KEEP_KEYS: readonly string[] = [
  "accessmi-theme",
  "mi-theme",
  "high-contrast",
  "i18nextLng",
];

export interface ClearLocalActivityResult {
  /** Number of localStorage keys removed. */
  removed: number;
  /** Keys preserved because they are display preferences. */
  kept: string[];
}

export function clearLocalActivity(): ClearLocalActivityResult {
  const kept: string[] = [];
  let removed = 0;

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key !== null) keys.push(key);
    }
    for (const key of keys) {
      if (KEEP_KEYS.includes(key)) {
        kept.push(key);
        continue;
      }
      localStorage.removeItem(key);
      removed += 1;
    }
  } catch {
    /* localStorage unavailable (private mode, blocked cookies) */
  }

  try {
    sessionStorage.clear();
  } catch {
    /* sessionStorage unavailable */
  }

  return { removed, kept };
}
