/**
 * Preliminary eligibility evaluation. Computes "may qualify" / "may
 * not qualify" against each program's income test and required
 * categorical conditions. Returns plain results the UI renders with
 * the official-portal apply link.
 *
 * Hard rule: this is never a determination. The function returns
 * "may qualify"; the UI never strips the "may". Every result is
 * paired with the sourced threshold and a link to the official
 * portal.
 */

import {
  BENEFITS_PROGRAMS,
  type ApplicantCondition,
  type BenefitsProgram,
  fplAnnual,
  thresholdAtFplMultiplier,
} from "@/data/benefitsRules";

export interface ScreenerInput {
  householdSize: number;
  annualIncome: number;
  conditions: ApplicantCondition[];
}

export interface ScreenerResultEntry {
  program: BenefitsProgram;
  /** Annual income threshold computed from the FPL anchor. */
  thresholdAnnual: number;
  /** "may_qualify" / "may_not_qualify_income" / "may_not_qualify_category". */
  outcome:
    | "may_qualify"
    | "may_not_qualify_income"
    | "may_not_qualify_category";
  /** Plain-English explanation surfaced under the result card. */
  reason: string;
}

export interface ScreenerResults {
  fplBaseAnnual: number;
  incomeAsPercentOfFpl: number;
  mayQualify: ScreenerResultEntry[];
  mayNotQualify: ScreenerResultEntry[];
}

function meetsCategorical(
  program: BenefitsProgram,
  conditions: ApplicantCondition[],
): boolean {
  if (!program.requiredAny || program.requiredAny.length === 0) return true;
  return program.requiredAny.some((c) => conditions.includes(c));
}

export function evaluatePrograms(input: ScreenerInput): ScreenerResults {
  const { householdSize, annualIncome, conditions } = input;
  const fplBaseAnnual = fplAnnual(householdSize);
  const incomeAsPercentOfFpl =
    fplBaseAnnual > 0 ? Math.round((annualIncome / fplBaseAnnual) * 100) : 0;

  const mayQualify: ScreenerResultEntry[] = [];
  const mayNotQualify: ScreenerResultEntry[] = [];

  for (const program of BENEFITS_PROGRAMS) {
    const thresholdAnnual = thresholdAtFplMultiplier(
      householdSize,
      program.fplMultiplier,
    );

    if (!meetsCategorical(program, conditions)) {
      mayNotQualify.push({
        program,
        thresholdAnnual,
        outcome: "may_not_qualify_category",
        reason:
          "Categorical condition not selected (for example, having a child under 5 for WIC).",
      });
      continue;
    }

    if (annualIncome <= thresholdAnnual) {
      mayQualify.push({
        program,
        thresholdAnnual,
        outcome: "may_qualify",
        reason: `Estimated income is at or below ${program.ruleLabel}.`,
      });
    } else {
      mayNotQualify.push({
        program,
        thresholdAnnual,
        outcome: "may_not_qualify_income",
        reason: `Estimated income is above ${program.ruleLabel}. Some households still qualify after deductions or disregards.`,
      });
    }
  }

  return {
    fplBaseAnnual,
    incomeAsPercentOfFpl,
    mayQualify,
    mayNotQualify,
  };
}
