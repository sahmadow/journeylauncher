import { WizardState, BusinessType } from "@/types";

export interface Recommendation {
  category: "Strategy" | "Data" | "Targeting" | "Campaigns" | "Reporting";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionItems: string[];
}

type RuleSet = Record<string, Recommendation[]>;

const SAAS_RULES: RuleSet = {
  Strategy: [
    {
      category: "Strategy",
      title: "Map Activation Milestones",
      description:
        "Define the key actions users must take within their first 7-14 days to reach activation. Track milestone completion rates.",
      priority: "high",
      actionItems: [
        "Identify 3-5 activation milestones from product data",
        "Set up milestone tracking events",
        "Create milestone completion dashboard",
      ],
    },
    {
      category: "Strategy",
      title: "Build Engagement Scoring",
      description:
        "Create a composite score from feature usage, session depth, and frequency to identify at-risk accounts before they churn.",
      priority: "medium",
      actionItems: [
        "Define engagement score formula (usage + frequency + depth)",
        "Set thresholds for healthy, declining, and at-risk segments",
        "Automate weekly score recalculation",
      ],
    },
    {
      category: "Strategy",
      title: "Implement Churn Prediction 45-60 Days Ahead",
      description:
        "Use leading indicators to predict churn well before renewal. Early warning allows proactive intervention.",
      priority: "medium",
      actionItems: [
        "Track support ticket sentiment and frequency",
        "Monitor billing page visits and plan downgrade research",
        "Set up automated alerts for declining engagement scores",
      ],
    },
  ],
  Data: [
    {
      category: "Data",
      title: "Track Leading Indicators",
      description:
        "Collect feature usage depth, session frequency, support ticket tone, and billing page visits as churn predictors.",
      priority: "high",
      actionItems: [
        "Instrument feature usage events (not just pageviews)",
        "Track session depth and time-to-value metrics",
        "Capture support ticket sentiment data",
      ],
    },
  ],
  Targeting: [
    {
      category: "Targeting",
      title: "Segment: Power Users vs Healthy vs Declining",
      description:
        "Create three core segments based on engagement scores. Each segment gets different communication cadence and content.",
      priority: "high",
      actionItems: [
        "Define power user criteria (top 10% usage)",
        "Set healthy engagement baseline",
        "Create declining segment with 14-day lookback window",
      ],
    },
  ],
  Campaigns: [
    {
      category: "Campaigns",
      title: "Use-Case Segmented Onboarding",
      description:
        "Branch onboarding emails based on detected use case or signup intent. Generic onboarding reduces activation rates.",
      priority: "high",
      actionItems: [
        "Identify top 3 use cases from signup data",
        "Create branched email sequences per use case",
        "A/B test use-case onboarding vs generic",
      ],
    },
    {
      category: "Campaigns",
      title: "Behavioral Trigger Campaigns",
      description:
        "Set up event-driven emails for key actions (or inaction): feature discovery, milestone completion, inactivity warnings.",
      priority: "medium",
      actionItems: [
        "Map trigger events to email content",
        "Build 5-7 behavioral trigger automations",
        "Set up inactivity re-engagement at 7/14/30 days",
      ],
    },
    {
      category: "Campaigns",
      title: "Dunning for Failed Payments",
      description:
        "Automate recovery of failed payments with escalating urgency. Involuntary churn is often 20-40% of total churn.",
      priority: "medium",
      actionItems: [
        "Set up payment failure webhook listener",
        "Create 3-step dunning email sequence",
        "Add in-app banner for payment issues",
      ],
    },
  ],
  Reporting: [
    {
      category: "Reporting",
      title: "Net Revenue Retention as North Star",
      description:
        "Track NRR as primary metric. Expansion revenue should offset churn. Target 110%+ for healthy SaaS.",
      priority: "high",
      actionItems: [
        "Calculate current NRR (expansion + contraction + churn)",
        "Set monthly NRR tracking cadence",
        "Break down NRR by cohort and segment",
      ],
    },
  ],
};

