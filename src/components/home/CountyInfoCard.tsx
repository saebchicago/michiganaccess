import { motion } from "framer-motion";
import { Users, MapPin, Activity, TrendingDown, TrendingUp, Minus, Building2 } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { useFacilities } from "@/hooks/useFacilities";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trendIcon = (trend?: "up" | "down" | "stable") => {
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-[hsl(var(--forest-green))]" />;
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-[hsl(var(--coral))]" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const CountyInfoCard = () => {
  const { county } = useCounty();
  const profile = county ? getCountyProfile(county) : null;
  const { data: facilities = [] } = useFacilities(undefined, county);
  const { data: resources = [] } = useCommunityResources(undefined, county);

  if (!county || !profile) return null;

  const population = profile.population
    ? profile.population.toLocaleString()
    : "Data unavailable";

  return (
    <section className="container py-6" aria-label={`${county} County overview`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-primary/10 bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {county} County
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs font-normal capitalize">
                    {profile.countyType}
                  </Badge>
                  {profile.population > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Pop. {population}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                <MapPin className="h-4.5 w-4.5 text-primary" />
              </div>
            </div>

            {/* Major Cities */}
            {profile.majorCities.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Major Communities</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.majorCities.map((city) => (
                    <Badge key={city} variant="outline" className="text-xs font-normal">
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-md bg-secondary/60 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Facilities</span>
                </div>
                <p className="text-xl font-bold text-foreground">{facilities.length}</p>
              </div>
              <div className="rounded-md bg-secondary/60 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Resources</span>
                </div>
                <p className="text-xl font-bold text-foreground">{resources.length}</p>
              </div>
            </div>

            {/* Health Highlights */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="h-3.5 w-3.5 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">Key Health Indicators</p>
              </div>
              <div className="space-y-1.5">
                {profile.healthHighlights.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">{h.label}</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {h.value}
                      {trendIcon(h.trend)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/60">
                Sources: U.S. Census Bureau, County Health Rankings, USDA
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default CountyInfoCard;
