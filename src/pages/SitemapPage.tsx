import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Home, Heart, MapPin, DollarSign, Shield, Users, Building2, BarChart3,
  BookOpen, Bus, Leaf, Scale, Brain, Microscope, Calendar, Phone,
  FileText, Settings, Globe, Rss, Star, Briefcase, Map
} from "lucide-react";

interface SitemapSection {
  title: string;
  icon: React.ElementType;
  links: { label: string; href: string; badge?: string }[];
}

const SECTIONS: SitemapSection[] = [
  {
    title: "Get the Help You Need",
    icon: Heart,
    links: [
      { label: "Find a Doctor or Facility", href: "/find-care" },
      { label: "Get Financial Help", href: "/financial-help" },
      { label: "Community Resources", href: "/resources" },
      { label: "Insurance Appeals", href: "/health/insurance-appeals", badge: "AI-Powered" },
      { label: "Complex Care Navigation", href: "/complex-care" },
      { label: "Life Navigator Assessment", href: "/life-navigator" },
      { label: "Support Groups", href: "/support" },
    ],
  },
  {
    title: "Explore Services",
    icon: Globe,
    links: [
      { label: "Health Conditions Pathways", href: "/conditions" },
      { label: "Clinical Trials", href: "/clinical-trials" },
      { label: "Quality Ratings", href: "/quality" },
      { label: "Cost Transparency", href: "/costs" },
      { label: "Prevention & Wellness", href: "/wellness" },
      { label: "Health News", href: "/news" },
    ],
  },
  {
    title: "Maps & Data",
    icon: Map,
    links: [
      { label: "Interactive Health Map", href: "/health-map" },
      { label: "Health Data Dashboard", href: "/data" },
      { label: "Civic Data Hub", href: "/civic-data" },
      { label: "Equity & Social Vulnerability", href: "/equity" },
      { label: "Environment & Air Quality", href: "/environment" },
    ],
  },
  {
    title: "Regions & Counties",
    icon: MapPin,
    links: [
      { label: "All Regions", href: "/regions" },
      { label: "Regional Comparison", href: "/regions/compare", badge: "Dashboard" },
      { label: "County Pages (83)", href: "/county/wayne" },
    ],
  },
  {
    title: "Transportation & Community",
    icon: Bus,
    links: [
      { label: "Transportation & Safety", href: "/transportation" },
      { label: "Community Events", href: "/events" },
    ],
  },
  {
    title: "For Partners & Health Systems",
    icon: Briefcase,
    links: [
      { label: "Partnership Overview", href: "/partnerships" },
      { label: "For Health Systems", href: "/for-health-systems" },
      { label: "Health System Integration", href: "/partnerships/health-systems" },
      { label: "One-Pager", href: "/partnerships/health-systems/one-pager" },
      { label: "Executive Summary", href: "/executive-summary" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Lean Healthcare", href: "/lean-healthcare" },
      { label: "Partner Impact", href: "/impact" },
    ],
  },
  {
    title: "About & Resources",
    icon: BookOpen,
    links: [
      { label: "About Access Michigan", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Methodology", href: "/methodology" },
      { label: "Research", href: "/research" },
      { label: "Technical Documentation", href: "/technical" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "What's New (Changelog)", href: "/changelog" },
      { label: "Install the App", href: "/install" },
      { label: "Press & Media Kit", href: "/press" },
      { label: "Site Map", href: "/sitemap" },
    ],
  },
];

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
            {SECTIONS.map((section, si) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: si * 0.04 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
                </div>
                <ul className="grid gap-1 sm:grid-cols-2 pl-6">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
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
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-muted-foreground">
              {SECTIONS.reduce((acc, s) => acc + s.links.length, 0)} pages across {SECTIONS.length} categories ·{" "}
              <Link to="/changelog" className="text-primary hover:underline">View latest updates</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
