import { Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Lightweight below-fold callout for the Civic Data Hub.
 * Drop into Index.tsx without disrupting hero or pathways.
 */
export default function CivicDataCalloutCard() {
  return (
    <section className="py-6">
      <div className="container max-w-2xl">
        <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-6 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Database className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Explore Michigan Civic Intelligence
              </h3>
              <p className="text-xs text-muted-foreground">
                Browse open datasets from ArcGIS and Socrata — county boundaries, transportation, environment, housing, and public safety.
              </p>
            </div>
            <Link to="/civic-data-hub">
              <Button variant="default" size="sm" className="gap-1.5 whitespace-nowrap">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                Civic Data Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
