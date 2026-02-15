"use client";

import { motion } from "framer-motion";
import { Search, Layers, Zap } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Research & Audit",
    description:
      "We scrape your competitors, analyse your funnel, and map your customer lifecycle gaps using AI-powered tools.",
  },
  {
    num: "02",
    icon: Layers,
    title: "Strategy & Architecture",
    description:
      "Using proven frameworks (Schwartz awareness levels, Ogilvy Big Idea), we define your positioning and lifecycle stages.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Build & Deploy",
    description:
      "We build the email sequences, CRM flows, landing pages, and ad variants — then deploy and measure.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            The Process
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 md:p-10"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-foreground text-background">
                  <step.icon size={20} />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{step.num}</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