const ECOMMERCE_RULES: RuleSet = {
  Strategy: [
    {
      category: "Strategy",
      title: "Optimize First-to-Second Purchase Gap",
      description:
        "The gap between first and second purchase is the most critical conversion point. Reducing it dramatically increases LTV.",
      priority: "high",
      actionItems: [
        "Analyze median time between first and second purchase",
        "Create targeted post-purchase sequence within that window",
        "Test incentives vs education-based second purchase nudges",
      ],
    },
    {
      category: "Strategy",
      title: "RFM + Behavioral Segmentation",
      description:
        "Combine Recency, Frequency, Monetary with behavioral signals (browse, cart, purchase patterns) for precise targeting.",
      priority: "medium",
      actionItems: [
        "Build RFM scoring model from order history",
        "Layer behavioral signals (browse categories, cart abandons)",
        "Create segment-specific communication strategies",
      ],
    },
  ],
  Data: [
    {
      category: "Data",
      title: "Track Reorder Intervals & Intent Levels",
      description:
        "Capture per-product reorder intervals and classify customer intent (browse, cart, checkout) for predictive campaigns.",
      priority: "high",
      actionItems: [
        "Calculate average reorder interval per product category",
        "Tag customers by intent level (browse/cart/checkout)",
        "Set up real-time intent tracking events",
      ],
    },
  ],
  Targeting: [
    {
      category: "Targeting",
      title: "VIP Program with Genuine Differentiation",
      description:
        "Create VIP tiers with meaningful benefits, not just discounts. Early access, exclusive products, and personal touches.",
      priority: "medium",
      actionItems: [
        "Define VIP criteria (top 5-10% by LTV)",
        "Design tiered benefits beyond discounts",
        "Create VIP-specific communication channel",
      ],
    },
    {
      category: "Targeting",
      title: "Intent-Level Segmentation",
      description:
        "Segment by demonstrated purchase intent: browsers, cart adders, checkout abandoners. Each needs different messaging.",
      priority: "high",
      actionItems: [
        "Set up browse, cart, checkout event tracking",
        "Create segment-specific recovery flows",
        "Personalize product recommendations by intent level",
      ],
    },
  ],
  Campaigns: [
    {
      category: "Campaigns",
      title: "Post-Purchase Education Sequence",
      description:
        "Send product usage tips, care instructions, and complementary product suggestions after purchase. Builds loyalty and repeat purchases.",
      priority: "high",
      actionItems: [
        "Create product-category-specific post-purchase emails",
        "Include usage tips and care instructions",
        "Add cross-sell recommendations based on purchase",
      ],
    },
    {
      category: "Campaigns",
      title: "Replenishment Automation",
      description:
        "For consumable products, automate reorder reminders based on estimated usage and historical reorder intervals.",
      priority: "medium",
      actionItems: [
        "Identify replenishable product categories",
        "Calculate per-product reorder timing",
        "Build automated replenishment reminder flows",
      ],
    },
    {
      category: "Campaigns",
      title: "Structured Winback Program",
      description:
        "Multi-stage winback with escalating offers. Start with content, then incentive, then final attempt. 60/90/120 day cadence.",
      priority: "medium",
      actionItems: [
        "Define lapsed customer criteria (90+ days no purchase)",
        "Create 3-stage winback sequence",
        "Test discount vs new product vs content-led approaches",
      ],
    },
  ],
  Reporting: [
    {
      category: "Reporting",
      title: "Repeat Purchase Rate + LTV Curves",
      description:
        "Track repeat purchase rate and LTV curves by acquisition cohort. These are the true health metrics for e-commerce.",
      priority: "high",
      actionItems: [
        "Build cohort-based repeat purchase rate dashboard",
        "Track LTV curves at 30/60/90/180/365 days",
        "Compare LTV by acquisition channel",
      ],
    },
  ],
};

