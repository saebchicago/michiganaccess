import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

export default function PartnerCTABar({ context }: { context?: "brief" | "compare" | "utility" }) {
  const href = context === "utility" ? "/partners/utilities-regulators"
    : "/partnerships/health-systems";

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row items-center gap-3 print:hidden">
      <Building2 className="h-4 w-4 text-primary shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        Using this for CHNA, VBC, or utility planning?
      </p>
      <Button size="sm" variant="outline" className="text-xs gap-1 shrink-0" asChild>
        <Link to={href}>
          Talk with Access Michigan <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
