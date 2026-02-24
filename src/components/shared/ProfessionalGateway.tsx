import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3, Database, Handshake, Lock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BarChart3,
    title: "Health Data Dashboards",
    description: "Real-time equity metrics, facility quality scores, and community health rankings.",
    href: "/data-and-insights",
  },
  {
    icon: Database,
    title: "Open Data & APIs",
    description: "Download datasets on facilities, providers, services, and health outcomes.",
    href: "/data-and-insights",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "No personal data collected. All data from verified public sources.",
    href: "/accessibility",
  },
  {
    icon: Handshake,
    title: "Partnership Info",
    description: "Build with us. Integrate our APIs. Support vulnerable populations.",
    href: "/partnerships",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

export const ProfessionalGateway = () => {
  return (
    <section className="py-16 bg-michigan-navy/5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl"
        >
          <h2 className="text-2xl font-bold text-foreground md:text-3xl mb-3">
            Working in health, government, or research?
          </h2>
          <p className="text-lg text-muted-foreground">
            Access Michigan provides health professionals, researchers, and community organizations with dashboards, APIs, and equity data to make better decisions.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link to={feature.href}>
                  <Card className="h-full border border-michigan-navy/10 bg-white hover:shadow-lg hover:border-michigan-navy/20 transition-all duration-200 cursor-pointer group">
                    <CardContent className="py-6 space-y-3">
                      <div className="inline-flex items-center justify-center rounded-lg p-3 bg-michigan-navy/5 group-hover:bg-michigan-navy/10 transition-colors">
                        <Icon className="h-5 w-5 text-michigan-navy" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-michigan-navy group-hover:underline transition-colors">
                          Learn more
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/data-and-insights">
            <Button size="lg" className="bg-michigan-navy hover:bg-michigan-navy/90 px-8">
              <BarChart3 className="mr-2 h-4 w-4" />
              Explore Dashboards & Data
            </Button>
          </Link>
          <Link to="/partnerships">
            <Button size="lg" variant="outline" className="px-8">
              <Handshake className="mr-2 h-4 w-4" />
              Partnership Information
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfessionalGateway;