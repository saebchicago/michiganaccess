import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Heart, MapPin, Globe, Bus, Briefcase, BookOpen, Map, Landmark,
} from "lucide-react";
import { SITEMAP_SECTIONS, type SitemapSection } from "@/config/routes";

const ICON_MAP: Record<string, React.ElementType> = {
  Heart, Globe, Map, MapPin, Bus, Briefcase, BookOpen, Landmark,
};

export default function SitemapPage() {
  usePageMeta({
    title: "Site Map",
    description: "Complete navigation tree for Access Michigan — find any page or feature quickly.",
    path: "/sitemap",
  });

  return (
    <Layout>
      <section className="py-14">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary">
              Navigation
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Site Map</h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Every page on Access Michigan, organized by category.
            </p>
          </motion.div>

          <div className="space-y-8">
            {SITEMAP_SECTIONS.map((section, si) => {
              const Icon = ICON_MAP[section.iconName] || Heart;
              return (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: si * 0.04 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2 pl-6">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          {link.label}
                          {link.badge && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">{link.badge}</Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-muted-foreground">
              {SITEMAP_SECTIONS.reduce((acc, s) => acc + s.links.length, 0)} pages across {SITEMAP_SECTIONS.length} categories ·{" "}
              <Link to="/changelog" className="text-primary hover:underline">View latest updates</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
