"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Mail, Linkedin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function Contact() {
  return (
    <section id="contact" className="border-t border-border section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-12 md:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              See what this looks like for your business.
            </h2>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin size={16} />
                Berlin, Germany
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} />
                <a href="mailto:saleh@journeylauncher.com" className="hover:text-foreground transition-colors">
                  saleh@journeylauncher.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Linkedin size={16} />
                <a
                  href="https://www.linkedin.com/company/108653018/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <a
              href="https://calendly.com/saleh-journeylauncher/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("click_book_session", { location: "contact" })}
              className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Book a Free Session
              <ArrowRight size={16} />
            </a>
            <Link
              href="/flow"
              onClick={() => trackEvent("click_generate_flow", { location: "contact" })}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0F2A33] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a3d4a]"
            >
              Generate Free CRM Flow
              <ArrowRight size={16} />
            </Link>
            <a
              href="/deck.html"
              className="flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              View the Playbook
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
