import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart, Bus, Zap, TreePine, GraduationCap, Scale, Medal, Baby, ShieldAlert, Palette,
  Search, ExternalLink, Share2, X, Star, LayoutGrid, ChevronDown, ChevronUp,
} from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SearchableProgram {
  title: string;
  description: string;
  eligibility: string[];
  url: string;
  category: string;
  counties?: string[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  Community: { label: "Community", color: "bg-primary/10 text-primary" },
  Transportation: { label: "Transportation", color: "bg-accent/10 text-accent-foreground" },
  Energy: { label: "Energy", color: "bg-michigan-forest/10 text-michigan-forest" },
  Environment: { label: "Environment", color: "bg-michigan-forest/10 text-michigan-forest" },
  Education: { label: "Education", color: "bg-primary/10 text-primary" },
  "Legal & Civic": { label: "Legal & Civic", color: "bg-accent/10 text-accent-foreground" },
  "Veterans & Seniors": { label: "Veterans & Seniors", color: "bg-primary/10 text-primary" },
  "Youth & Family": { label: "Youth & Family", color: "bg-primary/10 text-primary" },
  "Disaster Prep": { label: "Disaster Prep", color: "bg-destructive/10 text-destructive" },
  "Culture & Rec": { label: "Culture & Rec", color: "bg-accent/50 text-accent-foreground" },
};

// Consolidated program index for cross-category search
const ALL_PROGRAMS: SearchableProgram[] = [
  // Community
  { title: "WIC Nutrition Program", description: "Free nutrition support, healthy food, and breastfeeding help for pregnant women, new moms, and children under 5.", eligibility: ["families", "children"], url: "https://www.michigan.gov/mdhhs/assistance-programs/wic", category: "Community" },
  { title: "School-Based Health Centers", description: "On-site medical, dental, and mental health services at schools — no transportation barriers for students.", eligibility: ["children", "teens"], url: "https://www.michigan.gov/mdhhs/doing-business/providers/sbhc", category: "Community", counties: ["Wayne", "Oakland", "Kent", "Genesee", "Washtenaw", "Ingham", "Kalamazoo", "Muskegon", "Saginaw", "Berrien"] },
  { title: "Maternal Infant Health Program", description: "Home visits, care coordination, and support for pregnant women and families with infants in Michigan.", eligibility: ["families", "children"], url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/maternal-and-infant-health", category: "Community" },
  { title: "MDHHS Emergency Shelter Assistance", description: "Temporary housing assistance for families and individuals facing homelessness across Michigan counties.", eligibility: ["families", "seniors"], url: "https://www.michigan.gov/mdhhs/assistance-programs/emergency-services", category: "Community" },
  { title: "Great Start Readiness Program (GSRP)", description: "Free state-funded preschool for 4-year-olds from income-eligible families. Available in all 83 counties.", eligibility: ["children", "families"], url: "https://www.michigan.gov/mde/services/early-learners/gsrp", category: "Community" },
  { title: "Meals on Wheels Michigan", description: "Home-delivered nutritious meals for seniors and homebound adults, with wellness checks and social connection.", eligibility: ["seniors"], url: "https://www.michigan.gov/osa", category: "Community" },
  // Transportation
  { title: "Michigan Medicaid Non-Emergency Transport", description: "Free rides to medical appointments for Medicaid enrollees. Covers buses, taxis, and mileage reimbursement statewide.", eligibility: ["medicaid", "families"], url: "https://www.michigan.gov/mdhhs/doing-business/providers/providers/transport", category: "Transportation" },
  { title: "MDOT Rural Transit Programs", description: "Public transit services in rural areas through county-operated demand-response and fixed-route systems.", eligibility: ["rural", "seniors"], url: "https://www.michigan.gov/mdot/travel/public-transit", category: "Transportation" },
  { title: "MichiVan Rideshare Program", description: "Vanpool commuting for groups of 7–15 people sharing similar routes. Subsidized fares for qualifying riders.", eligibility: ["commuters"], url: "https://www.michigan.gov/mdot/travel/michivan", category: "Transportation" },
  { title: "ADA Paratransit Services", description: "Door-to-door transportation for individuals with disabilities who cannot use fixed-route transit.", eligibility: ["disabilities", "seniors"], url: "https://www.michigan.gov/mdot/travel/public-transit", category: "Transportation" },
  { title: "SMART & DDOT Transit (Metro Detroit)", description: "Regional bus networks serving Wayne, Oakland, and Macomb counties with fixed routes and FAST express service.", eligibility: ["commuters", "families"], url: "https://www.smartbus.org", category: "Transportation", counties: ["Wayne", "Oakland", "Macomb"] },
  { title: "The Rapid (Grand Rapids)", description: "Bus rapid transit and fixed routes serving Kent County including Silver Line and Laker Line services.", eligibility: ["commuters", "families"], url: "https://www.ridetherapid.org", category: "Transportation", counties: ["Kent"] },
  // Energy
  { title: "Michigan Home Energy Rebate (MiHER)", description: "Federal rebates up to $8,000 for home energy efficiency upgrades including insulation, HVAC, and heat pumps.", eligibility: ["homeowners", "families"], url: "https://www.michigan.gov/egle/about/organization/materials-management/energy/mi-home-energy-rebate", category: "Energy" },
  { title: "LIHEAP Heating Assistance", description: "Low-Income Home Energy Assistance Program helps pay heating bills. Apply through your local MDHHS office.", eligibility: ["low-income", "seniors"], url: "https://www.michigan.gov/mdhhs/assistance-programs/energy", category: "Energy" },
  { title: "Michigan Saves Clean Energy Financing", description: "Low-interest loans for energy-efficient home improvements including solar panels, insulation, and appliances.", eligibility: ["homeowners"], url: "https://michigansaves.org", category: "Energy" },
  { title: "DTE Energy Efficiency Programs", description: "Free energy audits, appliance rebates, and weatherization assistance for DTE customers across Southeast Michigan.", eligibility: ["homeowners", "renters"], url: "https://www.dteenergy.com/us/en/residential/save-money-energy.html", category: "Energy", counties: ["Wayne", "Oakland", "Macomb", "Monroe", "Washtenaw", "Lenawee", "St. Clair"] },
  { title: "Consumers Energy Efficiency Rebates", description: "Rebates on efficient appliances, smart thermostats, and home weatherization for Consumers Energy customers.", eligibility: ["homeowners", "renters"], url: "https://www.consumersenergy.com/residential/save-money-and-energy", category: "Energy", counties: ["Kent", "Kalamazoo", "Jackson", "Ingham", "Bay", "Saginaw", "Muskegon", "Grand Traverse"] },
  { title: "Weatherization Assistance Program", description: "Free home weatherization for income-eligible households — insulation, air sealing, and furnace repair.", eligibility: ["low-income", "seniors"], url: "https://www.michigan.gov/egle/about/organization/materials-management/energy/weatherization", category: "Energy" },
  // Environment
  { title: "EGLE Air Quality Alerts", description: "Real-time air quality monitoring and health advisories from Michigan's Department of Environment, Great Lakes, and Energy.", eligibility: ["all residents"], url: "https://www.michigan.gov/egle/about/organization/air-quality", category: "Environment" },
  { title: "Michigan Safe Drinking Water", description: "Water quality testing, lead service line replacement programs, and public water system reports by county.", eligibility: ["homeowners", "renters"], url: "https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health", category: "Environment" },
  { title: "Great Lakes Restoration Initiative", description: "Federal programs protecting the Great Lakes — habitat restoration, invasive species management, and beach monitoring.", eligibility: ["communities"], url: "https://www.glri.us", category: "Environment" },
  { title: "Michigan Recycling & Composting", description: "County recycling guides, drop-off locations, hazardous waste events, and composting programs statewide.", eligibility: ["all residents"], url: "https://www.michigan.gov/egle/about/organization/materials-management/recycling", category: "Environment" },
  { title: "Michigan State Parks & Trails", description: "Over 100 state parks and 13,000+ miles of trails. Recreation Passport provides vehicle entry to all state parks.", eligibility: ["all residents"], url: "https://www.michigan.gov/dnr/places/state-parks", category: "Environment" },
  { title: "Environmental Justice Screening", description: "Identify communities disproportionately impacted by pollution using Michigan's EJ screening tool and get priority resources.", eligibility: ["communities"], url: "https://www.michigan.gov/egle/about/organization/environmental-justice", category: "Environment" },
  // Education
  { title: "Michigan Works! Career Services", description: "Free job search assistance, resume workshops, skills training, and career counseling at local American Job Centers.", eligibility: ["job seekers", "adults"], url: "https://www.michiganworks.org", category: "Education" },
  { title: "Goodwill Industries Job Training", description: "Workforce development programs including digital skills, retail training, and supported employment for individuals with barriers.", eligibility: ["job seekers", "disabilities"], url: "https://www.goodwill.org/jobs-training/", category: "Education" },
  { title: "Going PRO Talent Fund", description: "State-funded training grants for employers to train new and existing workers in high-demand industries.", eligibility: ["employers", "workers"], url: "https://www.michigan.gov/leo/bureaus-agencies/wd/programs/going-pro", category: "Education" },
  { title: "Michigan Reconnect", description: "Free community college tuition for adults 25+ without a degree. Covers in-district tuition and fees at any MI community college.", eligibility: ["adults 25+", "no degree"], url: "https://www.michigan.gov/reconnect", category: "Education" },
  { title: "Pell Grant & Financial Aid", description: "Federal Pell Grants provide up to $7,395/year for low-income students. Apply via FAFSA for Michigan colleges.", eligibility: ["students", "low-income"], url: "https://studentaid.gov/understand-aid/types/grants/pell", category: "Education" },
  { title: "Detroit at Work", description: "Career coaching, job training, and placement services for Detroit residents, with focus on high-growth sectors.", eligibility: ["job seekers", "adults"], url: "https://detroitatwork.com", category: "Education", counties: ["Wayne"] },
  { title: "West Michigan Works! Training", description: "Sector-specific training programs in healthcare, manufacturing, and IT for West Michigan residents.", eligibility: ["job seekers", "career changers"], url: "https://www.westmiworks.org", category: "Education", counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm"] },
  // Legal & Civic
  { title: "Michigan Legal Help", description: "Free legal information and self-help tools for family law, housing, consumer rights, and public benefits cases.", eligibility: ["all residents"], url: "https://michiganlegalhelp.org", category: "Legal & Civic" },
  { title: "Legal Aid of Western Michigan", description: "Free civil legal services for low-income individuals covering housing, family, consumer, and government benefits.", eligibility: ["low-income"], url: "https://lawestmi.org", category: "Legal & Civic", counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm", "Kalamazoo", "Calhoun"] },
  { title: "Lakeshore Legal Aid", description: "Free legal assistance in Southeast Michigan for housing disputes, domestic violence, immigration, and public benefits.", eligibility: ["low-income", "seniors"], url: "https://lakeshorelegalaid.org", category: "Legal & Civic", counties: ["Wayne", "Oakland", "Macomb", "St. Clair", "Monroe", "Genesee"] },
  { title: "ACLU of Michigan", description: "Civil rights advocacy and legal support for issues including criminal justice reform, voting rights, and immigrant rights.", eligibility: ["all residents"], url: "https://www.aclumich.org", category: "Legal & Civic" },
  { title: "Michigan Voter Information Center", description: "Register to vote, find your polling place, view sample ballots, and track your absentee ballot status online.", eligibility: ["eligible voters"], url: "https://mvic.sos.state.mi.us", category: "Legal & Civic" },
  { title: "Michigan Immigrant Rights Center", description: "Legal services and policy advocacy for immigrants including asylum, DACA, family petitions, and naturalization.", eligibility: ["immigrants", "families"], url: "https://michiganimmigrant.org", category: "Legal & Civic" },
  // Veterans & Seniors
  { title: "Michigan Veterans Affairs Agency", description: "Connects Michigan veterans and families to federal/state benefits, healthcare, education, and employment services.", eligibility: ["veterans", "families"], url: "https://www.michigan.gov/mvaa", category: "Veterans & Seniors" },
  { title: "VFW Michigan Programs", description: "Veterans of Foreign Wars posts across Michigan offering camaraderie, advocacy, emergency financial assistance, and community service.", eligibility: ["veterans"], url: "https://vfwmi.org", category: "Veterans & Seniors" },
  { title: "AARP Michigan", description: "Resources for adults 50+ including Medicare guidance, fraud prevention, caregiving support, and community engagement.", eligibility: ["seniors", "50+"], url: "https://states.aarp.org/michigan", category: "Veterans & Seniors" },
  { title: "Area Agency on Aging 1-B", description: "In-home services, meals, transportation, caregiver support, and Medicare/Medicaid counseling for Southeast Michigan seniors.", eligibility: ["seniors", "caregivers"], url: "https://www.aaa1b.org", category: "Veterans & Seniors", counties: ["Wayne", "Oakland", "Macomb", "Monroe", "Washtenaw", "Livingston", "St. Clair"] },
  { title: "Senior Resources of West Michigan", description: "Aging support services including Meals on Wheels, adult day care, respite care, and benefits counseling in West Michigan.", eligibility: ["seniors", "caregivers"], url: "https://www.seniorresourceswmi.org", category: "Veterans & Seniors", counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm", "Newaygo"] },
  { title: "DAV Michigan", description: "Disabled American Veterans providing free claims assistance, transportation to VA medical centers, and employment programs.", eligibility: ["veterans", "disabled veterans"], url: "https://www.dav.org/veterans/find-your-local-office/", category: "Veterans & Seniors" },
  // Youth & Family
  { title: "YMCA of Michigan", description: "Youth development, healthy living, and social responsibility programs including after-school care, swim lessons, and day camps.", eligibility: ["youth", "families"], url: "https://ymcadetroit.org", category: "Youth & Family" },
  { title: "Boys & Girls Clubs of Michigan", description: "Safe after-school and summer programs for youth ages 6–18 with academic support, leadership, and healthy lifestyle activities.", eligibility: ["youth", "teens"], url: "https://www.bgca.org/get-involved/find-a-club", category: "Youth & Family" },
  { title: "Michigan 4-H Youth Development", description: "MSU Extension 4-H programs in STEM, agriculture, leadership, and community service for youth in all 83 Michigan counties.", eligibility: ["youth", "teens"], url: "https://www.canr.msu.edu/4h/", category: "Youth & Family" },
  { title: "Big Brothers Big Sisters of Michigan", description: "One-to-one youth mentoring programs matching adult volunteers with children facing adversity for lasting, positive outcomes.", eligibility: ["youth", "mentors"], url: "https://www.bfrb.org", category: "Youth & Family" },
  { title: "Head Start / Early Head Start", description: "Federally funded early childhood education, nutrition, and family support for low-income families with children birth to age 5.", eligibility: ["children", "low-income"], url: "https://www.michigan.gov/mde/services/early-learners/head-start", category: "Youth & Family" },
  { title: "Detroit PAL Youth Sports", description: "Free and low-cost youth sports leagues in football, basketball, baseball, and more for Detroit-area children and teens.", eligibility: ["youth", "teens"], url: "https://www.detroitpal.org", category: "Youth & Family", counties: ["Wayne"] },
  { title: "West Michigan Youth Services", description: "Comprehensive youth programs including housing, counseling, and life skills for at-risk and homeless youth in West Michigan.", eligibility: ["youth", "at-risk"], url: "https://www.wmys.org", category: "Youth & Family", counties: ["Kent", "Ottawa", "Muskegon", "Allegan"] },
  // Disaster Prep
  { title: "American Red Cross – Michigan", description: "Disaster relief, emergency shelters, preparedness training, and home fire safety programs across all Michigan counties.", eligibility: ["all residents"], url: "https://www.redcross.org/local/michigan.html", category: "Disaster Prep" },
  { title: "Michigan State Police – Emergency Management", description: "Statewide emergency preparedness plans, hazard mitigation, and county-level emergency management coordination.", eligibility: ["all residents"], url: "https://www.michigan.gov/msp/divisions/emhsd", category: "Disaster Prep" },
  { title: "BE PREPARED Michigan", description: "Build your family emergency kit, create communication plans, and sign up for county-level alert systems.", eligibility: ["families", "individuals"], url: "https://www.michigan.gov/msp/divisions/emhsd/be-prepared", category: "Disaster Prep" },
  { title: "FEMA Disaster Assistance", description: "Federal disaster declarations, individual assistance, and hazard mitigation grants for Michigan communities.", eligibility: ["disaster-affected residents"], url: "https://www.fema.gov/disaster/declarations?field_state_tid=23", category: "Disaster Prep" },
  { title: "Wayne County Emergency Management", description: "Local emergency plans, severe weather alerts, and community preparedness resources for Wayne County residents.", eligibility: ["Wayne County residents"], url: "https://www.waynecounty.com/departments/hsem/", category: "Disaster Prep", counties: ["Wayne"] },
  { title: "Kent County Emergency Management", description: "Local hazard mitigation, severe weather preparedness, and emergency shelter information for Kent County.", eligibility: ["Kent County residents"], url: "https://www.accesskent.com/departments/emergency-management/", category: "Disaster Prep", counties: ["Kent"] },
  { title: "Michigan Community Action – Disaster Recovery", description: "Low-income disaster recovery assistance, temporary housing, and emergency supplies through local Community Action Agencies.", eligibility: ["low-income households"], url: "https://www.mcaaa.org", category: "Disaster Prep" },
  // Culture & Rec
  { title: "Michigan Activity Pass", description: "Free day passes to over 100 state parks, campgrounds, and recreation areas — available at any Michigan library.", eligibility: ["library card holders"], url: "https://www.michigan.gov/dnr/places/state-parks/map", category: "Culture & Rec" },
  { title: "Michigan Council for Arts & Cultural Affairs", description: "Grants, programs, and events supporting arts education, public art, and cultural programming statewide.", eligibility: ["organizations", "artists"], url: "https://www.michigan.gov/leo/bureaus-agencies/mcaca", category: "Culture & Rec" },
  { title: "Detroit Public Library", description: "Free digital resources, literacy programs, job readiness workshops, and community meeting spaces across 23 branches.", eligibility: ["Detroit residents"], url: "https://detroitpubliclibrary.org", category: "Culture & Rec", counties: ["Wayne"] },
  { title: "Grand Rapids Public Library", description: "Free programs including STEM labs, language learning, business development resources, and youth summer reading.", eligibility: ["Grand Rapids area residents"], url: "https://www.grpl.org", category: "Culture & Rec", counties: ["Kent"] },
  { title: "Michigan History Center", description: "Museums, archives, and historical sites preserving Michigan's heritage. Free admission days and educational programs.", eligibility: ["all residents"], url: "https://www.michigan.gov/mhc", category: "Culture & Rec" },
  { title: "Pure Michigan Trails", description: "Over 13,000 miles of multi-use trails for hiking, biking, and skiing. Trail maps, conditions, and accessibility info.", eligibility: ["all residents"], url: "https://www.michigan.org/trails", category: "Culture & Rec" },
  { title: "Michigan Philharmonic & Local Arts", description: "Affordable and free concerts, community theater, and cultural festivals across Michigan communities.", eligibility: ["all residents"], url: "https://www.michiganphil.org", category: "Culture & Rec" },
];

const SECTIONS = [
  { value: "community", label: "Community", icon: Heart },
  { value: "transportation", label: "Transportation", icon: Bus },
  { value: "energy", label: "Energy", icon: Zap },
  { value: "environment", label: "Environment", icon: TreePine },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "legal", label: "Legal & Civic", icon: Scale },
  { value: "veterans", label: "Veterans & Seniors", icon: Medal },
  { value: "youth", label: "Youth & Family", icon: Baby },
  { value: "disaster", label: "Disaster Prep", icon: ShieldAlert },
  { value: "cultural", label: "Culture & Rec", icon: Palette },
] as const;

const handleShare = async (program: SearchableProgram) => {
  const shareData = { title: program.title, text: program.description, url: program.url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const RECOMMENDED_TITLES: Record<string, string[]> = {
  Wayne: ["Meals on Wheels Michigan", "Lakeshore Legal Aid", "Detroit at Work", "Detroit Public Library", "Wayne County Emergency Management", "SMART & DDOT Transit (Metro Detroit)"],
  Oakland: ["Area Agency on Aging 1-B", "Lakeshore Legal Aid", "DTE Energy Efficiency Programs", "SMART & DDOT Transit (Metro Detroit)", "AARP Michigan", "Michigan Legal Help"],
  Kent: ["Senior Resources of West Michigan", "The Rapid (Grand Rapids)", "Grand Rapids Public Library", "Legal Aid of Western Michigan", "Kent County Emergency Management", "West Michigan Works! Training"],
  Genesee: ["Lakeshore Legal Aid", "Michigan Reconnect", "LIHEAP Heating Assistance", "Meals on Wheels Michigan", "American Red Cross – Michigan", "Michigan Legal Help"],
  Washtenaw: ["Area Agency on Aging 1-B", "Michigan Reconnect", "Michigan Works! Career Services", "EGLE Air Quality Alerts", "Michigan Activity Pass", "Michigan Legal Help"],
  Ingham: ["Michigan Works! Career Services", "Michigan Reconnect", "LIHEAP Heating Assistance", "Consumers Energy Efficiency Rebates", "Michigan Activity Pass", "AARP Michigan"],
};

const STATEWIDE_RECOMMENDED = [
  "Meals on Wheels Michigan", "Michigan Legal Help", "LIHEAP Heating Assistance",
  "Michigan Reconnect", "American Red Cross – Michigan", "Michigan Activity Pass",
  "AARP Michigan", "Michigan Works! Career Services",
];

const MAX_VISIBLE = 6;

function ProgramCard({ program }: { program: SearchableProgram }) {
  const meta = CATEGORY_META[program.category];
  return (
    <Card className="h-full hover-lift">
      <CardContent className="p-4 space-y-2 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px]">
            {meta?.label || program.category}
          </Badge>
          {!program.counties && <Badge variant="secondary" className="text-[10px]">Statewide</Badge>}
        </div>
        <h4 className="font-semibold text-sm text-foreground leading-snug">{program.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3">{program.description}</p>
        <div className="flex flex-wrap gap-1">
          {program.eligibility.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] capitalize">{tag}</Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={program.url} target="_blank" rel="noopener noreferrer">
              Visit Program <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => handleShare(program)} aria-label={`Share ${program.title}`}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryGrid({ label, icon: Icon, programs, county }: { label: string; icon: React.ElementType; programs: SearchableProgram[]; county: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? programs : programs.slice(0, MAX_VISIBLE);
  const hasMore = programs.length > MAX_VISIBLE;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <Badge variant="secondary" className="text-[10px]">{programs.length}</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((program) => (
          <ProgramCard key={`${label}-${program.title}`} program={program} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-4">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="gap-1.5 text-muted-foreground">
            {expanded ? (
              <><ChevronUp className="h-4 w-4" /> Show less</>
            ) : (
              <><ChevronDown className="h-4 w-4" /> Show {programs.length - MAX_VISIBLE} more</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

const SpotlightTabs = () => {
  const [search, setSearch] = useState("");
  const [browseAll, setBrowseAll] = useState(false);
  const { county } = useCounty();

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_PROGRAMS.filter((p) => {
      const countyMatch = !p.counties || !county || p.counties.includes(county);
      const textMatch =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.eligibility.some((e) => e.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      return countyMatch && textMatch;
    });
  }, [search, county]);

  const recommended = useMemo(() => {
    const titles = county && RECOMMENDED_TITLES[county]
      ? RECOMMENDED_TITLES[county]
      : STATEWIDE_RECOMMENDED;
    return titles
      .map((t) => ALL_PROGRAMS.find((p) => p.title === t))
      .filter(Boolean) as SearchableProgram[];
  }, [county]);

  const allPrograms = useMemo(() => {
    return ALL_PROGRAMS.filter((p) => !p.counties || !county || p.counties.includes(county));
  }, [county]);

  const isSearching = search.trim().length > 0;
  const showGrid = isSearching || browseAll;

  return (
    <section className="py-12" aria-labelledby="spotlights-heading">
      <div className="container">
        <div className="text-center mb-6">
          <h2 id="spotlights-heading" className="text-2xl font-bold text-foreground">
            Explore Community Resources
          </h2>
          <p className="mt-2 text-muted-foreground">
            Browse programs across 10 service categories — filtered to your county
          </p>
        </div>

        {/* Cross-category search */}
        <div className="mx-auto max-w-lg mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search all programs by name, category, or eligibility…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
              aria-label="Search all community resource programs"
            />
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {showGrid ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{(isSearching ? searchResults : allPrograms).length}</strong> program{(isSearching ? searchResults : allPrograms).length !== 1 ? "s" : ""}
                {isSearching ? " found" : " available"}{county ? ` for ${county} County` : ""}
              </p>
              {browseAll && (
                <Button variant="ghost" size="sm" onClick={() => { setBrowseAll(false); setSearch(""); }}>
                  <X className="h-4 w-4 mr-1" /> Back to categories
                </Button>
              )}
            </div>
            {(isSearching ? searchResults : allPrograms).length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No programs match your search. Try a different term.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(isSearching ? searchResults : allPrograms).map((program) => (
                  <ProgramCard key={`grid-${program.category}-${program.title}`} program={program} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recommended for You — 3x2 grid */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Recommended for {county ? `${county} County` : "You"}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.slice(0, 6).map((program) => (
                  <ProgramCard key={`rec-${program.title}`} program={program} />
                ))}
              </div>
              {county && (
                <div className="text-center mt-4">
                  <Button variant="link" size="sm" onClick={() => setBrowseAll(true)} className="text-primary gap-1">
                    View all recommendations for {county} County →
                  </Button>
                </div>
              )}
            </div>

            {/* Browse All button */}
            <div className="text-center mb-8">
              <Button variant="outline" onClick={() => setBrowseAll(true)} className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Browse All Programs
              </Button>
            </div>

            {/* Category grids (replace carousels) */}
            <div className="space-y-10">
              {SECTIONS.map(({ value, label, icon }) => {
                const categoryPrograms = ALL_PROGRAMS.filter(
                  (p) => p.category === label &&
                    (!p.counties || !county || p.counties.includes(county))
                );
                if (categoryPrograms.length === 0) return null;
                return (
                  <CategoryGrid
                    key={value}
                    label={label}
                    icon={icon}
                    programs={categoryPrograms}
                    county={county}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SpotlightTabs;
