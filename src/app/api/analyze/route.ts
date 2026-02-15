import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function stubWebhookSummary(dataSources: string[]) {
  const signals: { category: string; signal: string; description: string }[] = [];
  const webhooks: { source: string; event: string; description: string }[] = [];
  const polling: { source: string; frequency: string; description: string }[] = [];

  const sourcesLower = dataSources.map((s) => s.toLowerCase());
  const hasAnalytics = sourcesLower.some((s) => ["mixpanel", "amplitude", "segment", "posthog"].some((a) => s.includes(a)));

  if (hasAnalytics) {
    signals.push(
      { category: "Usage", signal: "Feature adoption depth", description: "Track which features users engage with" },
      { category: "Churn", signal: "Declining login frequency", description: "Detect users whose session frequency drops" },
      { category: "Engagement", signal: "Session duration trends", description: "Monitor changes in time spent per session" },
    );
  }

  for (const src of dataSources) {
    const sl = src.toLowerCase();
    if (sl === "stripe") {
      webhooks.push({ source: src, event: "payment.completed", description: `Triggered when payment completes in ${src}` });
      signals.push(
        { category: "Revenue", signal: "Payment failure detected", description: "Trigger dunning flow on failed charges" },
        { category: "Churn", signal: "Subscription cancellation", description: "Signals voluntary churn" },
      );
    } else if (sl.includes("shopify") || sl.includes("woocommerce")) {
      webhooks.push({ source: src, event: "order.created", description: `Triggered on new order in ${src}` });
      signals.push({ category: "Revenue", signal: "Repeat purchase rate", description: `Track repeat purchases in ${src}` });
    } else if (!hasAnalytics || !["mixpanel", "amplitude", "segment", "posthog"].some((a) => sl.includes(a))) {
      polling.push({ source: src, frequency: "Every 15 minutes", description: `Poll ${src} for new events` });
    }
  }

  return {
    signals: signals.slice(0, 8),
    webhooks,
    polling,
    summary: `Identified ${signals.length} key lifecycle signals across ${dataSources.length} data source(s).`,
  };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { ok } = rateLimit(`analyze:${ip}`, 10, 60_000);
  if (!ok) return NextResponse.json({ detail: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { data_sources = [], business_desc = "" } = body;

    if (!genAI) {
      return NextResponse.json({ webhook_summary: stubWebhookSummary(data_sources) });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Given data sources: ${JSON.stringify(data_sources)}
Business: ${business_desc.slice(0, 500)}

Identify key customer lifecycle signals. Group into categories.
Return JSON with:
- signals: list of {category, signal, description}. Categories: Usage, Churn, Revenue, Engagement. Max 8.
- webhooks: list of {source, event, description}
- polling: list of {source, frequency, description}
- summary: string (1-2 sentences)

Return ONLY valid JSON, no markdown.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```$/, "");
      return NextResponse.json({ webhook_summary: JSON.parse(text) });
    } catch {
      return NextResponse.json({ webhook_summary: stubWebhookSummary(data_sources) });
    }
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json({ detail: "Analysis failed" }, { status: 500 });
  }
}
