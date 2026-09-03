/**
 * Reviewer dashboard.
 *
 * Every query here is allowed only by an RLS policy that calls
 * public.is_staff(auth.uid()). Signing out or losing the role makes the same
 * requests fail at the database, not just disappear from the UI.
 */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Queue = "partnership_submissions" | "resource_submissions" | "community_events";

const QUEUES: { id: Queue; label: string }[] = [
  { id: "partnership_submissions", label: "Partnership applications" },
  { id: "resource_submissions", label: "Resource submissions" },
  { id: "community_events", label: "Event submissions" },
];

function useQueueRows(queue: Queue) {
  return useQuery({
    queryKey: ["admin-queue", queue],
    queryFn: async () => {
      const orderCol = queue === "community_events" ? "created_at" : "submitted_at";
      const { data, error } = await supabase
        .from(queue)
        .select("*")
        .order(orderCol, { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Record<string, any>[];
    },
    staleTime: 30_000,
  });
}

function QueuePanel({ queue }: { queue: Queue }) {
  const { data, isLoading, error } = useQueueRows(queue);
  const qc = useQueryClient();

  const decide = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const patch =
        queue === "community_events"
          ? { is_active: approve }
          : {
              status: approve ? "approved" : "rejected",
              reviewed_at: new Date().toISOString(),
            };
      const { error: err } = await supabase.from(queue).update(patch).eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-queue", queue] });
      toast.success("Decision saved.");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed."),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading queue...</p>;
  if (error)
    return (
      <p className="text-sm text-destructive">
        Could not load this queue: {error instanceof Error ? error.message : "unknown error"}
      </p>
    );
  if ((data ?? []).length === 0)
    return <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>;

  return (
    <ul className="space-y-3">
      {(data ?? []).map((row) => {
        const pending =
          queue === "community_events" ? row.is_active !== true : row.status === "pending";
        const title = row.organization_name ?? row.title ?? row.resource_type ?? row.id;
        return (
          <li key={row.id} className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{title}</span>
              <Badge variant={pending ? "outline" : "secondary"} className="text-[10px]">
                {queue === "community_events"
                  ? row.is_active === true
                    ? "published"
                    : "awaiting review"
                  : String(row.status ?? "pending")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {row.description ?? row.event_type ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {[row.contact_name, row.contact_email, row.contact_phone, row.city, row.county]
                .filter(Boolean)
                .join(" - ")}
            </p>
            {pending && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => decide.mutate({ id: row.id, approve: true })}
                  disabled={decide.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decide.mutate({ id: row.id, approve: false })}
                  disabled={decide.isPending}
                >
                  Reject
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminPage() {
  const { user, roles, signOut } = useAuth();
  const [tab, setTab] = useState<Queue>("partnership_submissions");

  return (
    <>
      <Helmet>
        <title>Moderation queue | Access Michigan</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Moderation queue</h1>
              <p className="text-sm text-muted-foreground">
                Signed in as {user?.email} ({roles.join(", ") || "no role"}).
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submissions awaiting review</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as Queue)}>
                <TabsList className="mb-4 flex-wrap h-auto">
                  {QUEUES.map((q) => (
                    <TabsTrigger key={q.id} value={q.id} className="text-xs">
                      {q.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {QUEUES.map((q) => (
                  <TabsContent key={q.id} value={q.id}>
                    <QueuePanel queue={q.id} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
