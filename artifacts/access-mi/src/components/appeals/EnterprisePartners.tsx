import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EnterprisePartners = () => (
  <section className="space-y-6" aria-labelledby="enterprise-heading">
    <Card className="bg-gradient-michigan text-primary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="relative pt-8 pb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <Badge className="bg-white/20 text-white border-white/30">
              <Building2 className="h-3 w-3 mr-1" />
              Health System Partners
            </Badge>
            <h2 id="enterprise-heading" className="text-2xl font-bold">
              Integrate Access Michigan Into Your CHNA Reporting
            </h2>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-lg">
              Track community benefit metrics, insurance appeal outcomes, and population health impact 
              for IRS Form 990 Schedule H and CHNA reporting. White-label available for health system websites.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" asChild>
                <Link to="/partnerships">
                  Partner With Us <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/impact">
                  <BarChart3 className="h-3 w-3" />
                  View Impact Data
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { label: "Community Health", stat: "Impact Tracking" },
              { label: "Grant Reporting", stat: "Automated Metrics" },
              { label: "White-Label", stat: "Your Brand" },
              { label: "CHNA Compliant", stat: "IRS Schedule H" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-primary-foreground/70">{item.label}</p>
                <p className="text-sm font-semibold">{item.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
);

export default EnterprisePartners;
