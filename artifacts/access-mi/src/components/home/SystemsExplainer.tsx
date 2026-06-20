import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

const features = [
  "Ranks healthcare by quality, not who pays for placement",
  "Maps real-time resources - air quality, transit, facilities",
  "Filters by your situation - uninsured, caregiver, new resident",
  "Works across all 83 counties, Detroit to the Upper Peninsula",
];

const stakeholders = [
  {
    label: "For Health Systems",
    desc: "Track referral patterns and community benefit impact",
    href: "/partners",
  },
  {
    label: "For Nonprofits",
    desc: "Amplify your services to residents who need them",
    href: "/partnerships",
  },
  {
    label: "For Policymakers",
    desc: "Identify gaps with real usage data",
    href: "/impact",
  },
];

const SystemsExplainer = forwardRef<HTMLElement>(
  function SystemsExplainer(_props, ref) {
    return (
      <section
        ref={ref}
        className="border-y border-border bg-muted/30 py-14 md:py-20"
        aria-labelledby="systems-heading"
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2
              id="systems-heading"
              className="text-xl font-semibold text-foreground sm:text-2xl"
            >
              What Is Access Michigan?
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              An{" "}
              <strong className="text-foreground">
                independent resource hub
              </strong>{" "}
              that connects you with the right services - without the runaround.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto mt-8 grid max-w-xl gap-3"
          >
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-michigan-teal" />
                <span>{f}</span>
              </li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center text-sm font-semibold text-muted-foreground"
          >
            Nonpartisan · Independent · Aggregated analytics only
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3"
          >
            {stakeholders.map((s) => (
              <Link
                key={s.label}
                to={s.href}
                className="group rounded-lg border border-border bg-card p-4 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-michigan-teal">
                  {s.label}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                <ArrowRight className="mx-auto mt-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    );
  },
);

export default SystemsExplainer;
