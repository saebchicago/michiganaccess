import { Link } from "react-router-dom";
import { Landmark, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CivicDataCallout = () => (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Landmark className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Civic Data & Open Government</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Explore Michigan's budget transparency, FOIA tracking, voter engagement data, elected officials, and public meeting schedules.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Link to="/civic-data">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ArrowRight className="mr-1 h-3 w-3" />Open Government Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CivicDataCallout;
