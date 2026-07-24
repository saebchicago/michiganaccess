import type { IntegrityLabel } from "@/types/chna";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";

interface IntegrityBadgeProps {
  label: IntegrityLabel;
  /** Source organization (e.g. "CDC PLACES"). Shown in the popover. */
  source?: string;
  /** Data vintage (e.g. "2022 5-Year ACS"). Shown in the popover. */
  vintage?: string;
  className?: string;
}

/**
 * Thin wrapper around the platform-wide ProvenanceTag (shared/ProvenanceTag.tsx)
 * kept at this path/export name so existing call sites and vi.mock() targets
 * across the CHNA surfaces don't need to change. VERIFIED / MODELED /
 * PROJECTED / PENDING must read identically everywhere on the platform -
 * ProvenanceTag is now the single implementation both names render.
 */
export function IntegrityBadge({
  label,
  source,
  vintage,
  className,
}: IntegrityBadgeProps) {
  return (
    <ProvenanceTag
      label={label}
      source={source}
      vintage={vintage}
      className={className}
    />
  );
}
