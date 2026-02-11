import { motion } from "framer-motion";
import { Search, Compass, BookOpen } from "lucide-react";

const columns = [
  {
    icon: Search,
    title: "Find Quality Care",
    description:
      "Compare healthcare options using independent quality ratings, patient safety scores, and service availability. Make informed decisions about where to receive care.",
  },
  {
    icon: Compass,
    title: "Navigate Complex Systems",
    description:
      "Understand insurance options, find financial assistance, access social services. We break down complexity so you can focus on your health.",
  },
  {
    icon: BookOpen,
    title: "Stay Informed",
    description:
      "Track Michigan health trends, learn about conditions, discover prevention strategies. Knowledge empowers better health decisions.",
  },
];

const HowItHelps = () => (
  <section className="py-16 md:py-20">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">How This Platform Helps You</h2>
        <p className="mt-2 text-muted-foreground">Built for Michigan families, by someone who cares</p>
      </motion.div>

      <div className="grid gap-10 md:grid-cols-3">
        {columns.map((col, i) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <col.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">{col.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{col.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItHelps;
