import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InsightNarrativeProps {
  eyebrow?: string;
  title: string;
  summary: string;
  explanation: string;
  source?: string;
}

export default function InsightNarrative({
  eyebrow = "What this means",
  title,
  summary,
  explanation,
  source,
}: InsightNarrativeProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border/60 bg-background/95 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
            <Info className="mr-1 h-3 w-3" />
            {eyebrow}
          </Badge>
          {source ? (
            <span className="text-xs text-muted-foreground">
              Source: {source}
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto px-0 text-sm text-primary hover:bg-transparent">
              Explain the data
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 text-sm leading-6 text-muted-foreground">
            {explanation}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
