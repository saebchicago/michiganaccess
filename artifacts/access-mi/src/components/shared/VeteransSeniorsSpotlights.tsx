import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Shield, Heart, Users, Award, Share2 } from "lucide-react";
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
    title: "Michigan Veterans Affairs Agency",
    description: "Connects Michigan veterans and families to federal/state benefits, healthcare, education, and employment services.",
    eligibility: ["veterans", "families"],
    url: "https://www.michigan.gov/mvaa",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "VFW Michigan Programs",
    description: "Veterans of Foreign Wars posts across Michigan offering camaraderie, advocacy, emergency financial assistance, and community service.",
    eligibility: ["veterans"],
    url: "https://vfwmi.org",
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: "AARP Michigan",
    description: "Resources for adults 50+ including Medicare guidance, fraud prevention, caregiving support, and community engagement.",
    eligibility: ["seniors", "50+"],
    url: "https://states.aarp.org/michigan",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Area Agency on Aging 1-B",
    description: "In-home services, meals, transportation, caregiver support, and Medicare/Medicaid counseling for Southeast Michigan seniors.",
    eligibility: ["seniors", "caregivers"],
    url: "https://www.aaa1b.org",
    icon: <Heart className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Macomb", "Monroe", "Washtenaw", "Livingston", "St. Clair"],
  },
  {
    title: "Senior Resources of West Michigan",
    description: "Aging support services including Meals on Wheels, adult day care, respite care, and benefits counseling in West Michigan.",
    eligibility: ["seniors", "caregivers"],
    url: "https://www.seniorresourceswmi.org",
    icon: <Heart className="h-5 w-5" />,
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm", "Newaygo"],
  },
  {
    title: "DAV Michigan",
    description: "Disabled American Veterans providing free claims assistance, transportation to VA medical centers, and employment programs.",
    eligibility: ["veterans", "disabled veterans"],
    url: "https://www.dav.org/veterans/find-your-local-office/",
    icon: <Shield className="h-5 w-5" />,
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

const VeteransSeniorsSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="veterans-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="veterans-heading" className="text-2xl font-bold text-foreground">
            Veterans & Seniors
          </h2>
          <p className="mt-2 text-muted-foreground">
            Support services for {county ? `${county} County` : "Michigan"} veterans and older adults
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
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

export default VeteransSeniorsSpotlights;
