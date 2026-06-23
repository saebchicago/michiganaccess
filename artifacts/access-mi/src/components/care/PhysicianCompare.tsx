import { useState } from "react";
import { Search, Loader2, ExternalLink, GraduationCap, Building2, Phone, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePhysicianCompare, type PhysicianData } from "@/hooks/usePhysicianCompare";

function PhysicianCard({ doc }: { doc: PhysicianData }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {doc.firstName} {doc.lastName}
            {doc.credential && <span className="text-muted-foreground font-normal">, {doc.credential}</span>}
          </p>
          <p className="text-xs text-primary">{doc.specialty}</p>
        </div>
        {doc.acceptsMedicare && (
          <Badge variant="outline" className="text-[9px] border-michigan-forest/30 text-michigan-forest-deep shrink-0">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Medicare
          </Badge>
        )}
      </div>

      {doc.groupPractice && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span>{doc.groupPractice}</span>
        </div>
      )}

      {doc.hospitalAffiliation && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0 text-primary" />
          <span>Hospital: {doc.hospitalAffiliation}</span>
        </div>
      )}

      {doc.medicalSchool && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GraduationCap className="h-3 w-3 shrink-0" />
          <span>{doc.medicalSchool}{doc.graduationYear ? ` (${doc.graduationYear})` : ""}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{doc.city}, MI {doc.zip}</span>
        {doc.phone && (
          <a href={`tel:${doc.phone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Phone className="h-3 w-3" /> {doc.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function PhysicianCompare() {
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const { data, isLoading } = usePhysicianCompare(searchName, searchCity || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lastName.length >= 2) {
      setSearchName(lastName);
      setSearchCity(city);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-5 w-5 text-primary" />
          Medicare Provider Details
        </CardTitle>
        <CardDescription>
          Medical school, hospital affiliations, and Medicare participation - data not in NPI registry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doctor's last name"
            className="max-w-[200px]"
            aria-label="Provider last name"
          />
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            className="max-w-[160px]"
            aria-label="City filter"
          />
          <Button type="submit" size="sm" aria-label="Search physicians" disabled={lastName.length < 2 || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        <div aria-live="polite" aria-atomic="true">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Searching CMS provider data...</span>
          </div>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{data.length} provider{data.length > 1 ? "s" : ""} found</p>
            {data.map((doc) => (
              <PhysicianCard key={doc.npi || `${doc.firstName}-${doc.lastName}`} doc={doc} />
            ))}
          </div>
        )}

        {!isLoading && searchName && data && data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No Medicare-participating providers found for "{searchName}"{searchCity ? ` in ${searchCity}` : ""}.
            Try a different spelling or remove the city filter.
          </p>
        )}

        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          Source:{" "}
          <a
            href="https://data.cms.gov/provider-data/dataset/mj5m-pzi6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            CMS Physician Compare <ExternalLink className="h-2.5 w-2.5" />
          </a>{" "}
          - Medicare-participating providers, updated quarterly
        </p>
      </CardContent>
    </Card>
  );
}
