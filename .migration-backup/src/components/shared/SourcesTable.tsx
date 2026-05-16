/**
 * SourcesTable — Reusable provenance table for Place pages.
 * Shows all data sources used on the page with citation metadata.
 */
import { ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlaceIndicator } from "@/models/Place";

interface SourcesTableProps {
  indicators: PlaceIndicator[];
}

export default function SourcesTable({ indicators }: SourcesTableProps) {
  // Deduplicate sources by source name
  const uniqueSources = Array.from(
    new Map(
      indicators.map((ind) => [
        ind.source,
        { source: ind.source, sourceUrl: ind.sourceUrl, updated: ind.updated, grain: ind.grain },
      ])
    ).values()
  );

  return (
    <section id="sources" className="space-y-3">
      <h3 className="text-lg font-bold text-foreground">Sources & Methodology</h3>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold">Source</TableHead>
              <TableHead className="text-xs font-semibold">Last Updated</TableHead>
              <TableHead className="text-xs font-semibold">Grain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueSources.map((s) => (
              <TableRow key={s.source}>
                <TableCell className="text-sm">
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {s.source}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.updated}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.grain}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Estimated indicators use proxy data and are clearly labeled.
        </span>
        <Link to="/contact" className="text-primary hover:underline">
          Report an issue / Suggest a dataset →
        </Link>
      </div>
    </section>
  );
}
