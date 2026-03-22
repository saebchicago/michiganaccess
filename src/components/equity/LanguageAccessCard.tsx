import { motion } from "framer-motion";
import { Globe, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MI_LANGUAGES, LANGUAGE_HOTSPOTS } from "@/data/language-access";

const chartData = MI_LANGUAGES.map((l) => ({
  name: l.name,
  speakers: l.speakers,
}));

export default function LanguageAccessCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-primary" /> Language Access in Michigan
          </CardTitle>
          <CardDescription>
            298K Spanish + 172K Arabic speakers. Michigan's 2nd most-spoken language is Arabic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()} speakers`]} />
              <Bar dataKey="speakers" radius={[0, 4, 4, 0]} fill="hsl(209, 86%, 50%)" />
            </BarChart>
          </ResponsiveContainer>

          {/* Hotspots */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language Hotspots by County</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(LANGUAGE_HOTSPOTS).slice(0, 6).map(([county, langs]) => (
                <div key={county} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <span className="text-xs font-medium text-foreground">{county}</span>
                  <div className="flex flex-wrap gap-1">
                    {langs.map((l) => (
                      <Badge key={l} variant="secondary" className="text-[8px]">{l}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Michigan law requires interpreter services at hospitals and government agencies. If you need language help, ask for an interpreter — it's free.
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground">Source: Census ACS 2022-2024, Data USA, AAPI Vote Michigan</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
