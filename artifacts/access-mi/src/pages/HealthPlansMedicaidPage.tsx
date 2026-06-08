import PartnerSubPage, { type PartnerPageConfig } from "@/components/partners/PartnerSubPage";
import { Heart } from "lucide-react";

const config: PartnerPageConfig = {
  slug: "health-plans-medicaid",
  title: "Access Michigan for Health Plans & Medicaid Programs",
  metaDescription: "How Access Michigan supports Medicaid managed care plans, VBC programs, and CHNA teams with community-level intelligence.",
  icon: Heart,
  breadcrumbLabel: "Health Plans & Medicaid",
  intro: [
    "Access Michigan provides community-level intelligence across all 83 Michigan counties that health plans and Medicaid managed care organizations can use to strengthen value-based care, improve HEDIS and quality measures, and meet CHNA reporting requirements.",
    "Our platform surfaces social risk factors - food insecurity, housing instability, utility burden, and transportation gaps - at the county and ZIP level, helping plans identify and address non-clinical drivers of utilization.",
  ],
  whatYouGet: [
    "Targeted CHNA briefs by ZIP code and county with SDOH overlays for your service area",
    "Utility stress and transportation gap data to inform care management and HCBS referral strategies",
    "County-level resource directories for community benefit coordination and member navigation",
  ],
};

export default function HealthPlansMedicaidPage() {
  return <PartnerSubPage config={config} />;
}
