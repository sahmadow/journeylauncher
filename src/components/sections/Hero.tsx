"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden py-28 md:py-40">
      <div className="mx-auto max-w-[1248px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[720px]"
        >
          {/* Label */}
          <span className="mb-6 inline-block rounded-full border border-border px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            CRM & Lifecycle Marketing Consultancy
          </span>

          {/* Headline */}
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight md:text-[56px]">
            Build Lifecycle Systems
            <br />
            <span className="text-[#a020f0]">That Convert & Retain</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-[520px] text-base leading-relaxed text-muted-foreground md:text-lg">
            We design personalised CRM flows, email automation, and lifecycle
            strategies that turn users into customers — and customers into
            advocates.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/flow"
              className="flex items-center gap-2 rounded-lg bg-[#a020f0] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8818cc]"
            >
              Generate Free CRM Flow
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://calendly.com/saleh-journeylauncher/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Book a Session
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
