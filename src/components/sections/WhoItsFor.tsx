"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const GOOD_FIT = [
  "Founders who want a professional lifecycle system without hiring an agency",
  "Marketing leads tired of stitching tools together with no cohesion",
  "Agencies wanting a repeatable, data-driven lifecycle process for clients",
  "Technical founders who understand systems thinking and want it applied to marketing",
];

const NOT_FIT = [
  "Looking for a quick logo or brand refresh",
  "Need someone to manage your social media day-to-day",
  "Want a one-off campaign with no measurement",
];

export function WhoItsFor() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Fit Check
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Who This Is For
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {/* Good fit */}
          <div className="bg-white p-8 md:p-10">
            <h3 className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#a020f0]">
              Great Fit
            </h3>
            <ul className="space-y-4">
              {GOOD_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#a020f0]" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not fit */}
          <div className="bg-white p-8 md:p-10">
            <h3 className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Not a Fit
            </h3>
            <ul className="space-y-4">
              {NOT_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <X size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
