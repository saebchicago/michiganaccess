import { Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  /** e.g. "Census ACS 5-Year" */
  source?: string;
  /** e.g. "2023" or "Dec 2024" */
  vintage?: string;
  /** Freshness relative description */
  freshness?: string;
  methodologyHref?: string;
}

export default function DataFreshnessBadge({
  source = "Census ACS 5-Year",
  vintage = "2023",
  freshness = "Updated annually",
  methodologyHref = "/methodology",
}: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-[10px] gap-1 cursor-help border-border bg-muted/40 text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <Clock className="h-2.5 w-2.5" />
            {source} · {vintage}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs mb-1">
            <strong>Data source:</strong> {source} ({vintage})
          </p>
          <p className="text-xs text-muted-foreground mb-2">{freshness}</p>
          <Link
            to={methodologyHref}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            View methodology <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
