"use client";

import { useState } from "react";

const STAGES = [
  {
    label: "TOFU",
    title: "Top of Funnel — Awareness & Discovery",
    chips: ["Meta Ads", "Google Search", "SEO", "SMM", "Blogs", "Cold Email"],
    desc: "Get in front of the right people before they are actively looking for you — and be the first thing they find when they are.",
  },
  {
    label: "MOFU",
    title: "Middle of Funnel — Consideration & Conversion",
    chips: ["Website CRO", "Landing Pages", "Lead Magnets", "Retargeting"],
    desc: "Where interest becomes intent — and where most marketing investments quietly bleed out. A 1% CRO lift often beats doubling ad spend.",
  },
  {
    label: "BOFU",
    title: "Lower Funnel — Retention & Upsell",
    chips: ["CRM", "Email Automation", "Push", "In-App", "Lifecycle"],
    desc: "Where the economics of marketing either compound in your favour — or quietly erode. Retained customers lower acquisition costs for everyone.",
  },
];

const FUNNEL_COLORS = ["#c84b2f", "#3a5a8c", "#0e0e0e"];

export function FunnelDiagram() {
  const [active, setActive] = useState(0);

  return (
    <div className="not-prose my-12">
      <p className="mb-8 flex items-center gap-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        The Funnel at a Glance
        <span className="h-px flex-1 bg-border" />
      </p>
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        {/* Visual funnel */}
        <div className="flex flex-shrink-0 flex-col items-center gap-0">
          {STAGES.map((stage, i) => (
            <button
              key={stage.label}
              onClick={() => setActive(i)}
              className="flex items-center justify-center text-[11px] font-medium uppercase tracking-widest text-white transition-opacity hover:opacity-85"
              style={{
                backgroundColor: FUNNEL_COLORS[i],
                width: `${180 - i * 26}px`,
                height: "56px",
                clipPath: `polygon(0 0, 100% 0, ${85 - i * 7}% 100%, ${15 + i * 7}% 100%)`,
                marginTop: i > 0 ? "-1px" : 0,
              }}
            >
              {stage.label}
            </button>
          ))}
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Click to explore
          </p>
        </div>

        {/* Content */}
        <div className="flex-1">
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              className="border-b border-border py-6 last:border-b-0 transition-opacity duration-300"
              style={{ opacity: active === i ? 1 : 0.35, cursor: "pointer" }}
              onClick={() => setActive(i)}
            >
              <div className="mb-3 flex items-baseline gap-4">
                <span className="font-serif text-3xl font-bold text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15px] font-medium">{stage.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stage.chips.map((chip) => (
                      <span
                        key={chip}
                        className="border border-border px-3 py-1 font-mono text-[11px] tracking-wide text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {active === i && (
                <p className="mt-1 text-sm text-muted-foreground">{stage.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
