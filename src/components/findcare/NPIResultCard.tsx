import { motion } from "framer-motion";
import { Phone, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NPIProvider } from "@/hooks/useNPISearch";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
};

interface Props {
  provider: NPIProvider;
  index: number;
}

export default function NPIResultCard({ provider: p, index }: Props) {
  const fullAddress = [p.address, p.city, p.state, p.zip].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index % 20}>
      <Card className="hover-lift card-accent-border h-full">
        <CardContent className="py-4 space-y-2">
          {/* Name */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-foreground leading-snug">
                {p.isOrganization ? p.name : `${p.name}${p.credential ? `, ${p.credential}` : ""}`}
              </h3>
              <p className="text-sm text-muted-foreground">{p.specialty}</p>
            </div>
            {p.isOrganization ? (
              <Badge variant="secondary" className="text-[10px] shrink-0">Organization</Badge>
            ) : (
              p.gender && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  <User className="mr-0.5 h-3 w-3" />
                  {p.gender === "F" ? "Female" : p.gender === "M" ? "Male" : p.gender}
                </Badge>
              )
            )}
          </div>

          {/* Address */}
          {fullAddress && (
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {fullAddress}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {p.phone && (
              <Button size="sm" asChild className="h-9 text-sm">
                <a href={`tel:${p.phone.replace(/\D/g, "")}`}>
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  Call {p.phone}
                </a>
              </Button>
            )}
            {fullAddress && (
              <Button size="sm" variant="outline" asChild className="h-9 text-sm">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  Directions
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
