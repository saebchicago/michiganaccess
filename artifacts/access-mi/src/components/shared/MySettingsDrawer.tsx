/**
 * MySettingsDrawer - optional personalization panel.
 * All data stays in localStorage on the user's device.
 */
import { useState } from "react";
import { Settings, Trash2, Save, Info, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePersonalProfile, type PersonalProfile } from "@/hooks/usePersonalProfile";
import { toast } from "sonner";
import { clearLocalActivity } from "@/utils/clearLocalActivity";

const COVERAGE_OPTIONS: { value: PersonalProfile["coverageType"]; label: string }[] = [
  { value: "medicaid", label: "Medicaid / Healthy Michigan" },
  { value: "medicare", label: "Medicare" },
  { value: "private", label: "Private / Employer" },
  { value: "uninsured", label: "Uninsured" },
  { value: "unknown", label: "Not sure" },
];

const MOBILITY_OPTIONS: { value: PersonalProfile["mobility"]; label: string }[] = [
  { value: "drives", label: "I have a car" },
  { value: "no_car", label: "No car" },
  { value: "limited", label: "Limited mobility" },
];

const HOUSING_OPTIONS: { value: PersonalProfile["housingStatus"]; label: string }[] = [
  { value: "stable", label: "Stable housing" },
  { value: "at_risk", label: "At risk of losing housing" },
  { value: "homeless", label: "Experiencing homelessness" },
];

const INCOME_OPTIONS: { value: PersonalProfile["incomeBand"]; label: string }[] = [
  { value: "low", label: "Low income" },
  { value: "moderate", label: "Moderate income" },
  { value: "higher", label: "Higher income" },
  { value: "unknown", label: "Prefer not to say" },
];

const UTILITY_CHOICES = ["DTE Energy", "Consumers Energy", "SEMCO Energy", "Other"];

export default function MySettingsDrawer() {
  const { profile, updateProfile, clearProfile } = usePersonalProfile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PersonalProfile>(profile);

  const handleOpen = (o: boolean) => {
    if (o) setDraft(profile);
    setOpen(o);
  };

  const handleSave = () => {
    updateProfile(draft);
    toast.success("Settings saved to your device");
    setOpen(false);
  };

  const handleClear = () => {
    // The drawer promises "You can clear it anytime". Clearing only the
    // profile key left recent searches, the last 20 pages viewed, ZIP,
    // county and saved resources behind, so the promise overstated what
    // the button did. clearLocalActivity removes everything except
    // display preferences - see src/utils/clearLocalActivity.ts.
    clearProfile();
    setDraft({});
    const { removed } = clearLocalActivity();
    toast.success(
      removed > 0
        ? `Cleared ${removed} saved item${removed === 1 ? "" : "s"} from this device, including recent searches and pages viewed.`
        : "Nothing was stored on this device.",
    );
  };

  const toggleUtility = (u: string) => {
    const current = draft.utilities ?? [];
    setDraft({
      ...draft,
      utilities: current.includes(u) ? current.filter((x) => x !== u) : [...current, u],
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" aria-label="Open My Settings">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">My Settings</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> My Settings
          </SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            Optional personalization stored on your device only. We never send this data to a server. You can clear it anytime.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* ZIP */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-zip" className="text-xs font-medium">Primary ZIP code</Label>
            <Input
              id="profile-zip"
              placeholder="e.g. 48226"
              maxLength={5}
              value={draft.primaryZip ?? ""}
              onChange={(e) => setDraft({ ...draft, primaryZip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
            />
          </div>

          {/* Coverage */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Coverage type</Label>
            <Select value={draft.coverageType ?? ""} onValueChange={(v) => setDraft({ ...draft, coverageType: v as PersonalProfile["coverageType"] })}>
              <SelectTrigger><SelectValue placeholder="Select coverage" /></SelectTrigger>
              <SelectContent>
                {COVERAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value!}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobility */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Transportation</Label>
            <Select value={draft.mobility ?? ""} onValueChange={(v) => setDraft({ ...draft, mobility: v as PersonalProfile["mobility"] })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {MOBILITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value!}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Housing */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Housing situation</Label>
            <Select value={draft.housingStatus ?? ""} onValueChange={(v) => setDraft({ ...draft, housingStatus: v as PersonalProfile["housingStatus"] })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {HOUSING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value!}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Income band */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Income level (approximate)</Label>
            <Select value={draft.incomeBand ?? ""} onValueChange={(v) => setDraft({ ...draft, incomeBand: v as PersonalProfile["incomeBand"] })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {INCOME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value!}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Utilities */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Utility providers</Label>
            <div className="flex flex-wrap gap-1.5">
              {UTILITY_CHOICES.map((u) => (
                <Badge
                  key={u}
                  variant={(draft.utilities ?? []).includes(u) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleUtility(u)}
                >
                  {u}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This information is stored only in your browser's local storage. It is never sent to our servers. Anyone using this device can see it, so if that is a concern, clear it with the button below - that also removes your recent searches and the pages you have viewed.
            </p>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="destructive" size="sm" onClick={handleClear} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Clear my activity
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5 ml-auto">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
