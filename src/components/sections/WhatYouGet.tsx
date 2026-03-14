"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  {
    label: "Research",
    title: "Competitor Intelligence & Funnel Audit",
    description:
      "We analyse competitor positioning, pricing, and messaging to find the gaps you can own. You get a clear picture of opportunities before a single word of copy is written.",
  },
  {
    label: "Foundation",
    title: "Positioning & Brand Voice",
    description:
      "We define your unique positioning, tone, and messaging hierarchy using proven frameworks — awareness levels, Big Idea methodology, and Jobs-to-be-Done.",
  },
  {
    label: "Email Flows",
    title: "Lifecycle Email Automation",
    description:
      "From onboarding drips to re-engagement campaigns, we design full email sequences personalised to your business type, lifecycle stage, and data sources.",
  },
  {
    label: "Reporting",
    title: "Measurement & Experimentation",
    description:
      "Every initiative ships with a local A/B test and a global control group — so you measure both short-term lifts and long-term impact.",
  },
];

export function WhatYouGet() {
  const [active, setActive] = useState(0);

  return (
    <section id="what-you-get" className="section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Deliverables
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            What You Get
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                active === i
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[640px] rounded-lg border border-border bg-white p-10 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="mb-4 text-xl font-semibold">{TABS[active].title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {TABS[active].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
