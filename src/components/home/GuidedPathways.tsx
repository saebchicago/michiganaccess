import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, Heart, MapPin, Siren,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const pathways = [
  {
    id: "uninsured",
    icon: ShieldAlert,
    title: "I need care but don't have insurance",
    description: "Find sliding-scale clinics, Medicaid enrollment, and charity care programs",
    links: [
      { label: "Financial Assistance", href: "/financial-help" },
      { label: "Community Health Centers", href: "/find-care" },
      { label: "Appeal a Denial", href: "/health/insurance-appeals" },
    ],
    color: "text-michigan-coral",
    bg: "bg-michigan-coral/8",
  },
  {
    id: "caregiver",
    icon: Heart,
    title: "I'm caring for a family member",
    description: "Support groups, respite care, home health, and caregiver resources",
    links: [
      { label: "Support Groups", href: "/support" },
      { label: "Community Resources", href: "/resources" },
      { label: "Quality Ratings", href: "/quality" },
    ],
    color: "text-michigan-teal",
    bg: "bg-michigan-teal/8",
  },
  {
    id: "new-resident",
    icon: MapPin,
    title: "I just moved to Michigan",
    description: "Find doctors, enroll in coverage, and discover local services",
    links: [
      { label: "Find Care Near You", href: "/find-care" },
      { label: "Health Map", href: "/health-map" },
      { label: "Financial Help", href: "/financial-help" },
    ],
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    id: "emergency",
    icon: Siren,
    title: "I need help right now",
    description: "Crisis lines, emergency rooms, and urgent care options",
    links: [
      { label: "Call 988 (Crisis)", href: "tel:988" },
      { label: "Call 211 (Resources)", href: "tel:211" },
      { label: "Find Urgent Care", href: "/find-care" },
    ],
    color: "text-destructive",
    bg: "bg-destructive/8",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

export default function GuidedPathways() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">How can we help you today?</h2>
          <p className="mt-2 text-muted-foreground">Choose what fits your situation — we'll guide you to the right resources.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map((p, i) => (
            <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className={`h-full hover-lift border-l-4 ${p.bg}`} style={{ borderLeftColor: "currentColor" }}>
                <CardContent className="py-5 space-y-3">
                  <p.icon className={`h-7 w-7 ${p.color}`} />
                  <h3 className="text-sm font-bold text-foreground leading-snug">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {p.links.map((link) => (
                      link.href.startsWith("tel:") ? (
                        <a key={link.label} href={link.href} className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline`}>
                          <ArrowRight className="h-3 w-3" /> {link.label}
                        </a>
                      ) : (
                        <Link key={link.label} to={link.href} className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline`}>
                          <ArrowRight className="h-3 w-3" /> {link.label}
                        </Link>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