const SERVICE_RULES: RuleSet = {
  Strategy: [
    {
      category: "Strategy",
      title: "Structured First 30 Days",
      description:
        "Create a standardized onboarding experience for the first 30 days. Set expectations, deliver quick wins, establish cadence.",
      priority: "high",
      actionItems: [
        "Design 30-day onboarding checklist",
        "Schedule week 1, 2, and 4 touchpoints",
        "Define quick-win deliverable for first 2 weeks",
      ],
    },
    {
      category: "Strategy",
      title: "Expectation Alignment Framework",
      description:
        "Formalize expectation-setting at project kick-off. Misaligned expectations are the #1 cause of service client churn.",
      priority: "high",
      actionItems: [
        "Create standard scope/timeline document template",
        "Build communication cadence agreement",
        "Set up milestone-based check-ins",
      ],
    },
  ],
  Data: [
    {
      category: "Data",
      title: "Track Client Health Signals",
      description:
        "Monitor meeting attendance, response times, scope change requests, and invoice scrutiny as early warning indicators.",
      priority: "high",
      actionItems: [
        "Track meeting attendance and cancellation rates",
        "Monitor email response time trends",
        "Flag scope reduction requests and invoice queries",
      ],
    },
  ],
  Targeting: [
    {
      category: "Targeting",
      title: "Engagement Health Segmentation",
      description:
        "Segment clients by engagement health: thriving, stable, at-risk. Proactive outreach to at-risk prevents churn.",
      priority: "high",
      actionItems: [
        "Define health score from attendance + responsiveness + sentiment",
        "Create automated health score updates",
        "Set up alerts for declining health scores",
      ],
    },
    {
      category: "Targeting",
      title: "Retainer vs Project Client Strategies",
      description:
        "Different retention strategies for retainer vs project clients. Retainers need value reinforcement; projects need pipeline management.",
      priority: "medium",
      actionItems: [
        "Tag all clients as retainer or project-based",
        "Create retainer value report template",
        "Build project-to-retainer conversion playbook",
      ],
    },
  ],
  Campaigns: [
    {
      category: "Campaigns",
      title: "Insight-Led Reporting",
      description:
        "Transform status reports into insight-led narratives. Lead with outcomes and recommendations, not activity metrics.",
      priority: "high",
      actionItems: [
        "Redesign report template: insights first, data second",
        "Include proactive recommendations in every report",
        "Add benchmark comparisons where possible",
      ],
    },
    {
      category: "Campaigns",
      title: "Proactive QBRs",
      description:
        "Quarterly business reviews that focus on strategic alignment, not just deliverables. Show forward-looking roadmap.",
      priority: "medium",
      actionItems: [
        "Create QBR template with strategic focus",
        "Include industry trends and competitive insights",
        "Present next-quarter roadmap with clear ROI projections",
      ],
    },
    {
      category: "Campaigns",
      title: "Systematized Referral Asks",
      description:
        "Build referral requests into natural touchpoints (post-win, QBR, milestone completion) rather than ad-hoc asks.",
      priority: "medium",
      actionItems: [
        "Identify 3 natural referral ask moments",
        "Create referral request templates for each moment",
        "Track referral rate per client segment",
      ],
    },
  ],
  Reporting: [
    {
      category: "Reporting",
      title: "NRR Per Client + Referral Rate",
      description:
        "Track net revenue retention per client and referral rate as dual north stars. Growth comes from expanding accounts and referrals.",
      priority: "high",
      actionItems: [
        "Calculate NRR per client (upsell - downsell - churn)",
        "Track referral rate by client segment",
        "Set quarterly targets for both metrics",
      ],
    },
  ],
};

const BUSINESS_RULES: Record<BusinessType, RuleSet> = {
  saas: SAAS_RULES,
  ecommerce: ECOMMERCE_RULES,
  service: SERVICE_RULES,
};

function getSegmentationRecs(): Recommendation[] {
  return [
    {
      category: "Strategy",
      title: "Implement Customer Lifecycle Segmentation",
      description:
        "You're not yet segmenting customers by lifecycle stage. This is foundational — without it, all customers get the same messaging regardless of their relationship stage.",
      priority: "high",
      actionItems: [
        "Define 4-5 lifecycle stages relevant to your business",
        "Map existing customers into stages based on available data",
        "Create stage-specific communication strategies",
        "Set up automated stage transitions based on behavior",
      ],
    },
    {
      category: "Targeting",
      title: "Build Behavioral Segmentation Foundation",
      description:
        "Start collecting behavioral data to segment beyond demographics. Intent and engagement signals drive 3-5x better targeting.",
      priority: "high",
      actionItems: [
        "Identify top 5 behavioral signals for your business",
        "Implement event tracking for each signal",
        "Create initial segments based on behavioral patterns",
      ],
    },
  ];
}

