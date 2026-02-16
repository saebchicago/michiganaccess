import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bus, Zap, TreePine, GraduationCap, Scale, Medal, Baby, ShieldAlert, Palette } from "lucide-react";
import CommunityProgramSpotlights from "./CommunityProgramSpotlights";
import TransportationSpotlights from "./TransportationSpotlights";
import EnergySpotlights from "./EnergySpotlights";
import EnvironmentSpotlights from "./EnvironmentSpotlights";
import EducationSpotlights from "./EducationSpotlights";
import LegalCivicSpotlights from "./LegalCivicSpotlights";
import VeteransSeniorsSpotlights from "./VeteransSeniorsSpotlights";
import YouthFamilySpotlights from "./YouthFamilySpotlights";
import DisasterPrepSpotlights from "./DisasterPrepSpotlights";
import CulturalRecSpotlights from "./CulturalRecSpotlights";

const SECTIONS = [
  { value: "community", label: "Community", icon: Heart, component: CommunityProgramSpotlights },
  { value: "transportation", label: "Transportation", icon: Bus, component: TransportationSpotlights },
  { value: "energy", label: "Energy", icon: Zap, component: EnergySpotlights },
  { value: "environment", label: "Environment", icon: TreePine, component: EnvironmentSpotlights },
  { value: "education", label: "Education", icon: GraduationCap, component: EducationSpotlights },
  { value: "legal", label: "Legal & Civic", icon: Scale, component: LegalCivicSpotlights },
  { value: "veterans", label: "Veterans & Seniors", icon: Medal, component: VeteransSeniorsSpotlights },
  { value: "youth", label: "Youth & Family", icon: Baby, component: YouthFamilySpotlights },
  { value: "disaster", label: "Disaster Prep", icon: ShieldAlert, component: DisasterPrepSpotlights },
  { value: "cultural", label: "Culture & Rec", icon: Palette, component: CulturalRecSpotlights },
] as const;

const SpotlightTabs = () => (
  <section className="py-12" aria-labelledby="spotlights-heading">
    <div className="container">
      <div className="text-center mb-6">
        <h2 id="spotlights-heading" className="text-2xl font-bold text-foreground">
          Explore Community Resources
        </h2>
        <p className="mt-2 text-muted-foreground">
          Browse programs across 10 service categories — filtered to your county
        </p>
      </div>
      <Tabs defaultValue="community" className="w-full">
        <TabsList className="flex flex-wrap justify-center gap-1 h-auto bg-transparent p-0 mb-2">
          {SECTIONS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium border border-border data-[state=active]:border-primary transition-colors"
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SECTIONS.map(({ value, component: Component }) => (
          <TabsContent key={value} value={value} className="mt-0">
            <Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  </section>
);

export default SpotlightTabs;
