import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function stubWebhookSummary(dataSources: string[]) {
  const signals: { category: string; signal: string; description: string }[] = [];
  const webhooks: { source: string; event: string; description: string }[] = [];
  const polling: { source: string; frequency: string; description: string }[] = [];

  for (const src of dataSources) {
    const sl = src.toLowerCase();
    let matched = false;

    if (sl.includes("website")) {
      matched = true;
      signals.push(
        { category: "Engagement", signal: "Page visit patterns", description: "Track high-intent page visits and drop-offs" },
        { category: "Engagement", signal: "Traffic attribution", description: "Identify which channels drive engaged users" },
      );
    }

    if (sl.includes("email")) {
      matched = true;
      signals.push(
        { category: "Engagement", signal: "Email engagement decline", description: "Detect subscribers losing interest over time" },
        { category: "Usage", signal: "List subscription changes", description: "Track opt-in/opt-out trends across lists" },
      );
    }

    if (sl.includes("in-app") || sl.includes("behaviour")) {
      matched = true;
      signals.push(
        { category: "Usage", signal: "Feature adoption depth", description: "Track which features users engage with" },
        { category: "Churn", signal: "Declining login frequency", description: "Detect users whose session frequency drops" },
        { category: "Engagement", signal: "Session duration trends", description: "Monitor changes in time spent per session" },
      );
    }

    if (sl.includes("purchase") || sl.includes("billing")) {
      matched = true;
      webhooks.push({ source: src, event: "payment.completed", description: "Triggered when payment completes" });
      signals.push(
        { category: "Revenue", signal: "Payment failure detected", description: "Trigger dunning flow on failed charges" },
        { category: "Revenue", signal: "Repeat purchase rate", description: "Track repeat purchase behaviour" },
        { category: "Churn", signal: "Subscription cancellation", description: "Signals voluntary churn" },
      );
    }

    if (sl.includes("customer profile")) {
      matched = true;
      signals.push(
        { category: "Usage", signal: "Profile completeness", description: "Nudge users to complete their profile" },
        { category: "Engagement", signal: "Demographic segmentation", description: "Tailor flows by role, company size, or location" },
      );
    }

    if (sl.includes("form") || sl.includes("survey")) {
      matched = true;
      signals.push(
        { category: "Engagement", signal: "NPS score changes", description: "Trigger flows when satisfaction drops" },
        { category: "Churn", signal: "Negative feedback detected", description: "Flag at-risk users from survey responses" },
      );
    }

    if (sl.includes("social") || sl.includes("ad ")) {
      matched = true;
      signals.push(
        { category: "Engagement", signal: "Ad attribution tracking", description: "Link ad clicks to downstream conversions" },
        { category: "Usage", signal: "UTM cohort analysis", description: "Segment users by acquisition campaign" },
      );
    }

    if (!matched && sl !== "none") {
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
