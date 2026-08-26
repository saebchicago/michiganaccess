import {
  OPPORTUNITY_ACTIONS,
  type OpportunityAction,
  type OpportunityActionStatus,
  type OpportunityDomain,
} from "@/data/opportunityAtlas";

function day(value: string): number {
  const parsed = Date.parse(`${value}T23:59:59Z`);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid opportunity action date: ${value}`);
  return parsed;
}

export function deriveOpportunityActionStatus(
  action: OpportunityAction,
  now = new Date(),
): OpportunityActionStatus {
  const nowMs = now.getTime();

  if (action.opensOn && nowMs < day(action.opensOn)) return "opens-soon";

  if (action.closesOn && nowMs > day(action.closesOn)) {
    return "next-cycle";
  }

  if (action.opensOn || action.closesOn) return "available-now";
  if (action.recurring) return "next-cycle";
  return "resource";
}

export type CurrentOpportunityAction = OpportunityAction & {
  status: OpportunityActionStatus;
};

/** Return a fresh status on every page load so dated grants stop presenting as
 * open after their deadline without requiring a code deployment. Source dates
 * still need periodic verification because publishers can change a program. */
export function getCurrentOpportunityActions(
  domains: OpportunityDomain[],
  now = new Date(),
): CurrentOpportunityAction[] {
  const wanted = new Set(domains);
  return OPPORTUNITY_ACTIONS.filter((action) => wanted.has(action.domain)).map(
    (action) => ({
      ...action,
      status: deriveOpportunityActionStatus(action, now),
    }),
  );
}
