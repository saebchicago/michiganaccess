import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ArrowRight, Heart, MapPin, Shield, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface Persona {
  id: string;
  icon: React.ReactNode;
  title: string;
  location: string;
  situation: string;
  solution: string;
  successStory: string;
  links: { label: string; href: string }[];
  color: string;
}

const PERSONAS: Persona[] = [
  {
    id: "maria",
    icon: <Heart className="h-6 w-6" />,
    title: "Uninsured Essential Worker",
    location: "Detroit, Wayne County",
    situation: "Maria's dental claim was denied by Medicaid after she finally got coverage through Healthy Michigan Plan.",
    solution: "Used our Medicaid Fair Hearing template → benefits continued during appeal → approval in 21 days.",
    successStory: "\"I didn't know I could fight back. The template made it so easy—I just filled in my information and mailed it.\"",
    links: [
      { label: "Financial assistance", href: "/financial-help" },
      { label: "Free clinics nearby", href: "/find-care" },
    ],
    color: "bg-primary/10 text-primary",
  },
  {
    id: "dorothy",
    icon: <MapPin className="h-6 w-6" />,
    title: "Rural Senior on Medicare",
    location: "Traverse City, Grand Traverse County",
    situation: "Dorothy's Medicare Advantage plan denied physical therapy for her hip replacement recovery.",
    solution: "Built an appeal letter using CMS coverage criteria → peer-to-peer review → PT approved for 12 weeks.",
    successStory: "\"My doctor said the PT was critical. The appeal letter helped me explain why in terms the insurance company understood.\"",
    links: [
      { label: "Medicare appeal guide", href: "#ai-generator" },
      { label: "Transportation help", href: "/transportation" },
    ],
    color: "bg-accent/10 text-accent",
  },
  {
    id: "james",
    icon: <Shield className="h-6 w-6" />,
    title: "Employer Plan Worker",
    location: "Grand Rapids, Kent County",
    situation: "James's employer-sponsored HAP plan denied an MRI, calling it 'not medically necessary.'",
    solution: "Filed DIFS external review with supporting documentation → independent reviewer overturned denial in 30 days.",
    successStory: "\"I saved $3,200. The external review process was free and the reviewer actually looked at my medical records.\"",
    links: [
      { label: "DIFS external review", href: "#flowchart" },
      { label: "Quality ratings", href: "/quality" },
    ],
    color: "bg-primary/10 text-primary",
  },
];

const PersonaCarousel = () => {
  return (
    <section className="space-y-6" aria-labelledby="personas-heading">
      <div className="text-center space-y-2">
        <h2 id="personas-heading" className="text-2xl font-bold text-foreground">
          How the Appeals Process Works: Example Scenarios
        </h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          The following are illustrative examples based on real Michigan appeal pathways, not verified individual cases.
        </p>
      </div>

      <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-4xl mx-auto">
        <CarouselContent>
          {PERSONAS.map((persona) => (
            <CarouselItem key={persona.id} className="md:basis-1/2 lg:basis-1/1">
              <Card className="h-full hover-lift">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${persona.color}`}>
                      {persona.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{persona.title}</h3>
                      <p className="text-xs text-muted-foreground">{persona.location}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-muted-foreground/30 text-muted-foreground shrink-0">
                      <Info className="h-2.5 w-2.5 mr-0.5" /> Illustrative
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">The Challenge</Badge>
                      <p className="text-sm text-muted-foreground">{persona.situation}</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1 bg-accent/10 text-accent">The Solution</Badge>
                      <p className="text-sm text-foreground">{persona.solution}</p>
                    </div>
                  </div>

                  <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                    {persona.successStory}
                  </blockquote>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {persona.links.map((link) => (
                      <Button key={link.label} variant="outline" size="sm" asChild>
                        {link.href.startsWith("#") ? (
                          <a href={link.href}>
                            {link.label} <ArrowRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <Link to={link.href}>
                            {link.label} <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
};

export default PersonaCarousel;