function getNoDataRecs(): Recommendation[] {
  return [
    {
      category: "Data",
      title: "Build Data Infrastructure",
      description:
        "You currently have no data sources connected. Data is the foundation of effective lifecycle marketing. Start with the basics.",
      priority: "high",
      actionItems: [
        "Set up a customer data platform (Segment, RudderStack)",
        "Connect your payment provider (Stripe, Shopify)",
        "Add product analytics (PostHog, Mixpanel, Amplitude)",
        "Implement basic event tracking for key user actions",
      ],
    },
    {
      category: "Data",
      title: "Establish Core Tracking Events",
      description:
        "Define and implement the minimum viable set of tracking events to power your lifecycle campaigns.",
      priority: "high",
      actionItems: [
        "Track signup and onboarding completion",
        "Track core product/service usage events",
        "Track purchase/conversion events",
        "Track support interactions and satisfaction signals",
      ],
    },
  ];
}

function getGapRecs(
  gaps: string[],
  businessType: BusinessType
): Recommendation[] {
  const recs: Recommendation[] = [];

  const gapMap: Record<string, Record<BusinessType, Recommendation>> = {
    "Early Engagement": {
      saas: {
        category: "Campaigns",
        title: "Fix Early Engagement: Onboarding Activation",
        description:
          "Your early engagement stage has gaps. Users who don't activate in the first 7 days rarely convert.",
        priority: "high",
        actionItems: [
          "Design time-based + action-based onboarding triggers",
          "Create 'aha moment' guidance emails",
          "Build in-app onboarding checklists",
        ],
      },
      ecommerce: {
        category: "Campaigns",
        title: "Fix Early Engagement: Welcome & First Purchase",
        description:
          "Your early engagement stage has gaps. The welcome sequence is your highest-leverage campaign for first purchase conversion.",
        priority: "high",
        actionItems: [
          "Build 5-email welcome series with progressive profiling",
          "Include social proof and bestseller recommendations",
          "Add limited-time first purchase incentive",
        ],
      },
      service: {
        category: "Campaigns",
        title: "Fix Early Engagement: Client Onboarding",
        description:
          "Your early engagement stage has gaps. A structured onboarding sets the tone for the entire client relationship.",
        priority: "high",
        actionItems: [
          "Create onboarding email sequence with clear next steps",
          "Send welcome kit with team introductions",
          "Schedule kickoff call within first 48 hours",
        ],
      },
    },
    Engagement: {
      saas: {
        category: "Campaigns",
        title: "Fix Engagement: Feature Discovery & Deepening",
        description:
          "Your engagement stage has gaps. Users who only use basic features have 3x higher churn rates.",
        priority: "high",
        actionItems: [
          "Create feature spotlight email series",
          "Build usage-based feature recommendation triggers",
          "Set up milestone celebration emails",
        ],
      },
      ecommerce: {
        category: "Campaigns",
        title: "Fix Engagement: Browse Abandonment & Nurture",
        description:
          "Your engagement stage has gaps. Re-engaging browsers who haven't purchased is a major revenue opportunity.",
        priority: "high",
        actionItems: [
          "Set up browse abandonment emails with viewed products",
          "Create category-interest-based newsletters",
          "Build personalized product recommendation engine",
        ],
      },
      service: {
        category: "Campaigns",
        title: "Fix Engagement: Ongoing Value Demonstration",
        description:
          "Your engagement stage has gaps. Clients need regular proof of value to justify continued investment.",
        priority: "high",
        actionItems: [
          "Create monthly impact summary reports",
          "Share relevant industry insights proactively",
          "Schedule mid-project check-ins and realignment",
        ],
      },
    },
    Monetisation: {
      saas: {
        category: "Campaigns",
        title: "Fix Monetisation: Upgrade & Expansion",
        description:
          "Your monetisation stage has gaps. Expansion revenue from existing users is more efficient than new acquisition.",
        priority: "high",
        actionItems: [
          "Create usage-based upgrade triggers",
          "Build plan comparison nudges at limit thresholds",
          "Design annual plan conversion campaigns",
        ],
      },
      ecommerce: {
        category: "Campaigns",
        title: "Fix Monetisation: Cart Recovery & AOV",
        description:
          "Your monetisation stage has gaps. Cart abandonment recovery and AOV optimization are direct revenue drivers.",
        priority: "high",
        actionItems: [
          "Build multi-step cart abandonment sequence",
          "Implement cross-sell recommendations at checkout",
          "Create bundle offers for high-affinity products",
        ],
      },
      service: {
        category: "Campaigns",
        title: "Fix Monetisation: Upsell & Scope Expansion",
        description:
          "Your monetisation stage has gaps. Existing clients are your best source of revenue growth through scope expansion.",
        priority: "high",
        actionItems: [
          "Identify natural upsell moments in client lifecycle",
          "Create case studies showing expanded scope ROI",
          "Build proposal templates for scope expansion",
        ],
      },
    },
    Retention: {
      saas: {
        category: "Campaigns",
        title: "Fix Retention: Churn Prevention & Re-engagement",
        description:
          "Your retention stage has gaps. Proactive retention is 5-7x cheaper than acquiring new customers.",
        priority: "high",
        actionItems: [
          "Build at-risk user identification system",
          "Create re-engagement campaign for declining users",
          "Design renewal reminder sequence starting 60 days out",
        ],
      },
      ecommerce: {
        category: "Campaigns",
        title: "Fix Retention: Repeat Purchase & Loyalty",
        description:
          "Your retention stage has gaps. Moving customers from one-time to repeat buyers is the biggest LTV lever.",
        priority: "high",
        actionItems: [
          "Create post-purchase nurture sequence",
          "Build loyalty program with meaningful rewards",
          "Design winback campaigns at 60/90/120 day marks",
        ],
      },
      service: {
        category: "Campaigns",
        title: "Fix Retention: Renewal & Relationship Deepening",
        description:
          "Your retention stage has gaps. Renewal conversations should start 90 days before contract end.",
        priority: "high",
        actionItems: [
          "Set up 90-day pre-renewal preparation process",
          "Create renewal proposal template with impact summary",
          "Build referral program for long-term clients",
        ],
      },
    },
  };

  for (const gap of gaps) {
    const gapRules = gapMap[gap];
    if (gapRules && gapRules[businessType]) {
      recs.push(gapRules[businessType]);
    }
  }

  return recs;
}

