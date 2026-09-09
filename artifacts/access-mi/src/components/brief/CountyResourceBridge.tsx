/**
 * County resource bridge (compact).
 *
 * A county brief that reports a shortage should not stop at the number. This
 * panel reads the same published county figures the brief renders, decides
 * which shortages are actually present, and lists a few real local programs
 * for each one. The full list lives on /county/<slug>/help.
 *
 * Detection rules live in @/lib/countyShortages so the brief and the help page
 * cannot drift apart. Program rendering lives in ShortageBlock.
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { detectShortages } from "@/lib/countyShortages";
import ShortageBlock from "@/components/brief/ShortageBlock";
import { countyToSlug } from "@/utils/countyUtils";

const BRIDGE_PREVIEW_LIMIT = 3;

export default function CountyResourceBridge({
  county,
}: {
  county?: string | null;
}) {
  if (!county) return null;
  const { shortages, unassessed } = detectShortages(county);
  const helpHref = `/county/${countyToSlug(county)}/help`;

  return (
    <Card className="border-primary/20">
      <CardContent className="py-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <LifeBuoy className="h-4 w-4 text-primary" />
            What to do about it in {county} County
          </h3>
          <p className="text-xs text-muted-foreground">
            Each shortage below crossed a published threshold in this county.
            Programs are drawn from care sites verified in {county} County, the
            Access Michigan resource directory, and assistance programs shown
            with their coverage area.
          </p>
        </div>

        {shortages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No tracked shortage crossed its threshold in this county on the
            figures above. For help with a specific need, call 2-1-1 or use the
            resource directory.
          </p>
        ) : (
          <div className="space-y-3">
            {shortages.map((s) => (
              <ShortageBlock
                key={s.id}
                county={county}
                shortage={s}
                limit={BRIDGE_PREVIEW_LIMIT}
              />
            ))}
          </div>
        )}

        <Link
          to={helpHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline decoration-primary/30 hover:decoration-primary"
        >
          See every program in {county} County
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {unassessed.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            Not yet assessed for this county: {unassessed.join("; ")}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
