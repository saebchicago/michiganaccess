import { ShieldCheck, Globe2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CitizenInitiativeBanner() {
  return (
    <Card className="border-dashed border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex gap-3 items-start">
          <ShieldCheck className="h-5 w-5 mt-0.5 text-primary shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Built by residents using public data.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Independent civic resource - not affiliated with any government agency.
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                <Globe2 className="h-3 w-3" aria-hidden="true" />
                Open Data
              </span>
              <span className="text-[10px] text-muted-foreground">Citizen Initiative</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
