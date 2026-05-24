import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Plus, Trash2, Download, Bell } from "lucide-react";

interface Reminder {
  id: string;
  text: string;
  dueDate: string;
}

const generateICS = (reminders: Reminder[]): string => {
  const events = reminders
    .filter((r) => r.text && r.dueDate)
    .map((r) => {
      const date = r.dueDate.replace(/-/g, "");
      return `BEGIN:VEVENT
DTSTART;VALUE=DATE:${date}
DTEND;VALUE=DATE:${date}
SUMMARY:${r.text}
DESCRIPTION:Reminder from Access Michigan - accessmi.org
STATUS:CONFIRMED
END:VEVENT`;
    })
    .join("\n");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Access Michigan//Reminders//EN
CALSCALE:GREGORIAN
${events}
END:VCALENDAR`;
};

const CareTeamReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", text: "", dueDate: "" },
  ]);

  const addReminder = () => {
    if (reminders.length >= 3) return;
    setReminders([...reminders, { id: Date.now().toString(), text: "", dueDate: "" }]);
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const updateReminder = (id: string, field: "text" | "dueDate", value: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleDownloadICS = () => {
    const validReminders = reminders.filter((r) => r.text && r.dueDate);
    if (validReminders.length === 0) return;
    const ics = generateICS(validReminders);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "care-reminders.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = reminders.filter((r) => r.text && r.dueDate).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Follow-Up Reminders
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add up to 3 reminders and download them as a calendar file. Nothing is stored on our servers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.map((reminder, index) => (
          <div key={reminder.id} className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                placeholder={
                  index === 0
                    ? "Schedule follow-up with cardiologist"
                    : index === 1
                    ? "Refill inhaler prescription"
                    : "Ask school nurse about asthma plan"
                }
                value={reminder.text}
                onChange={(e) => updateReminder(reminder.id, "text", e.target.value)}
                maxLength={100}
              />
              <Input
                type="date"
                value={reminder.dueDate}
                onChange={(e) => updateReminder(reminder.id, "dueDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {reminders.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeReminder(reminder.id)} className="shrink-0 mt-1" aria-label="Remove reminder">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between flex-wrap gap-2">
          {reminders.length < 3 && (
            <Button variant="outline" size="sm" onClick={addReminder}>
              <Plus className="h-3.5 w-3.5" />
              Add Reminder
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleDownloadICS}
            disabled={validCount === 0}
            className="bg-gradient-michigan hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Download Calendar File (.ics)
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="text-xs">
            <CalendarPlus className="h-3 w-3 mr-1" />
            {validCount} reminder{validCount !== 1 ? "s" : ""} ready
          </Badge>
          <span className="text-xs text-muted-foreground">
            Works with Apple Calendar, Google Calendar, Outlook
          </span>
        </div>

        <p className="text-xs text-muted-foreground text-center border-t border-border pt-3">
          We do not store your personal health details. This is a simple reminder export for your own calendar.
        </p>
      </CardContent>
    </Card>
  );
};

export default CareTeamReminders;
