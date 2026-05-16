import { motion } from "framer-motion";

const sources = ["CDC", "CMS", "Michigan DHHS", "County Health Rankings", "EPA", "NHTSA", "EIA"];

export default function AuthorityStrip() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-muted/40 py-4 border-y border-border/30"
      aria-label="Data sources"
    >
      <div className="container max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 opacity-70">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
          Powered by verified data from:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {sources.map((s) => (
            <span
              key={s}
              className="text-xs font-semibold text-muted-foreground tracking-wide"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
