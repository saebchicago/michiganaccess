import { Link } from "react-router-dom";
import { Heart, Phone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HealthSafetyCallout = () => (
  <Card className="border-michigan-coral/20 bg-michigan-coral/5">
    <CardContent className="py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10 flex-shrink-0">
          <Heart className="h-5 w-5 text-michigan-coral" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Health & Safety Resources</h3>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>In crisis?</strong> Call <strong>988</strong> (Suicide & Crisis Lifeline) · Text HOME to 741741.
            Find support groups, mental health services, and wellness resources.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Link to="/support">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ArrowRight className="mr-1 h-3 w-3" />Support Groups
              </Button>
            </Link>
            <Link to="/wellness">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ArrowRight className="mr-1 h-3 w-3" />Prevention & Wellness
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default HealthSafetyCallout;
