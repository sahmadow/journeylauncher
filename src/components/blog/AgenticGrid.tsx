const CARDS = [
  {
    layer: "Agentic TOFU",
    layerColor: "#c84b2f",
    title: "Automated Asset Generation",
    desc: "AI produces ad variants, manages Meta & Google APIs, runs SEO at scale, and generates brand-voice content continuously — campaigns built in hours, not weeks.",
    tools: ["Claude Code", "Remotion", "Meta API", "Google API"],
  },
  {
    layer: "Agentic MOFU",
    layerColor: "#3a5a8c",
    title: "Autonomous CRO",
    desc: "AI tracks behaviour, generates hypotheses, runs A/B tests, and deploys winners automatically. A website that is perpetually self-optimising — no quarterly sprint required.",
    tools: ["Playwright", "Perplexity", "n8n"],
  },
  {
    layer: "Agentic BOFU",
    layerColor: "#0e0e0e",
    title: "Intelligent Lifecycle Automation",
    desc: "Multi-channel flows respond dynamically to user behaviour. Predictive models flag churn and upsell moments before a human ever reviews the account.",
    tools: ["Braze", "Customer.io", "Autosend", "n8n"],
  },
];

export function AgenticGrid() {
  return (
    <div className="not-prose my-12">
      <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white p-8 transition-colors hover:bg-secondary"
          >
            <p
              className="mb-4 font-mono text-[10px] font-medium uppercase tracking-widest"
              style={{ color: card.layerColor }}
            >
              {card.layer}
            </p>
            <h3 className="mb-2 text-sm font-medium">{card.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {card.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {card.tools.map((tool) => (
                <span
                  key={tool}
                  className="bg-secondary px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
