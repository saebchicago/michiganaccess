import { Link } from "react-router-dom";
import { Bus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TransportationCallout = () => (
  <Card className="border-michigan-teal/20 bg-michigan-teal/5">
    <CardContent className="py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10 flex-shrink-0">
          <Bus className="h-5 w-5 text-michigan-teal" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Need Transportation?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Find public transit, medical rides, senior transportation, and accessible services across Michigan.
          </p>
          <Link to="/transportation">
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
              <ArrowRight className="mr-1 h-3 w-3" />Transportation Resources
            </Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TransportationCallout;
