import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Zap, Home, Leaf, DollarSign, Share2 } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";

interface Program {
  title: string;
  description: string;
  eligibility: string[];
  url: string;
  icon: React.ReactNode;
  counties?: string[];
}

const PROGRAMS: Program[] = [
  {
    title: "Michigan Home Energy Rebate (MiHER)",
    description: "Federal rebates up to $8,000 for home energy efficiency upgrades including insulation, HVAC, and heat pumps.",
    eligibility: ["homeowners", "families"],
    url: "https://www.michigan.gov/egle/about/organization/materials-management/energy/mi-home-energy-rebate",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "LIHEAP Heating Assistance",
    description: "Low-Income Home Energy Assistance Program helps pay heating bills. Apply through your local MDHHS office.",
    eligibility: ["low-income", "seniors"],
    url: "https://www.michigan.gov/mdhhs/assistance-programs/energy",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "Michigan Saves Clean Energy Financing",
    description: "Low-interest loans for energy-efficient home improvements including solar panels, insulation, and appliances.",
    eligibility: ["homeowners"],
    url: "https://michigansaves.org",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: "DTE Energy Efficiency Programs",
    description: "Free energy audits, appliance rebates, and weatherization assistance for DTE customers across Southeast Michigan.",
    eligibility: ["homeowners", "renters"],
    url: "https://www.dteenergy.com/us/en/residential/save-money-energy.html",
    icon: <Zap className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Macomb", "Monroe", "Washtenaw", "Lenawee", "St. Clair"],
  },
  {
    title: "Consumers Energy Efficiency Rebates",
    description: "Rebates on efficient appliances, smart thermostats, and home weatherization for Consumers Energy customers.",
    eligibility: ["homeowners", "renters"],
    url: "https://www.consumersenergy.com/residential/save-money-and-energy",
    icon: <Leaf className="h-5 w-5" />,
    counties: ["Kent", "Kalamazoo", "Jackson", "Ingham", "Bay", "Saginaw", "Muskegon", "Grand Traverse"],
  },
  {
    title: "Weatherization Assistance Program",
    description: "Free home weatherization for income-eligible households - insulation, air sealing, and furnace repair.",
    eligibility: ["low-income", "seniors"],
    url: "https://www.michigan.gov/egle/about/organization/materials-management/energy/weatherization",
    icon: <Home className="h-5 w-5" />,
  },
];

const handleShare = async (program: Program) => {
  const shareData = { title: program.title, text: program.description, url: program.url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const EnergySpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="energy-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="energy-heading" className="text-2xl font-bold text-foreground">
            Energy & Utility Assistance
          </h2>
          <p className="mt-2 text-muted-foreground">
            Rebates and assistance programs for {county ? `${county} County` : "Michigan"} residents
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10 text-michigan-forest-deep shrink-0">
                        {program.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{program.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{program.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {program.eligibility.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] capitalize">{tag}</Badge>
                      ))}
                      {!program.counties && <Badge variant="outline" className="text-[10px]">Statewide</Badge>}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={program.url} target="_blank" rel="noopener noreferrer">
                          Go to Program <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => handleShare(program)} aria-label={`Share ${program.title}`}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default EnergySpotlights;
