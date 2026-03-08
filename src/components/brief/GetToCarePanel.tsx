/**
 * "Get to your appointment" transportation panel for Brief & health pages.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, ExternalLink, Phone } from "lucide-react";
import AskCopilotButton from "@/components/shared/AskCopilotButton";
import { useCommunityResources } from "@/hooks/useCommunityResources";

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline decoration-primary/30 hover:decoration-primary text-xs">
      {children} <ExternalLink className="h-3 w-3 shrink-0" />
      <span className="sr-only">(opens external site)</span>
    </a>
  );
}

export default function GetToCarePanel({ county, zip, coverageType }: { county?: string | null; zip?: string; coverageType?: string }) {
  const { data: transitResources } = useCommunityResources("transportation", county);
  const topResources = (transitResources ?? []).slice(0, 3);

  return (
    <Card className="border-primary/20">
      <CardContent className="py-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Bus className="h-4 w-4 text-primary" />
          Get to Your Appointment
        </h3>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Medicaid NEMT:</strong> If you have Medicaid (Healthy Michigan Plan), you may be eligible for free rides to medical appointments. This is called Non-Emergency Medical Transportation (NEMT). Many Medicaid health plans use transportation vendors — check your plan materials or{" "}
            <ExtLink href="https://newmibridges.michigan.gov">MI Bridges</ExtLink> for details.
          </p>
          <p>Call your health plan's member services line to schedule a ride, usually 2–3 days in advance.</p>
        </div>

        {topResources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">Local transit & ride programs{county ? ` in ${county} County` : ""}:</p>
            {topResources.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                <span>
                  {r.website ? <ExtLink href={r.website}>{r.resource_name}</ExtLink> : <strong>{r.resource_name}</strong>}
                  {r.phone && <> — <a href={`tel:${r.phone}`} className="text-primary underline">{r.phone}</a></>}
                </span>
              </div>
            ))}
          </div>
        )}

        <AskCopilotButton
          context={`transportation | ZIP: ${zip || "unknown"} | county: ${county || "unknown"} | coverage: ${coverageType || "unknown"} | Help this person find transportation to medical appointments. Cover Medicaid NEMT, local transit, and ride programs.`}
          label="Ask Copilot about getting to care"
        />
      </CardContent>
    </Card>
  );
}
