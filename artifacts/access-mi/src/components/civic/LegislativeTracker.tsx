import { ExternalLink, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const LEGISLATIVE_LINKS = [
  {
    body: "Open States Michigan",
    url: "https://openstates.org/mi/",
    label: "Bills, votes, and sponsors",
  },
  {
    body: "Michigan Legislature Bill Search",
    url: "https://www.legislature.mi.gov/Bills",
    label: "Official bill text and status",
  },
];

export function LegislativeTracker() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-5 w-5 text-primary" />
          Michigan Legislative Activity
        </CardTitle>
        <CardDescription>
          Current bill status and legislative activity from the Michigan
          Legislature and Open States.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {LEGISLATIVE_LINKS.map((item) => (
            <div
              key={item.body}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-semibold text-foreground">{item.body}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
              >
                {item.label} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Live bill tracking requires an Open States API key. Current bills and
          session activity are available directly at the links above.
        </p>
      </CardContent>
    </Card>
  );
}
