import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function extractColors(html: string): string[] {
  const hexPattern = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  const found = html.match(hexPattern) || [];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const c of found) {
    const lower = c.toLowerCase();
    if (!seen.has(lower) && !["#fff", "#ffffff", "#000", "#000000"].includes(lower)) {
      seen.add(lower);
      unique.push(c);
    }
  }
  return unique.slice(0, 6);
}

async function scrapePage(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "JourneyLauncher-Bot/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const html = await res.text();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const metaDescription = metaMatch ? metaMatch[1] : "";

  let logoUrl = "";
  const logoPatterns = [
    // Images with "logo" in class, id, src, or alt (both attribute orderings)
    /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*logo[^"']*["']/i,
    /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*alt=["'][^"']*logo[^"']*["']/i,
    /<img[^>]*id=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*id=["'][^"']*logo[^"']*["']/i,
    // Images with "logo" in the src file path
    /<img[^>]*src=["']([^"']*logo[^"']*\.(?:svg|png|jpg|jpeg|webp)[^"']*)["']/i,
    // Images with "brand" in class or src
    /<img[^>]*class=["'][^"']*brand[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']*brand[^"']*\.(?:svg|png|jpg|jpeg|webp)[^"']*)["']/i,
    // Header/nav area: first img that looks like a logo (svg or small image, not hero images)
    /<(?:header|nav)[^>]*>[\s\S]{0,500}?<img[^>]*src=["']([^"']+\.svg[^"']*)["']/i,
    /<(?:header|nav)[^>]*>[\s\S]{0,500}?<a[^>]*href=["']\/["'][^>]*>[\s\S]{0,200}?<img[^>]*src=["']([^"']+)["']/i,
    // Apple touch icon (higher res than favicon)
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i,
    // OG image as fallback (social card, not a logo but shows the brand)
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    // Favicon as last resort
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
  ];
  for (const pattern of logoPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        logoUrl = new URL(match[1], url).href;
        break;
      } catch { /* invalid URL, try next pattern */ }
    }
  }

  const colors = extractColors(html);

  const headingMatches = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi) || [];
  const headings = headingMatches.slice(0, 10).map((h) =>
    h.replace(/<[^>]+>/g, "").trim()
  );

  const pMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
  const paragraphs = pMatches.slice(0, 20).map((p) => p.replace(/<[^>]+>/g, "").trim());
  const bodyText = [...headings, ...paragraphs].join("\n").slice(0, 3000);

  const pricingRegex = /\$\d+|free|pricing|price|plan/i;
  const pricingElements = html.match(new RegExp(`<[^>]*>[^<]*(?:${pricingRegex.source})[^<]*<\/[^>]*>`, "gi")) || [];
  const pricingText = pricingElements.map((el) => el.replace(/<[^>]+>/g, "").trim()).join("\n").slice(0, 500);

  return {
    url,
    title,
    meta_description: metaDescription,
    logo_url: logoUrl,
    colors,
    headings,
    body_text: bodyText,
    pricing_text: pricingText,
  };
}

function detectBusinessType(scraped: Record<string, unknown>): string {
  const text = `${scraped.title || ""} ${scraped.meta_description || ""} ${String(scraped.body_text || "").slice(0, 1000)}`.toLowerCase();
  const ec = ["cart", "shop", "shipping", "buy now", "add to cart", "store"].filter((kw) => text.includes(kw)).length;
  const sv = ["agency", "consultation", "portfolio", "booking", "hire us", "services"].filter((kw) => text.includes(kw)).length;
  const sa = ["trial", "dashboard", "platform", "software", "api", "saas", "sign up free"].filter((kw) => text.includes(kw)).length;
  if (ec > sv && ec > sa) return "ecommerce";
  if (sv > sa) return "service";
  return "saas";
}

function stubAnalysis(scraped: Record<string, string | string[]>) {
  const btype = detectBusinessType(scraped);
  return {
    tone: "professional",
    usp: scraped.meta_description || "A great product for your needs",
    features: (scraped.headings as string[] || []).slice(0, 4),
    target_audience: "Small to medium businesses",
    pricing_summary: scraped.pricing_text || null,
    brand_personality: "Modern",
    business_type: btype,
    business_model: defaultBusinessModel(btype),
  };
}

function defaultBusinessModel(type: string) {
  if (type === "ecommerce") return { has_free_trial: false, has_pricing_page: true, offers_consultation: false, has_product_catalog: true, has_booking_system: false, subscription_based: false };
  if (type === "service") return { has_free_trial: false, has_pricing_page: false, offers_consultation: true, has_product_catalog: false, has_booking_system: true, subscription_based: false };
  return { has_free_trial: true, has_pricing_page: true, offers_consultation: false, has_product_catalog: false, has_booking_system: false, subscription_based: true };
}

async function analyzeWithAI(scraped: Record<string, unknown>) {
  if (!genAI) return stubAnalysis(scraped as Record<string, string | string[]>);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze this landing page data and return JSON with these fields:
- tone: string (e.g. "professional", "casual", "technical")
- usp: string (unique selling proposition, 1-2 sentences)
- features: list of strings (key product features, max 6)
- target_audience: string
- pricing_summary: string or null
- brand_personality: string (1-2 words)
- business_type: "saas" | "ecommerce" | "service"
- business_model: object with boolean fields: has_free_trial, has_pricing_page, offers_consultation, has_product_catalog, has_booking_system, subscription_based

Title: ${scraped.title}
Meta: ${scraped.meta_description}
Headings: ${JSON.stringify(scraped.headings)}
Content: ${String(scraped.body_text).slice(0, 2000)}
Pricing: ${scraped.pricing_text}

Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```$/, "");
    const parsed = JSON.parse(text);
    if (!["saas", "ecommerce", "service"].includes(parsed.business_type)) parsed.business_type = "saas";
    if (!parsed.business_model) parsed.business_model = defaultBusinessModel(parsed.business_type);
    return parsed;
  } catch (e) {
    console.error("AI analysis failed:", e);
    return stubAnalysis(scraped as Record<string, string | string[]>);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { ok } = rateLimit(`scrape:${ip}`, 5, 60_000);
  if (!ok) return NextResponse.json({ detail: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    let url = (body.url || "").trim();
    if (!url) return NextResponse.json({ detail: "URL is required" }, { status: 422 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

    const scraped = await scrapePage(url);
    const analysis = await analyzeWithAI(scraped);
    return NextResponse.json({ scraped_data: scraped, analysis });
  } catch (e) {
    console.error("Scrape error:", e);
    return NextResponse.json({ detail: e instanceof Error ? e.message : "Scrape failed" }, { status: 500 });
  }
}
