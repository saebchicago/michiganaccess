import { Link } from "react-router-dom";
import { Leaf, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EnvironmentCallout = () => (
  <Card className="border-michigan-forest/20 bg-michigan-forest/5">
    <CardContent className="py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10 flex-shrink-0">
          <Leaf className="h-5 w-5 text-michigan-forest-deep" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Environment & Sustainability</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Check air quality, water safety, clean energy progress, Great Lakes conservation, and environmental justice data across Michigan.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Link to="/environment">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ArrowRight className="mr-1 h-3 w-3" />Environment Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default EnvironmentCallout;
