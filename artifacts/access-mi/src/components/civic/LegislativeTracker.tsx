import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Scale, ExternalLink, Loader2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MiBill {
  identifier: string;
  title: string;
  latestAction: string;
  latestActionDate: string;
  chamber: string;
  url: string;
}

// Mock data - replace with Open States API when key is available
const MOCK_BILLS: MiBill[] = [
  { identifier: "HB 4001", title: "Medicaid expansion coverage for postpartum period", latestAction: "Referred to Health Policy Committee", latestActionDate: "2026-03-18", chamber: "lower", url: "https://www.legislature.mi.gov/Bills" },
  { identifier: "SB 2105", title: "PFAS remediation funding for municipal water systems", latestAction: "Passed Senate, sent to House", latestActionDate: "2026-03-15", chamber: "upper", url: "https://www.legislature.mi.gov/Bills" },
  { identifier: "HB 3842", title: "Data center tax exemption moratorium extension", latestAction: "Committee hearing scheduled", latestActionDate: "2026-03-12", chamber: "lower", url: "https://www.legislature.mi.gov/Bills" },
  { identifier: "SB 1987", title: "Childcare provider licensing reform and funding", latestAction: "Enrolled, awaiting Governor signature", latestActionDate: "2026-03-10", chamber: "upper", url: "https://www.legislature.mi.gov/Bills" },
  { identifier: "HB 4210", title: "Broadband infrastructure investment (BEAD implementation)", latestAction: "Second reading in committee", latestActionDate: "2026-03-08", chamber: "lower", url: "https://www.legislature.mi.gov/Bills" },
];

const CATEGORIES = ["All", "Health", "Environment", "Economic", "Education", "Housing"] as const;

async function fetchBills(): Promise<MiBill[]> {
  // Open States API requires a free key - using mock data until configured
  // To enable: get key at openstates.org/accounts/signup, set as env var
  try {
    const apiKey = import.meta.env.VITE_OPENSTATES_API_KEY;
    if (!apiKey) return MOCK_BILLS;

    const res = await fetch(
      `https://v3.openstates.org/bills?jurisdiction=Michigan&sort=updated_desc&per_page=10`,
      { headers: { "X-API-KEY": apiKey } }
    );
    if (!res.ok) return MOCK_BILLS;
    const data = await res.json();
    return (data.results || []).map((b: any) => ({
      identifier: b.identifier,
      title: b.title,
      latestAction: b.latest_action_description || "",
      latestActionDate: b.latest_action_date || "",
      chamber: b.from_organization?.classification || "",
      url: b.openstates_url || "https://www.legislature.mi.gov/Bills",
    }));
  } catch {
    return MOCK_BILLS;
  }
}

export default function LegislativeTracker() {
  const [category, setCategory] = useState<string>("All");
  const { data: bills, isLoading } = useQuery({
    queryKey: ["mi-bills"],
    queryFn: fetchBills,
    staleTime: 60 * 60 * 1000,
  });

  const displayed = bills || MOCK_BILLS;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-primary" />
            Michigan Legislative Activity
            <Badge variant="outline" className="text-[8px] ml-auto">
              <Activity className="h-2.5 w-2.5 mr-0.5" /> Updated
            </Badge>
          </CardTitle>
          <CardDescription>Bills with health, social, and infrastructure impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading bills...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map((bill) => (
                <a
                  key={bill.identifier}
                  href={bill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="secondary" className="text-[9px]">{bill.identifier}</Badge>
                        <Badge variant="outline" className="text-[8px]">{bill.chamber === "upper" ? "Senate" : "House"}</Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{bill.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{bill.latestAction} · {bill.latestActionDate}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Source: Michigan Legislature / Open States. Bills shown are illustrative until API key is configured.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
