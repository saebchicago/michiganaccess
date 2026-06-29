import { Link } from "react-router-dom";
import { ExternalLink, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateEJPathwayReportPDF } from "@/utils/generateEJPathwayReport";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import type { CausalPathway } from "@/data/causalPathways";

interface CausalPathwayCardProps {
  pathway: CausalPathway;
}

function confidenceTone(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-slate-400";
}

export default function CausalPathwayCard({ pathway }: CausalPathwayCardProps) {
  const languageLabel =
    pathway.languageStandard === "evidence-backed"
      ? "Evidence-backed linkage"
      : "Associative linkage";

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{pathway.title}</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pathway.summary}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {languageLabel}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              Confidence score: {pathway.confidenceScore}%
            </span>
            <span className="text-muted-foreground">
              Reviewed {pathway.lastReviewed}
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
            role="img"
            aria-label={`Confidence score ${pathway.confidenceScore} percent`}
          >
            <div
              className={`h-full rounded-full ${confidenceTone(pathway.confidenceScore)}`}
              style={{ width: `${pathway.confidenceScore}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {pathway.confidenceRationale}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="steps" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                View pathway steps
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="space-y-4 pl-1">
                {pathway.steps.map((step, index) => (
                  <li key={step.id} className="relative pl-6">
                    <span
                      className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {step.label}
                      </h3>
                      <IntegrityBadge
                        label={step.integrityLabel}
                        source={step.sources[0]?.name}
                        vintage={step.sources[0]?.vintage}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.sources.map((src) => (
                        <li key={`${step.id}-${src.name}`}>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            {src.name} ({src.vintage})
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-wrap gap-2 pt-1 items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => generateEJPathwayReportPDF(pathway.id)}
          >
            <Download className="h-3 w-3" /> Export PDF
          </Button>
          {pathway.relatedRoutes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className="text-xs rounded-full border px-3 py-1 text-primary hover:bg-primary/5 transition-colors"
            >
              {route.label}
            </Link>
          ))}
          <Link
            to="/methodology"
            className="text-xs rounded-full border px-3 py-1 text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            Full methodology
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}