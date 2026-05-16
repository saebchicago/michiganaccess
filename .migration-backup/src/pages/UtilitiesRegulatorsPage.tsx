import PartnerSubPage, { type PartnerPageConfig } from "@/components/partners/PartnerSubPage";
import { Zap } from "lucide-react";

const config: PartnerPageConfig = {
  slug: "utilities-regulators",
  title: "Access Michigan for Utilities & Regulators",
  metaDescription: "How Access Michigan supports utilities, the MPSC, and regulators with community equity data, outage analysis, and customer stress intelligence.",
  icon: Zap,
  breadcrumbLabel: "Utilities & Regulators",
  intro: [
    "Access Michigan aggregates publicly available energy burden, outage reliability, and customer stress data to help utilities and regulators understand how service patterns intersect with community vulnerability.",
    "By pairing MPSC utility performance data with health, housing, and economic indicators at the county level, we help utilities align customer protections with the needs of medically vulnerable and low-income communities.",
  ],
  whatYouGet: [
    "County-level utility customer stress indicators — disconnection risk, arrears levels, and assistance participation data for equity-focused planning",
    "Data and narratives for regulatory filings, IRP community impact assessments, and public reporting",
    "Co-designed dashboards linking energy burden to health outcomes and housing instability for targeted outreach",
  ],
};

export default function UtilitiesRegulatorsPage() {
  return <PartnerSubPage config={config} />;
}
