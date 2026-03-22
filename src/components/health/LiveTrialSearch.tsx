import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, Loader2, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchMichiganTrials, type ClinicalTrial } from "@/lib/clinicaltrials-client";

const SUGGESTIONS = ["Cancer", "Diabetes", "Heart Disease", "Mental Health", "Alzheimer's", "COPD", "Breast Cancer"];

const STATUS_COLORS: Record<string, string> = {
  RECRUITING: "bg-michigan-forest text-white",
  "ACTIVE_NOT_RECRUITING": "bg-michigan-gold text-black",
  COMPLETED: "bg-muted text-muted-foreground",
};

export default function LiveTrialSearch() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: trials, isLoading, isFetched } = useQuery({
    queryKey: ["clinical-trials", searchTerm],
    queryFn: () => searchMichiganTrials(searchTerm || undefined),
    staleTime: 60 * 60 * 1000,
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (term?: string) => {
    const t = term || query;
    if (t.trim()) {
      setQuery(t);
      setSearchTerm(t.trim());
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-5 w-5 text-michigan-teal" />
          Search Live Clinical Trials in Michigan
        </CardTitle>
        <CardDescription>
          Real-time data from ClinicalTrials.gov — currently recruiting studies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by condition..."
            className="text-sm"
          />
          <Button type="submit" size="sm" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Searching ClinicalTrials.gov...</span>
          </div>
        )}

        {isFetched && trials && trials.length > 0 && (
          <div className="space-y-2" aria-live="polite">
            <p className="text-xs text-muted-foreground">{trials.length} recruiting trials in Michigan</p>
            {trials.slice(0, 8).map((trial) => (
              <a
                key={trial.nctId}
                href={trial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge variant="outline" className="text-[8px]">{trial.nctId}</Badge>
                      <Badge className={`text-[8px] ${STATUS_COLORS[trial.status] || "bg-muted"}`}>
                        {trial.status.replace(/_/g, " ")}
                      </Badge>
                      {trial.phase !== "N/A" && <Badge variant="secondary" className="text-[8px]">{trial.phase}</Badge>}
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">{trial.title}</p>
                    {trial.locations.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{trial.locations.join(" · ")}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{trial.sponsor}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        )}

        {isFetched && trials && trials.length === 0 && searchTerm && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recruiting trials found for "{searchTerm}" in Michigan. Try a different condition.
          </p>
        )}

        <p className="text-[10px] text-muted-foreground">
          Source: ClinicalTrials.gov (U.S. NLM). Shows currently recruiting studies only. Always verify with the research institution.
        </p>
      </CardContent>
    </Card>
  );
}