export function generateRecommendations(state: WizardState): Recommendation[] {
  const businessType =
    state.businessTypeOverride || state.analysis?.business_type || "saas";
  const rules = BUSINESS_RULES[businessType];
  const recs: Recommendation[] = [];

  // Base recommendations from business type
  for (const category of Object.keys(rules)) {
    recs.push(...rules[category]);
  }

  // Graduated scoring for lifecycle maturity
  const totalMaturity = (state.clmScore ?? 0) + (state.personalisationScore ?? 0);
  if (totalMaturity === 0) {
    // Full foundational recs
    recs.push(...getSegmentationRecs());
  } else if (totalMaturity <= 2) {
    // Partial recs at medium priority
    const partialRecs = getSegmentationRecs().map((r) => ({ ...r, priority: "medium" as const }));
    recs.push(...partialRecs);
  }
  // totalMaturity >= 3 → skip segmentation recs (mature)

  // Data availability-based recs
  const hasNoData =
    state.dataSources.length === 0 ||
    (state.dataSources.length === 1 && state.dataSources[0] === "None");

  if (hasNoData || state.dataAvailability === "none") {
    recs.push(...getNoDataRecs());
  } else if (state.dataAvailability === "some") {
    const partialDataRecs = getNoDataRecs().map((r) => ({ ...r, priority: "medium" as const }));
    recs.push(...partialDataRecs);
  }
  // dataAvailability === "all" → skip data infrastructure recs

  // Gap-specific recs
  if (state.lifecycleGaps.length > 0) {
    recs.push(...getGapRecs(state.lifecycleGaps, businessType));
  }

  // Sort: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}
