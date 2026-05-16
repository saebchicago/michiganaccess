import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { DATA_STORIES } from "@/data/data-stories";

export default function DataStoriesSection() {
  return (
    <section className="py-10">
      <div className="container max-w-5xl">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider border-primary/30 text-primary">
            Data Stories
          </Badge>
          <h2 className="text-xl font-bold text-foreground">Michigan by the Numbers</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_STORIES.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={story.href} className="block group">
                <div className="rounded-xl border border-border p-5 h-full transition-all hover:shadow-lg hover:-translate-y-0.5 space-y-3" style={{ borderLeftWidth: 3, borderLeftColor: story.color }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: story.color }}>{story.title}</p>
                  <p className="text-sm font-medium text-foreground">{story.hook}</p>
                  <AnimatedCounter value={story.stat.value} suffix={story.stat.suffix} className="text-3xl font-bold text-foreground" />
                  <p className="text-[10px] text-muted-foreground">{story.stat.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{story.narrative}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">{story.source}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
