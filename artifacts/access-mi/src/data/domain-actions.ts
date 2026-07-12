/**
 * "What you can do" actions per domain - curated Michigan-specific links.
 * Each action is independently verifiable and does not imply endorsement.
 */

export interface DomainAction {
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

export type DomainId =
  | "health"
  | "housing"
  | "energy"
  | "environment"
  | "transportation"
  | "safety"
  | "education"
  | "food"
  | "workforce"
  | "benefits";

export const DOMAIN_ACTIONS: Record<DomainId, DomainAction[]> = {
  health: [
    {
      title: "Apply for Healthy Michigan Plan",
      description: "Free or low-cost health coverage for eligible adults",
      href: "https://www.michigan.gov/mdhhs/assistance-programs/healthcare/healthy-michigan-plan",
      external: true,
    },
    {
      title: "Find a Provider via MI Bridges",
      description: "Apply for Medicaid, food, and other benefits online",
      href: "https://newmibridges.michigan.gov/",
      external: true,
    },
    {
      title: "Find Care on Access Michigan",
      description: "Search providers by specialty, name, or NPI",
      href: "/find-care",
    },
    {
      title: "Call 2-1-1 for Health Resources",
      description: "Free, confidential referrals to local health services",
      href: "tel:211",
    },
  ],
  housing: [
    {
      title: "MSHDA Housing Programs",
      description:
        "Rental assistance, homebuyer programs, and emergency housing",
      href: "https://www.michigan.gov/mshda",
      external: true,
    },
    {
      title: "MI Legal Aid - Housing",
      description:
        "Free legal help for tenants facing eviction or unsafe housing",
      href: "https://michiganlegalhelp.org/self-help-tools/housing",
      external: true,
    },
    {
      title: "HUD Housing Counseling",
      description: "Find a HUD-approved counseling agency near you",
      href: "https://www.hud.gov/findacounselor",
      external: true,
    },
    {
      title: "Emergency Shelter via 2-1-1",
      description: "Immediate shelter referrals for individuals and families",
      href: "tel:211",
    },
  ],
  energy: [
    {
      title: "Apply for LIHEAP",
      description:
        "Federal heating and cooling assistance for low-income households",
      href: "https://www.michigan.gov/mdhhs/assistance-programs/energy",
      external: true,
    },
    {
      title: "DTE Energy Assistance",
      description:
        "Payment plans, shutoff protection, and energy-saving rebates",
      href: "https://www.dteenergy.com/us/en/residential/billing-and-payments/payment-assistance.html",
      external: true,
    },
    {
      title: "Consumers Energy Assistance",
      description: "Help paying your energy bill and weatherization programs",
      href: "https://www.consumersenergy.com/residential/billing-and-payment/financial-assistance",
      external: true,
    },
    {
      title: "Weatherization Assistance",
      description:
        "Free home energy efficiency upgrades for qualifying households",
      href: "https://www.michigan.gov/leo/bureaus-agencies/community-services/weatherization",
      external: true,
    },
  ],
  environment: [
    {
      title: "EPA MyEnvironment",
      description: "Look up environmental conditions near your address",
      href: "https://www.epa.gov/myenvironment",
      external: true,
    },
    {
      title: "MI EGLE Reports",
      description: "Michigan environmental quality reports and complaints",
      href: "https://www.michigan.gov/egle",
      external: true,
    },
    {
      title: "Check Air Quality (AirNow)",
      description: "Current AQI and health recommendations for your area",
      href: "https://www.airnow.gov/",
      external: true,
    },
  ],
  transportation: [
    {
      title: "MDOT Transit Finder",
      description: "Find public transit options and schedules in your area",
      href: "https://www.michigan.gov/mdot/travel/mobility/public-transit",
      external: true,
    },
    {
      title: "MI Works Transportation",
      description: "Transportation assistance for job seekers and workers",
      href: "https://www.michiganworks.org/",
      external: true,
    },
    {
      title: "MI Ride Services",
      description:
        "Non-emergency medical transportation for Medicaid recipients",
      href: "https://www.michigan.gov/mdhhs/assistance-programs/healthcare/nemt",
      external: true,
    },
  ],
  safety: [
    {
      title: "FEMA Disaster Alerts",
      description:
        "Check for active disaster declarations and preparedness info",
      href: "https://www.fema.gov/disaster/declarations?field_dv2_state_territory_tribal_value=MI",
      external: true,
    },
    {
      title: "MI State Police Resources",
      description:
        "Emergency contacts, sex offender registry, and public safety info",
      href: "https://www.michigan.gov/msp",
      external: true,
    },
    {
      title: "National Weather Service Alerts",
      description: "Severe weather warnings and preparedness for Michigan",
      href: "https://alerts.weather.gov/",
      external: true,
    },
  ],
  education: [
    {
      title: "MI School Data",
      description: "Find school performance data, ratings, and demographics",
      href: "https://www.mischooldata.org/",
      external: true,
    },
    {
      title: "GreatSchools Ratings",
      description: "Compare school ratings and parent reviews",
      href: "https://www.greatschools.org/michigan/",
      external: true,
    },
    {
      title: "Head Start Locator",
      description: "Find Head Start and Early Head Start programs near you",
      href: "https://eclkc.ohs.acf.hhs.gov/center-locator",
      external: true,
    },
    {
      title: "MI Reconnect (Free College)",
      description:
        "Tuition-free community college for eligible Michigan adults",
      href: "https://www.michigan.gov/reconnect",
      external: true,
    },
  ],
  food: [
    {
      title: "Apply for SNAP Benefits",
      description: "Apply for food assistance through MI Bridges",
      href: "https://newmibridges.michigan.gov/",
      external: true,
    },
    {
      title: "WIC Program",
      description:
        "Nutrition assistance for pregnant women, infants, and children",
      href: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
      external: true,
    },
    {
      title: "Find a Food Bank",
      description: "Locate Feeding America food banks and pantries in Michigan",
      href: "https://www.feedingamerica.org/find-your-local-foodbank",
      external: true,
    },
    {
      title: "MI Summer Food Programs",
      description: "Free meals for children during summer months",
      href: "https://www.fna.usda.gov/sfsp/sitefinder",
      external: true,
    },
  ],
  workforce: [
    {
      title: "Michigan Works!",
      description: "Job search, training, and career services across Michigan",
      href: "https://www.michiganworks.org/",
      external: true,
    },
    {
      title: "File for Unemployment",
      description: "Apply for unemployment insurance benefits online",
      href: "https://www.michigan.gov/leo/bureaus-agencies/uia",
      external: true,
    },
    {
      title: "Going PRO Talent Fund",
      description: "Employer-sponsored training for in-demand skills",
      href: "https://www.michigan.gov/leo/bureaus-agencies/wd/going-pro",
      external: true,
    },
  ],
  benefits: [
    {
      title: "MI Bridges",
      description: "Apply for health, food, cash, and childcare assistance",
      href: "https://newmibridges.michigan.gov/",
      external: true,
    },
    {
      title: "Call 2-1-1",
      description: "Free, confidential connection to local resources 24/7",
      href: "tel:211",
    },
    {
      title: "Benefits.gov Screening",
      description: "Check eligibility for 1,000+ government benefit programs",
      href: "https://www.benefits.gov/",
      external: true,
    },
  ],
};

export const DOMAIN_LABELS: Record<DomainId, string> = {
  health: "Health",
  housing: "Housing",
  energy: "Energy & Utilities",
  environment: "Environment",
  transportation: "Transportation",
  safety: "Safety & Preparedness",
  education: "Education",
  food: "Food Security",
  workforce: "Workforce & Income",
  benefits: "Benefits & Help",
};
