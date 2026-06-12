import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Search,
  Filter,
  Users,
  Heart,
  Stethoscope,
  GraduationCap,
  ExternalLink,
  Phone,
  Mail,
  X,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunityEvents, EVENT_TYPES, type CommunityEvent } from "@/hooks/useCommunityEvents";
import { motion, AnimatePresence } from "framer-motion";
import { useCounty } from "@/contexts/CountyContext";
import ShareMenu from "@/components/shared/ShareMenu";
import CommunityEventSubmissionForm from "@/components/community/CommunityEventSubmissionForm";
import { Separator } from "@/components/ui/separator";
import CivicDataCallout from "@/components/shared/CivicDataCallout";

const typeIcons: Record<string, typeof Heart> = {
  health_fair: Heart,
  screening: Stethoscope,
  support_group: Users,
  workshop: GraduationCap,
};

const typeColors: Record<string, string> = {
  health_fair: "bg-primary/10 text-primary border-primary/20",
  screening: "bg-accent/10 text-accent-foreground border-accent/20",
  support_group: "bg-secondary/80 text-secondary-foreground border-secondary",
  workshop: "bg-muted text-muted-foreground border-border",
};

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${ampm}`;
}

function EventCard({ event }: { event: CommunityEvent }) {
  const Icon = typeIcons[event.event_type] ?? CalendarIcon;
  const colorClass = typeColors[event.event_type] ?? typeColors.workshop;
  const typeLabel = EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      layout
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className={`${colorClass} gap-1`}>
              <Icon className="h-3 w-3" />
              {typeLabel}
            </Badge>
            {event.is_free && (
              <Badge variant="secondary" className="shrink-0">
                Free
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-snug mt-2">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {event.description && (
            <p className="text-muted-foreground line-clamp-2">{event.description}</p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-foreground">
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">
                {format(parseISO(event.event_date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            {(event.start_time || event.end_time) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                {formatTime(event.start_time)}
                {event.end_time && ` – ${formatTime(event.end_time)}`}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {event.location_name}, {event.city}, {event.county} County
              </span>
            </div>
          </div>

          {event.organizer && (
            <p className="text-xs text-muted-foreground">
              Organized by <span className="font-medium">{event.organizer}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t items-center">
            <ShareMenu title={event.title} url={`https://accessmi.org/events`} />
            {event.address && (
              <Button size="sm" variant="default" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${event.address}, ${event.city}, MI ${event.zip || ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-3 w-3" /> Get Directions
                </a>
              </Button>
            )}
            {event.registration_required && event.registration_url && (
              <Button size="sm" asChild>
                <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                  Register <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            {event.contact_phone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${event.contact_phone}`}>
                  <Phone className="h-3 w-3" /> Call
                </a>
              </Button>
            )}
            {event.contact_email && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${event.contact_email}`}>
                  <Mail className="h-3 w-3" /> Email
                </a>
              </Button>
            )}
            {event.website && (
              <Button size="sm" variant="ghost" asChild>
                <a href={event.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" /> Website
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CommunityEventsPage() {
  const { county: globalCounty } = useCounty();
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState<string>("");
  const [county, setCounty] = useState<string>("");

  const effectiveCounty = county || globalCounty || undefined;

  const { data: allEvents } = useCommunityEvents({});
  const { data: events, isLoading } = useCommunityEvents({
    eventType: eventType || undefined,
    county: effectiveCounty || undefined,
    search: search || undefined,
  });

  const counties = useMemo(() => {
    if (!allEvents) return [];
    return [...new Set(allEvents.map((e) => e.county))].sort();
  }, [allEvents]);

  const hasActiveFilters = !!search || !!eventType || !!county;

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[
              { label: "Community Events" },
            ]}
          />
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <CalendarIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Community Health Events</h1>
              <p className="text-muted-foreground">
                Upcoming health fairs, screenings, support groups, and workshops across Michigan
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={eventType || "all"} onValueChange={(v) => setEventType(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={county || "all"} onValueChange={(v) => setCounty(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-44">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setEventType("");
                  setCounty("");
                }}
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Showing {events.length} upcoming event{events.length !== 1 && "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium">No upcoming events found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </section>

      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <CivicDataCallout />
      </section>

      <section className="container mx-auto max-w-3xl px-4 pb-12">
        <Separator className="mb-8" />
        <CommunityEventSubmissionForm />
      </section>
    </Layout>
  );
}
