import { Baby } from "lucide-react";
import { Link } from "react-router-dom";
import {
  RX_KIDS_PROGRAM_FACTS,
  getRxKidsCommunities,
  isRxKidsActive,
} from "@/data/rx-kids";

interface RxKidsCalloutProps {
  county: string;
}

export default function RxKidsCallout({ county }: RxKidsCalloutProps) {
  const communities = getRxKidsCommunities(county);
  const active = isRxKidsActive(county);
  if (!active) return null;

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50 dark:bg-teal-950/20 p-4">
      <div className="flex items-start gap-3">
        <Baby className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Rx Kids - National Innovation</span>
            <span className="text-[9px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-semibold">ACTIVE IN {county.toUpperCase()}</span>
          </div>
          <p className="text-xs text-teal-800 dark:text-teal-300 mb-2">
            {RX_KIDS_PROGRAM_FACTS.operator} runs an unconditional cash prescription
            program for pregnant residents and new parents - $1,500 mid-pregnancy plus
            $500 a month after birth. Launched in Flint in {RX_KIDS_PROGRAM_FACTS.launchDate}.
          </p>
          <ul className="text-xs text-teal-800 dark:text-teal-300 mb-2 space-y-0.5">
            {communities.map((c) => (
              <li key={c.community}>
                <span className="font-semibold">{c.community}</span>
                {c.eligibilityStart && ` - eligible since ${c.eligibilityStart}`}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-teal-800 dark:text-teal-300">
            See full coverage and published outcomes on the{" "}
            <Link to="/early-childhood" className="underline">Early Childhood</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
}
