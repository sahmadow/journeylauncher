const OBJECTIVES = [
  {
    title: "Acquisition",
    desc: "Bringing new users and customers into your ecosystem through paid, organic, and outbound channels.",
  },
  {
    title: "Conversion",
    desc: "Turning prospects and warm leads into paying customers through optimised touchpoints and friction removal.",
  },
  {
    title: "Retention & Upsell",
    desc: "Maximising lifetime value of existing customers. Retained customers become advocates who drive acquisition for free.",
  },
];

export function ObjectivesGrid() {
  return (
    <div className="not-prose my-12">
      <p className="mb-8 flex items-center gap-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Core Objectives
        <span className="h-px flex-1 bg-border" />
      </p>
      <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
        {OBJECTIVES.map((obj, i) => (
          <div
            key={obj.title}
            className="bg-white p-8 transition-colors hover:bg-secondary"
          >
            <span className="font-serif text-5xl font-bold text-border">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-sm font-medium uppercase tracking-widest">
              {obj.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{obj.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
