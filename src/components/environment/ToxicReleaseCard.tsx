import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Factory } from "lucide-react";
import { getTRIByCounty } from "@/data/epa-tri";

interface Props {
  county: string;
}

export default function ToxicReleaseCard({ county }: Props) {
  const facilities = getTRIByCounty(county);
  if (facilities.length === 0) return null;

  const totalPounds = facilities.reduce((sum, f) => sum + f.totalPoundsReleased, 0);
  const hasCarcinogens = facilities.some((f) => f.carcinogensReleased);
  const top3 = facilities.slice(0, 3);

  return (
    <Card className="border-michigan-coral/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Factory className="h-4 w-4 text-michigan-coral" />
          <h4 className="text-sm font-semibold text-foreground">Toxic Release Inventory</h4>
          {hasCarcinogens && (
            <Badge variant="destructive" className="text-[9px] gap-1 ml-auto">
              <AlertTriangle className="h-2.5 w-2.5" /> Carcinogens
            </Badge>
          )}
        </div>

        <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-foreground">
          {facilities.length} {facilities.length === 1 ? "facility" : "facilities"} reporting toxic releases in {county} County — {(totalPounds / 1000000).toFixed(1)} million pounds released in 2022
        </div>

        <div className="space-y-2">
          {top3.map((f) => (
            <div key={`${f.name}-${f.zip}`} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {f.industry} · Top chemical: {f.topChemical}
                  {f.carcinogensReleased && <span className="text-michigan-coral ml-1">(carcinogen)</span>}
                </p>
              </div>
              <span className="text-muted-foreground whitespace-nowrap">
                {f.totalPoundsReleased >= 1000000
                  ? `${(f.totalPoundsReleased / 1000000).toFixed(1)}M lbs`
                  : `${(f.totalPoundsReleased / 1000).toFixed(0)}K lbs`}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground">
          Source: EPA TRI 2022 reporting year. enviro.epa.gov/triexplorer
        </p>
      </CardContent>
    </Card>
  );
}
