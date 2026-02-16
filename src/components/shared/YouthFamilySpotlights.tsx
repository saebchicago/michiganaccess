import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Users, Heart, Baby, Gamepad2, Share2 } from "lucide-react";
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
    title: "YMCA of Michigan",
    description: "Youth development, healthy living, and social responsibility programs including after-school care, swim lessons, and day camps.",
    eligibility: ["youth", "families"],
    url: "https://ymcadetroit.org",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Boys & Girls Clubs of Michigan",
    description: "Safe after-school and summer programs for youth ages 6–18 with academic support, leadership, and healthy lifestyle activities.",
    eligibility: ["youth", "teens"],
    url: "https://www.bgca.org/get-involved/find-a-club",
    icon: <Gamepad2 className="h-5 w-5" />,
  },
  {
    title: "Michigan 4-H Youth Development",
    description: "MSU Extension 4-H programs in STEM, agriculture, leadership, and community service for youth in all 83 Michigan counties.",
    eligibility: ["youth", "teens"],
    url: "https://www.canr.msu.edu/4h/",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    title: "Big Brothers Big Sisters of Michigan",
    description: "One-to-one youth mentoring programs matching adult volunteers with children facing adversity for lasting, positive outcomes.",
    eligibility: ["youth", "mentors"],
    url: "https://www.bfrb.org",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Head Start / Early Head Start",
    description: "Federally funded early childhood education, nutrition, and family support for low-income families with children birth to age 5.",
    eligibility: ["children", "low-income"],
    url: "https://www.michigan.gov/mde/services/early-learners/head-start",
    icon: <Baby className="h-5 w-5" />,
  },
  {
    title: "Detroit PAL Youth Sports",
    description: "Free and low-cost youth sports leagues in football, basketball, baseball, and more for Detroit-area children and teens.",
    eligibility: ["youth", "teens"],
    url: "https://www.detroitpal.org",
    icon: <Gamepad2 className="h-5 w-5" />,
    counties: ["Wayne"],
  },
  {
    title: "West Michigan Youth Services",
    description: "Comprehensive youth programs including housing, counseling, and life skills for at-risk and homeless youth in West Michigan.",
    eligibility: ["youth", "at-risk"],
    url: "https://www.wmys.org",
    icon: <Heart className="h-5 w-5" />,
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan"],
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

const YouthFamilySpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="youth-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="youth-heading" className="text-2xl font-bold text-foreground">
            Youth & Family
          </h2>
          <p className="mt-2 text-muted-foreground">
            Programs for {county ? `${county} County` : "Michigan"} youth, children, and families
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

export default YouthFamilySpotlights;
