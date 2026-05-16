import { useEffect } from "react";
import { ShieldAlert, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DVSafetyInterstitial() {
  // Replace history so back button doesn't reveal DV content
  useEffect(() => {
    window.history.replaceState(null, "", "/find-care");
  }, []);

  return (
    <Card className="border-michigan-coral/30 bg-michigan-coral/5">
      <CardContent className="py-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-michigan-coral/10">
            <ShieldAlert className="h-5 w-5 text-michigan-coral" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Your safety comes first.</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              If someone may be monitoring your device, call from a safe phone:{" "}
              <a href="tel:1-800-799-7233" className="font-semibold text-foreground underline">
                1-800-799-7233
              </a>{" "}
              (National DV Hotline) or text <span className="font-semibold">START</span> to{" "}
              <span className="font-semibold">88788</span>. You can also chat at{" "}
              <a
                href="https://www.thehotline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline"
              >
                thehotline.org
              </a>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild className="h-9 bg-michigan-coral hover:bg-michigan-coral/90">
            <a href="tel:1-800-799-7233">
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call Hotline
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild className="h-9">
            <a href="sms:88788?body=START">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Text START to 88788
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
