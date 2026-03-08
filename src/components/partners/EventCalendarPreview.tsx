import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function EventCalendarPreview() {
  const { data: events = [] } = useQuery({
    queryKey: ["partner-events-preview"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("community_events_public" as any)
        .select("id, title, event_date, city, county, event_type, is_free")
        .gte("event_date", today)
        .eq("is_active", true)
        .order("event_date", { ascending: true })
        .limit(6);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section aria-labelledby="events-heading">
      <div className="text-center mb-8">
        <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          Community Events
        </Badge>
        <h2 id="events-heading" className="text-2xl font-bold text-foreground">
          Upcoming Health & Community Events
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm">
          Static event calendar sourced from Michigan nonprofits, health systems, and civic organizations. Ideal for embedding or sharing with your community.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {events.map((evt) => (
            <Card key={evt.id} className="hover-lift">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {evt.event_type.replace(/_/g, " ")}
                  </Badge>
                  {evt.is_free && (
                    <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                      Free
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{evt.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(evt.event_date), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {evt.city}, {evt.county} County
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No upcoming events found. Check back soon or visit the full events page.
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to="/events">
            View All Events <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
