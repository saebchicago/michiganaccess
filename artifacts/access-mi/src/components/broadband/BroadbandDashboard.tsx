import { ExternalLink, Wifi } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const FCC_LINKS = [
  {
    body: "FCC Broadband Map",
    url: "https://broadbandmap.fcc.gov",
    label: "Coverage and availability by location",
  },
  {
    body: "NTIA BEAD Program — Michigan",
    url: "https://www.ntia.gov/broadband/grants/bead",
    label: "BEAD allocation and grant details",
  },
];

export default function BroadbandDashboard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wifi className="h-5 w-5 text-primary" />
          Michigan Broadband Coverage
        </CardTitle>
        <CardDescription>
          Broadband availability and BEAD funding data for Michigan are
          published by the FCC and NTIA. View current coverage figures and
          county-level unserved rates at the FCC Broadband Map.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {FCC_LINKS.map((item) => (
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
          FCC Broadband Data Collection is updated twice yearly. Michigan
          received $1.559 billion in BEAD funding (NTIA, 2024) for expanding
          access to unserved and underserved locations.
        </p>
      </CardContent>
    </Card>
  );
}
