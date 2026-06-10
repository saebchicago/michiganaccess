import {
  type LucideIcon,
  Utensils,
  Home,
  Zap,
  Bus,
  Shield,
  DollarSign,
  Scale,
  Medal,
  UserRound,
  Baby,
  Accessibility,
  Globe,
  HeartHandshake,
  RotateCcw,
} from "lucide-react";

export interface StaticResource {
  name: string;
  description: string;
  url: string;
  phone?: string;
  icon: LucideIcon;
}

export const STATIC_RESOURCES: Record<string, StaticResource[]> = {
  food: [
    {
      name: "Michigan 211 - Food Help",
      description:
        "Search for food pantries, meal programs, and grocery assistance near you. Free and confidential.",
      url: "https://mi211.org",
      phone: "211",
      icon: Utensils,
    },
    {
      name: "Apply for SNAP (Food Stamps)",
      description:
        "Michigan's online portal to apply for food assistance. You may qualify even if you're working.",
      url: "https://newmibridges.michigan.gov",
      phone: "844-799-9876",
      icon: Utensils,
    },
    {
      name: "Find a Food Bank",
      description:
        "Locate a Feeding America food bank near you for emergency food.",
      url: "https://www.feedingamerica.org/find-your-local-foodbank",
      icon: Utensils,
    },
    {
      name: "WIC (Women, Infants, Children)",
      description:
        "Nutrition program for pregnant women, new mothers, and children under 5.",
      url: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
      icon: Utensils,
    },
  ],
  housing: [
    {
      name: "Michigan 211 - Housing Help",
      description:
        "Search for emergency shelters, rental assistance, and housing programs near you.",
      url: "https://mi211.org",
      phone: "211",
      icon: Home,
    },
    {
      name: "MSHDA Emergency Housing",
      description:
        "Michigan State Housing Development Authority - emergency housing resources and rental assistance programs.",
      url: "https://www.michigan.gov/mshda",
      icon: Home,
    },
    {
      name: "Michigan Legal Help - Housing",
      description:
        "Free legal information about eviction, landlord disputes, and housing rights.",
      url: "https://michiganlegalhelp.org/self-help-tools/housing",
      icon: Home,
    },
    {
      name: "HUD Housing Counseling",
      description:
        "Free HUD-approved housing counselors for foreclosure prevention, rental help, and homebuying.",
      url: "https://www.hud.gov/findacounselor",
      icon: Home,
    },
  ],
  utility: [
    {
      name: "Michigan 211 - Utility Help",
      description:
        "Find utility assistance programs, shutoff prevention, and weatherization help.",
      url: "https://mi211.org",
      phone: "211",
      icon: Zap,
    },
    {
      name: "MEAP (Michigan Energy Assistance)",
      description:
        "State energy assistance program to help pay heating and electric bills. Apply through MDHHS.",
      url: "https://www.michigan.gov/mdhhs/assistance-programs/energy",
      icon: Zap,
    },
    {
      name: "DTE Energy Assistance",
      description:
        "DTE payment plans, low-income assistance, and shutoff protection.",
      url: "https://newlook.dteenergy.com/wps/wcm/connect/dte-web/home/billing-and-payments/common/energy-assistance/",
      icon: Zap,
    },
    {
      name: "Consumers Energy Help",
      description: "Consumers Energy assistance programs and payment plans.",
      url: "https://www.consumersenergy.com/community/payment-assistance",
      icon: Zap,
    },
  ],
  transportation: [
    {
      name: "Michigan 211 - Transportation",
      description:
        "Find rides to medical appointments, public transit options, and transportation assistance.",
      url: "https://mi211.org",
      phone: "211",
      icon: Bus,
    },
    {
      name: "Medicaid Non-Emergency Transportation",
      description:
        "If you have Medicaid, eligibility rules may include free rides to medical appointments. Call your health plan to confirm.",
      url: "https://www.michigan.gov/mdhhs",
      icon: Bus,
    },
    {
      name: "Michigan Public Transit",
      description: "Find public transit agencies in your area.",
      url: "https://www.michigan.gov/mdot/travel/public-transit",
      icon: Bus,
    },
  ],
  insurance: [
    {
      name: "MI Bridges - Apply for Medicaid",
      description:
        "Apply online for Medicaid (Healthy Michigan Plan), marketplace coverage, and other benefits.",
      url: "https://newmibridges.michigan.gov",
      phone: "844-799-9876",
      icon: Shield,
    },
    {
      name: "Healthcare.gov",
      description:
        "Find marketplace health insurance plans and see how subsidy eligibility rules work.",
      url: "https://www.healthcare.gov",
      icon: Shield,
    },
    {
      name: "Michigan Enrollment Assister Locator",
      description:
        "Find free in-person help signing up for health coverage near you.",
      url: "https://localhelp.healthcare.gov",
      icon: Shield,
    },
    {
      name: "Medicare.gov",
      description:
        "For adults 65+: explore Medicare plans, find providers, check drug coverage.",
      url: "https://www.medicare.gov",
      icon: Shield,
    },
  ],
  financial: [
    {
      name: "MI Bridges - All Benefits",
      description:
        "Apply for SNAP, Medicaid, childcare assistance, cash assistance, and energy assistance - one application.",
      url: "https://newmibridges.michigan.gov",
      phone: "844-799-9876",
      icon: DollarSign,
    },
    {
      name: "Michigan 211",
      description:
        "Search for financial help including rent assistance, bill help, and emergency funds.",
      url: "https://mi211.org",
      phone: "211",
      icon: DollarSign,
    },
    {
      name: "Benefits.gov",
      description:
        "Learn about eligibility for 1,000+ federal and state benefit programs.",
      url: "https://www.benefits.gov",
      icon: DollarSign,
    },
    {
      name: "VITA Free Tax Preparation",
      description:
        "Free tax preparation for households earning under $67,000/year. Find a VITA site near you.",
      url: "https://irs.treasury.gov/freetaxprep/",
      icon: DollarSign,
    },
  ],
  legal: [
    {
      name: "Michigan Legal Help",
      description:
        "Free legal information and self-help tools for family law, housing, consumer rights, and more.",
      url: "https://michiganlegalhelp.org",
      icon: Scale,
    },
    {
      name: "Michigan Legal Aid Finder",
      description:
        "Find free or low-cost legal help based on your location and legal issue.",
      url: "https://michiganlegalhelp.org/organizations-background/find-lawyer",
      icon: Scale,
    },
    {
      name: "Michigan 211 - Legal Help",
      description: "Connect with legal aid organizations in your area.",
      url: "https://mi211.org",
      phone: "211",
      icon: Scale,
    },
  ],
  veterans: [
    {
      name: "VA Facility Locator",
      description:
        "Find VA hospitals, clinics, Vet Centers, and benefits offices near you.",
      url: "https://www.va.gov/find-locations/",
      icon: Medal,
    },
    {
      name: "Michigan Veterans Affairs Agency",
      description:
        "State resources for Michigan veterans including benefits, employment, housing, and healthcare.",
      url: "https://www.michigan.gov/mvaa",
      icon: Medal,
    },
    {
      name: "Veterans Crisis Line",
      description:
        "Free, confidential support for veterans in crisis and their loved ones. Call 988 and press 1, or text 838255.",
      url: "tel:988",
      phone: "988 (press 1)",
      icon: Medal,
    },
    {
      name: "Michigan 211 - Veterans",
      description: "Search for veteran-specific services in your community.",
      url: "https://mi211.org",
      phone: "211",
      icon: Medal,
    },
  ],
  seniors: [
    {
      name: "Michigan Area Agencies on Aging",
      description:
        "Find your local Area Agency on Aging for in-home care, meals, transportation, and caregiver support.",
      url: "https://www.michigan.gov/osa",
      icon: UserRound,
    },
    {
      name: "Medicare.gov",
      description:
        "Explore Medicare plans, find providers, compare drug coverage.",
      url: "https://www.medicare.gov",
      icon: UserRound,
    },
    {
      name: "Eldercare Locator",
      description:
        "Federal resource to find local aging services - call 1-800-677-1116.",
      url: "https://eldercare.acl.gov",
      phone: "1-800-677-1116",
      icon: UserRound,
    },
    {
      name: "Michigan 211 - Senior Services",
      description:
        "Search for senior services including adult day programs, home repair, and nutrition.",
      url: "https://mi211.org",
      phone: "211",
      icon: UserRound,
    },
  ],
  children: [
    {
      name: "MI Bridges - Childcare Assistance",
      description:
        "Apply for childcare assistance, SNAP, and other family benefits.",
      url: "https://newmibridges.michigan.gov",
      icon: Baby,
    },
    {
      name: "Michigan 211 - Family Services",
      description:
        "Search for parenting support, early childhood programs, and family resources.",
      url: "https://mi211.org",
      phone: "211",
      icon: Baby,
    },
    {
      name: "Head Start Locator",
      description:
        "Find free Head Start and Early Head Start programs for children 0-5.",
      url: "https://eclkc.ohs.acf.hhs.gov/center-locator",
      icon: Baby,
    },
    {
      name: "Great Start to Quality",
      description:
        "Find quality-rated childcare and preschool programs in Michigan.",
      url: "https://greatstarttoquality.org",
      icon: Baby,
    },
  ],
  disability: [
    {
      name: "Michigan Disability Rights Coalition",
      description:
        "Advocacy, independent living, and disability rights across Michigan.",
      url: "https://www.copower.org",
      icon: Accessibility,
    },
    {
      name: "Michigan Rehabilitation Services",
      description:
        "Employment services and vocational rehabilitation for people with disabilities.",
      url: "https://www.michigan.gov/leo/bureaus-agencies/mrs",
      icon: Accessibility,
    },
    {
      name: "Michigan 211 - Disability Services",
      description:
        "Search for disability support including assistive technology, accessible housing, and personal care.",
      url: "https://mi211.org",
      phone: "211",
      icon: Accessibility,
    },
  ],
  immigrant: [
    {
      name: "Michigan Office for New Americans",
      description:
        "State resources for immigrants and refugees including legal help, language access, and resettlement.",
      url: "https://www.michigan.gov/ona",
      icon: Globe,
    },
    {
      name: "Michigan Immigrant Rights Center",
      description:
        "Free or low-cost immigration legal services across Michigan.",
      url: "https://michiganimmigrant.org",
      icon: Globe,
    },
    {
      name: "Michigan 211 - Immigrant Services",
      description:
        "Search for ESL classes, resettlement support, and culturally specific services.",
      url: "https://mi211.org",
      phone: "211",
      icon: Globe,
    },
  ],
  dv: [
    {
      name: "National DV Hotline",
      description:
        "24/7 confidential support. Call, text START to 88788, or chat online at thehotline.org.",
      url: "tel:1-800-799-7233",
      phone: "1-800-799-7233",
      icon: HeartHandshake,
    },
    {
      name: "Michigan Coalition to End DV",
      description: "Find local shelters and DV programs across Michigan.",
      url: "https://mcedsv.org",
      icon: HeartHandshake,
    },
    {
      name: "Michigan 211 - Safety Resources",
      description:
        "Confidential help finding shelters, safety planning, and support services.",
      url: "https://mi211.org",
      phone: "211",
      icon: HeartHandshake,
    },
  ],
  reentry: [
    {
      name: "Michigan Offender Success",
      description:
        "State re-entry programs including housing, employment, and substance use treatment.",
      url: "https://www.michigan.gov/corrections",
      icon: RotateCcw,
    },
    {
      name: "Michigan Legal Help - Criminal Record",
      description:
        "Free information about expungement and clearing your record in Michigan.",
      url: "https://michiganlegalhelp.org/self-help-tools/crime-traffic-and-id/clearing-your-criminal-record",
      icon: RotateCcw,
    },
    {
      name: "Michigan 211 - Re-entry",
      description:
        "Search for re-entry housing, job training, and support services.",
      url: "https://mi211.org",
      phone: "211",
      icon: RotateCcw,
    },
  ],
};
