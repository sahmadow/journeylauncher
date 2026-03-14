"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function LeadMagnet() {
  return (
    <section className="border-y border-border section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[720px] text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0F2A33]/40 bg-[#0F2A33]/10 px-4 py-1.5">
            <Sparkles size={14} className="text-[#0F2A33]" />
            <span className="font-mono text-[11px] font-semibold text-[#0F2A33]">Free Tool</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Generate Free Personalised CRM Flows
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-sm leading-relaxed text-muted-foreground md:text-base">
            Paste your website URL and get a draft lifecycle automation
            flow in minutes — stages, email triggers, and recommendations
            tailored to your business.
          </p>

          <Link
            href="/flow"
            onClick={() => trackEvent("click_generate_flow", { location: "lead_magnet" })}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-neutral-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-600"
          >
            Generate My CRM Flow
            <ArrowRight size={16} />
          </Link>

          {/* Preview mockup */}
          <div className="mx-auto mt-12 max-w-[580px] overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#0F2A33]" />
              <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                CRM Flow Generator
              </span>
            </div>
            <div className="space-y-3 p-6 text-left">
              {["Early Engagement", "Engagement", "Monetisation", "Retention"].map(
                (stage, i) => (
                  <div
                    key={stage}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: ["#3b82f6", "#8b5cf6", "#f59e0b", "#0F2A33"][i],
                      }}
                    />
                    <span className="text-xs font-medium">{stage}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {[6, 8, 7, 5][i]} emails
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
