import { motion } from "framer-motion";
import { ExternalLink, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StaticResource } from "@/data/findhelp-resources";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

interface Props {
  resource: StaticResource;
  index: number;
}

export default function StaticResourceCard({ resource: r, index }: Props) {
  const Icon = r.icon;
  const isPhone = r.url.startsWith("tel:");

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index}>
      <Card className="hover-lift card-accent-border h-full">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground leading-snug">{r.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild className="h-9 text-sm">
              <a
                href={r.url}
                target={isPhone ? undefined : "_blank"}
                rel={isPhone ? undefined : "noopener noreferrer"}
              >
                {isPhone ? (
                  <><Phone className="mr-1.5 h-3.5 w-3.5" />Call Now</>
                ) : (
                  <><ExternalLink className="mr-1.5 h-3.5 w-3.5" />Visit {r.name.split("-")[0].trim()}</>
                )}
              </a>
            </Button>
            {r.phone && !isPhone && (
              <Button size="sm" variant="outline" asChild className="h-9 text-sm">
                <a href={`tel:${r.phone.replace(/\D/g, "")}`}>
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  Call {r.phone}
                </a>
              </Button>
            )}
          </div>
          {!isPhone && (
            <p className="text-[11px] text-muted-foreground">Opens in new tab</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
