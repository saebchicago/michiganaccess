import { Clock, Users, DollarSign, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GoverningBoard } from "@/data/civicBoards";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  health:         { bg: "bg-teal-50 dark:bg-teal-950/20", text: "text-teal-700 dark:text-teal-400", label: "Health" },
  housing:        { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", label: "Housing" },
  education:      { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400", label: "Education" },
  transportation: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", label: "Transportation" },
  environment:    { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", label: "Environment" },
  emergency:      { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", label: "Emergency" },
  utilities:      { bg: "bg-slate-50 dark:bg-slate-950/20", text: "text-slate-700 dark:text-slate-400", label: "Utilities" },
  federal:        { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400", label: "Federal" },
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  moderate: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  competitive: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy to Join",
  moderate: "Moderate",
  competitive: "Competitive",
};

export default function BoardCard({ board }: { board: GoverningBoard }) {
  const cat = CATEGORY_STYLES[board.category] ?? CATEGORY_STYLES.utilities;

  return (
    <Card className="h-full flex flex-col">
      {/* Category header */}
      <div className={`px-4 py-2 ${cat.bg} border-b border-border/50 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-[10px] ${cat.text} border-current`}>
            {cat.label} · {board.subcategory}
          </Badge>
          <Badge className={`text-[10px] ${DIFFICULTY_STYLES[board.difficultyToJoin]}`}>
            {DIFFICULTY_LABELS[board.difficultyToJoin]}
          </Badge>
        </div>
      </div>

      <CardContent className="py-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-foreground mb-1">{board.name}</h3>
        <p className="text-[10px] text-muted-foreground mb-3">{board.statutoryBasis}</p>

        {/* Info pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
            <Users className="h-3 w-3" /> {board.appointedBy}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> {board.typicalTermYears}-yr term
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
            <DollarSign className="h-3 w-3" /> {board.compensationNote}
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline" className="text-[10px]">
            <MapPin className="h-3 w-3 mr-1" />
            {board.michiganCount} statewide
            {board.seRegionCount ? ` · ${board.seRegionCount} in SE Michigan` : ""}
          </Badge>
        </div>

        {/* National comparison */}
        {board.nationalComparison && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-2.5 mb-3">
            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
              {board.nationalComparison}
            </p>
          </div>
        )}

        {/* Why it matters */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
          {board.whyItMatters}
        </p>

        {/* Time + Apply */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {board.timeCommitment}
          </span>
          <span className="text-[10px] text-primary font-medium inline-flex items-center gap-1">
            {board.applicationUrl.startsWith("http") ? (
              <a href={board.applicationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Apply <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span>{board.applicationUrl}</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
