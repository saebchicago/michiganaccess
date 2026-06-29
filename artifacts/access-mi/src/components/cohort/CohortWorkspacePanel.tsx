import { useCallback, useEffect, useState } from "react";
import { History, MessageSquare, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadCohortWorkspace,
  saveCohortVersion,
  addCohortComment,
  type CohortWorkspace,
} from "@/Services/cohortWorkspace";
import type { CohortCriteria } from "@/utils/cohortFilter";
import { supabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CohortWorkspacePanelProps {
  shareId: string;
  activeCriteria: CohortCriteria;
  enabled: Record<string, boolean>;
  resultCount: number;
  onLoadVersion: (criteria: CohortCriteria, enabled: Record<string, boolean>) => void;
}

export default function CohortWorkspacePanel({
  shareId,
  activeCriteria,
  enabled,
  resultCount,
  onLoadVersion,
}: CohortWorkspacePanelProps) {
  const [workspace, setWorkspace] = useState<CohortWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [authorLabel, setAuthorLabel] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLoading(true);
    try {
      const ws = await loadCohortWorkspace(shareId);
      setWorkspace(ws);
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSaveVersion = useCallback(async () => {
    try {
      await saveCohortVersion({
        shareId,
        criteria: activeCriteria,
        enabled,
        resultCount,
        changeNote: versionNote.trim() || undefined,
      });
      setVersionNote("");
      await refresh();
      toast.success("Saved new workspace version");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save version");
    }
  }, [shareId, activeCriteria, enabled, resultCount, versionNote, refresh]);

  const handleComment = useCallback(async () => {
    try {
      await addCohortComment({
        shareId,
        authorLabel,
        body: commentBody,
      });
      setCommentBody("");
      await refresh();
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    }
  }, [shareId, authorLabel, commentBody, refresh]);

  if (!supabaseConfigured) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 text-xs text-muted-foreground">
          Collaboration workspace requires Supabase configuration.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="py-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Collaboration workspace
          </h2>
          <Badge variant="outline" className="text-[10px]">
            UC8 Phase 2
          </Badge>
        </div>

        {loading && !workspace ? (
          <p className="text-xs text-muted-foreground">Loading workspace...</p>
        ) : !workspace ? (
          <p className="text-xs text-muted-foreground">
            Workspace not found. Deploy migration 20260629000002 to enable version
            history and comments.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Shared cohort <strong>{workspace.name}</strong> -{" "}
              {workspace.versions.length} version
              {workspace.versions.length === 1 ? "" : "s"},{" "}
              {workspace.comments.length} comment
              {workspace.comments.length === 1 ? "" : "s"}.
            </p>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold">Save new version</h3>
              <input
                type="text"
                className="text-sm border rounded-md px-3 py-1.5 bg-background w-full"
                placeholder="What changed? (optional)"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                aria-label="Version change note"
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={handleSaveVersion}
              >
                <Save className="h-3 w-3" /> Save version ({resultCount} ZIPs)
              </Button>
            </div>

            {workspace.versions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold">Version history</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {workspace.versions.map((v) => (
                    <li
                      key={v.versionId}
                      className="rounded-md border px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold">v{v.versionNumber}</span>
                        <span className="text-muted-foreground ml-2">
                          {v.resultCount} ZIPs -{" "}
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                        {v.changeNote && (
                          <p className="text-muted-foreground mt-0.5">
                            {v.changeNote}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px]"
                        onClick={() => onLoadVersion(v.criteria, v.enabled)}
                      >
                        Load
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-semibold flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Comments
              </h3>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  className="text-sm border rounded-md px-3 py-1.5 bg-background flex-1 min-w-[120px]"
                  placeholder="Your name or team label"
                  value={authorLabel}
                  onChange={(e) => setAuthorLabel(e.target.value)}
                  aria-label="Comment author label"
                />
              </div>
              <textarea
                className="text-sm border rounded-md px-3 py-2 bg-background w-full min-h-[72px]"
                placeholder="Add a note for your team..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                aria-label="Workspace comment"
              />
              <Button
                size="sm"
                variant="default"
                className="text-xs"
                onClick={handleComment}
                disabled={!authorLabel.trim() || !commentBody.trim()}
              >
                Post comment
              </Button>
              {workspace.comments.length > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto pt-1">
                  {workspace.comments.map((c) => (
                    <li
                      key={c.commentId}
                      className="rounded-md bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold">{c.authorLabel}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                      <p className="mt-1 leading-relaxed">{c.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}