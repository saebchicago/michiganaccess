import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Shield } from "lucide-react";

const SchoolSafetyCallout = () => (
  <Card className="bg-muted/30 border-dashed">
    <CardContent className="py-4 flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shrink-0">
        <GraduationCap className="h-4 w-4 text-accent" />
      </div>
      <div>
        <p className="text-sm text-foreground">
          <Shield className="h-3.5 w-3.5 inline mr-1 text-primary" />
          Designed to complement school bus safety, digital hall pass, and family communication tools used by Michigan school districts.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Michigan Access supports student and family safety through better coordination with school transportation and health services.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default SchoolSafetyCallout;
