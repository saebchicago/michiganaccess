import { useState, useMemo } from "react";
import { BookOpen, Search, ExternalLink, MapPin } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CitizenInitiativeBanner from "@/components/civic/CitizenInitiativeBanner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MICHIGAN_LIBRARY_SYSTEMS = [
  { name: "Michigan eLibrary (MeL)", url: "https://mel.org", desc: "Statewide digital library - free access to databases, eBooks, and research tools for all Michigan residents.", coverage: "Statewide" },
  { name: "Detroit Public Library", url: "https://detroitpubliclibrary.org", desc: "24 branches serving Detroit with free internet, programming, and community resources.", coverage: "Wayne County" },
  { name: "Ann Arbor District Library", url: "https://aadl.org", desc: "Innovative library system with extensive digital collections and community events.", coverage: "Washtenaw County" },
  { name: "Kent District Library", url: "https://kdl.org", desc: "20 branches across Kent County offering reading programs, job resources, and technology access.", coverage: "Kent County" },
  { name: "Capital Area District Libraries", url: "https://cadl.org", desc: "13 branches serving the Lansing region with free WiFi, computer access, and literacy programs.", coverage: "Ingham County" },
  { name: "Genesee District Library", url: "https://thegdl.org", desc: "19 branches across Genesee County with children's programs and community meeting spaces.", coverage: "Genesee County" },
  { name: "Saginaw Public Libraries", url: "https://saginawlibrary.org", desc: "Three locations providing free access to books, technology, and educational programs.", coverage: "Saginaw County" },
  { name: "Grand Rapids Public Library", url: "https://grpl.org", desc: "Multiple branches with job search assistance, digital literacy, and cultural programming.", coverage: "Kent County" },
  { name: "Library of Michigan", url: "https://michigan.gov/libraryofmichigan", desc: "State library providing research support, government documents, and interlibrary loan coordination.", coverage: "Statewide" },
];

const LibrariesPage = () => {
  const [search, setSearch] = useState("");

  usePageMeta({
    title: "Michigan Public Libraries | Access Michigan",
    description: "Find public libraries across Michigan's 83 counties. Free internet, digital resources, community programs, and more.",
    path: "/libraries",
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return MICHIGAN_LIBRARY_SYSTEMS;
    const q = search.toLowerCase();
    return MICHIGAN_LIBRARY_SYSTEMS.filter(
      (lib) => lib.name.toLowerCase().includes(q) || lib.coverage.toLowerCase().includes(q) || lib.desc.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Civic Data Hub", href: "/civic-data-hub" }, { label: "Libraries" }]} />

      <section className="py-14 md:py-18 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Public Libraries</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Michigan Public Libraries</h1>
          <p className="text-muted-foreground">
            Every Michigan resident has free access to library services - internet, databases, eBooks, job resources, and community programs.
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        <CitizenInitiativeBanner />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by library name or county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search libraries"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lib) => (
            <Card key={lib.name} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{lib.name}</h3>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    <MapPin className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                    {lib.coverage}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{lib.desc}</p>
                <a href={lib.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    Visit Website <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No libraries found matching "{search}". Try a different county or library name.
          </p>
        )}

        <Card className="border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">
              <strong>Find your local library:</strong> Visit the{" "}
              <a href="https://mel.org/find-a-library" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Michigan eLibrary directory
              </a>{" "}
              for a complete listing of all public libraries in Michigan. Library cards are free for all state residents.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LibrariesPage;
