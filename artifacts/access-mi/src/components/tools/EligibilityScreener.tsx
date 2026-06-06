/**
 * Compatibility shim. The eligibility screener now lives at
 * `@/components/benefits/BenefitsScreener` and reads its income-test
 * rules from `@/data/benefitsRules`, which is the single source of
 * truth for benefits thresholds.
 *
 * This default export is preserved so existing call sites (currently
 * `FinancialHelpPage`) keep rendering the canonical screener without
 * needing a refactor in this PR.
 */
import { BenefitsScreener } from "@/components/benefits/BenefitsScreener";

export default function EligibilityScreener() {
  return <BenefitsScreener />;
}
