import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Map,
  Home,
  GitCompareArrows,
  HelpCircle,
  CloudLightning,
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: MapPin,
    label: "Health Score",
    detail: "0-100 grade for any ZIP",
    href: "/zip-intelligence",
    color: "text-green-400",
  },
  {
    icon: BarChart3,
    label: "Custom Charts",
    detail: "40 CDC measures, your ZIP",
    href: "/zip-intelligence",
    color: "text-blue-400",
  },
  {
    icon: CheckCircle2,
    label: "How eligibility rules work",
    detail: "10 programs, 3 questions",
    href: "/financial-help#screener",
    color: "text-amber-400",
  },
  {
    icon: DollarSign,
    label: "Tax Calculator",
    detail: "Compare total taxes in 2 cities",
    href: "/tax-comparison",
    color: "text-yellow-400",
  },
  {
    icon: Map,
    label: "Equity Atlas",
    detail: "10 layers, 83 counties",
    href: "/health-equity-atlas",
    color: "text-teal-400",
  },
  {
    icon: Home,
    label: "Should I Move?",
    detail: "Taxes + health + housing",
    href: "/tax-comparison",
    color: "text-rose-400",
  },
  {
    icon: GitCompareArrows,
    label: "Compare ZIPs",
    detail: "Side-by-side ZIP analysis",
    href: "/compare-zips",
    color: "text-indigo-400",
  },
  {
    icon: HelpCircle,
    label: "Michigan Quiz",
    detail: "Test your Michigan knowledge",
    href: "/quiz",
    color: "text-purple-400",
  },
  {
    icon: CloudLightning,
    label: "Disaster History",
    detail: "70 years of FEMA data",
    href: "/disaster-history",
    color: "text-red-400",
  },
];

export default function CapabilityStrip() {
  return (
    <div className="border-b border-border/30 bg-muted/20 py-3 overflow-x-auto">
      <div className="container">
        <div className="flex items-center gap-1 min-w-max justify-center">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Link
                to={cap.href}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors group"
              >
                <cap.icon className={`h-3.5 w-3.5 shrink-0 ${cap.color}`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground leading-tight">
                    {cap.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    {cap.detail}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
