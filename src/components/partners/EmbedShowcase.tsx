import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const WIDGETS = [
  {
    name: "Care Finder Widget",
    description: "Embed a quick-search widget for healthcare, community resources, and support across Michigan.",
    embedCode: `<iframe src="https://accessmi.org/embed" width="100%" height="280" frameborder="0" title="Access Michigan Care Finder"></iframe>`,
    previewUrl: "/embed",
  },
  {
    name: "County Dashboard Widget",
    description: "Embed a county-specific health overview for your service area. Replace [county] with the county slug.",
    embedCode: `<iframe src="https://accessmi.org/county/wayne" width="100%" height="600" frameborder="0" title="Access Michigan County Dashboard"></iframe>`,
    previewUrl: "/county/wayne",
  },
  {
    name: "Resource Directory Widget",
    description: "Filterable community resource directory with 601+ entries. Ideal for 211 integrations and health system portals.",
    embedCode: `<iframe src="https://accessmi.org/resources" width="100%" height="700" frameborder="0" title="Access Michigan Resources"></iframe>`,
    previewUrl: "/resources",
  },
];

export default function EmbedShowcase() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Embed code copied to clipboard");
  };

  return (
    <section aria-labelledby="embed-heading">
      <div className="text-center mb-8">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
          <Code className="h-3 w-3 mr-1" />
          Embeddable Widgets
        </Badge>
        <h2 id="embed-heading" className="text-2xl font-bold text-foreground">
          Embed Access Michigan on Your Site
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm">
          Copy-paste iframe widgets for health system portals, county websites, and community organization pages. No API key required.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {WIDGETS.map((w) => (
          <Card key={w.name} className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{w.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{w.description}</p>
              <div className="rounded-lg bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-24">
                {w.embedCode}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyCode(w.embedCode)} className="flex-1">
                  <Copy className="h-3 w-3 mr-1" /> Copy Code
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={w.previewUrl} target="_blank" rel="noopener">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
