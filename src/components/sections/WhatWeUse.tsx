"use client";

import { motion } from "framer-motion";
import { Bot, Search, Globe, Video, Workflow, Send } from "lucide-react";

const TOOLS = [
  {
    name: "Claude Code",
    description: "AI-powered development and automation from the terminal.",
    icon: Bot,
  },
  {
    name: "Perplexity",
    description: "Deep research and competitive intelligence at scale.",
    icon: Search,
  },
  {
    name: "Playwright",
    description: "Live web scraping and conversion auditing.",
    icon: Globe,
  },
  {
    name: "Remotion",
    description: "Programmatic video ad generation and variants.",
    icon: Video,
  },
  {
    name: "n8n",
    description: "Workflow automation connecting CRM, email, and data.",
    icon: Workflow,
  },
  {
    name: "Autosend",
    description: "Automated email delivery and lifecycle triggers.",
    icon: Send,
  },
];

export function WhatWeUse() {
  return (
    <section id="what-we-use" className="border-y border-border section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Our Stack
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            What We Use
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white p-8 md:p-10"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-border">
                <tool.icon size={24} className="text-foreground" />
              </div>
              <h3 className="mb-2 text-base font-semibold">{tool.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
