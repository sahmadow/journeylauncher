"use client";

import { motion } from "framer-motion";

const CLIENTS = [
  { name: "Yandex", color: "#FC3F1D" },
  { name: "Soundwide", color: "#0a0a0a" },
  { name: "Native Instruments", color: "#0a0a0a" },
  { name: "amazon", color: "#0a0a0a", italic: false },
  { name: "Telia", color: "#990AE3" },
  { name: "Audible", color: "#0a0a0a" },
  { name: "Vodafone", color: "#E60000" },
];

export function WeAdvised() {
  const doubled = [...CLIENTS, ...CLIENTS];

  return (
    <section className="border-y border-border bg-background overflow-hidden">
      <div className="py-12 md:py-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Best practices from teams at
        </motion.p>

        {/* Marquee container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

          {/* Scrolling track */}
          <div className="flex animate-marquee items-center gap-16 md:gap-20">
            {doubled.map((client, i) => (
              <span
                key={`${client.name}-${i}`}
                className="shrink-0 text-[22px] font-semibold tracking-tight opacity-40 transition-opacity duration-300 hover:opacity-80 select-none whitespace-nowrap"
                style={{ color: client.color }}
                title={client.name}
              >
                {client.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
