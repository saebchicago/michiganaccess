import { motion } from "framer-motion";
import { MapPin, Building2, Users, Heart, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCounty } from "@/contexts/CountyContext";
import { useFacilities } from "@/hooks/useFacilities";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import { Button } from "@/components/ui/button";
import CountySelector from "@/components/shared/CountySelector";

const CountyWelcomeBanner = () => {
  const { t } = useTranslation();
  const { county, setCounty } = useCounty();
  const { data: facilities = [] } = useFacilities(undefined, county);
  const { data: resources = [] } = useCommunityResources(undefined, county);

  if (!county) return null;

  const stats = [
    { icon: Building2, value: facilities.length, label: t("county.facilitiesStat") },
    { icon: Users, value: resources.length, label: t("county.resourcesStat") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-primary/10 bg-primary/5"
    >
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {t("county.welcomeTo", { county })}
            </p>
            <div className="flex items-center gap-4 mt-0.5">
              {stats.map((s) => (
                <span key={s.label} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <s.icon className="h-3 w-3" />
                  <strong className="text-foreground">{s.value || "-"}</strong> {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={() => setCounty(null)}
          aria-label={t("county.clearSelection")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default CountyWelcomeBanner;
