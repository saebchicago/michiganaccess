import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZIP_TO_COUNTY } from "@/data/michiganZips";

export default function YourCommunity() {
  const [zip, setZip] = useState<string>("");
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("am_user_zip");
      if (stored && /^\d{5}$/.test(stored)) {
        setZip(stored);
      }
    } catch { /* ignore */ }
  }, []);

  const entry = zip ? ZIP_TO_COUNTY[zip] : null;
  const zipData = entry ? { zip, city: entry.city, county: entry.county } : null;

  const handleSave = () => {
    const trimmed = input.trim();
    if (!/^\d{5}$/.test(trimmed)) return;
    try {
      localStorage.setItem("am_user_zip", trimmed);
    } catch { /* ignore */ }
    setZip(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="py-6 border-b border-border/30">
      <div className="container max-w-5xl">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Your Community</h2>
          </div>

          {zipData ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>ZIP: <strong className="text-foreground">{zipData.zip}</strong></span>
                <span>City: <strong className="text-foreground">{zipData.city}</strong></span>
                <span>County: <strong className="text-foreground">{zipData.county}</strong></span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/zip/${zipData.zip}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    ZIP Scorecard <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
                <Link to={`/find-care?zip=${zipData.zip}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    Find Care <Search className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    try { localStorage.removeItem("am_user_zip"); } catch { /* ignore */ }
                    setZip("");
                    setInput("");
                  }}
                >
                  Change ZIP
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Enter your ZIP for personalized insights
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 48201"
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-28 h-8 text-sm"
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
                  {saved ? "Saved!" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
