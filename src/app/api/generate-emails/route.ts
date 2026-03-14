import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";
import { escHtml, sanitizeUrl } from "@/lib/html-escape";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

interface StageEmailInput {
  stage_name: string;
  stage_description: string;
  email_node: {
    id: string;
    subject?: string;
    preview_text?: string;
    body_html?: string;
    cta_text?: string;
    cta_url?: string;
  };
}

interface BrandConfigInput {
  logo_url: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  font_family: string;
  header_style: "logo-only" | "logo-tagline" | "logo-nav";
  footer_content: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  cta_style: "rounded" | "pill" | "square";
  template_style?: "minimal" | "editorial" | "promotional";
  tone_override?: string;
  sender_name: string;
  sender_address?: string;
}

function stubEmailHtml(
  brand: BrandConfigInput,
  stage: StageEmailInput
): string {
  const node = stage.email_node;
  const bgColor = brand.primary_color || "#1e293b";
  const ctaBorderRadius =
    brand.cta_style === "pill"
      ? "25px"
      : brand.cta_style === "rounded"
        ? "8px"
        : "0";
  const fontFamily =
    brand.font_family || "Arial, Helvetica, sans-serif";

  const safeLogoUrl = sanitizeUrl(brand.logo_url || "");
  const safeSenderName = escHtml(brand.sender_name || "Your Brand");
  const safeSubject = escHtml(node.subject || "");
  const safePreview = escHtml(node.preview_text || "");
  const safeCtaText = escHtml(node.cta_text || "");
  const safeCtaUrl = sanitizeUrl(node.cta_url || "") || "#";
  const safeFooter = escHtml(brand.footer_content || `© ${new Date().getFullYear()} ${brand.sender_name}. All rights reserved.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeSubject || "Email"}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:${fontFamily};">
<div style="display:none;max-height:0;overflow:hidden;">${safePreview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background-color:${bgColor};padding:24px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
${safeLogoUrl ? `<td width="40"><img src="${safeLogoUrl}" alt="${safeSenderName}" width="36" height="36" style="display:block;border-radius:6px;" /></td>` : ""}
<td style="padding-left:${safeLogoUrl ? "12px" : "0"};color:#ffffff;font-size:18px;font-weight:700;font-family:${fontFamily};">${safeSenderName}</td>
</tr>
</table>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-family:${fontFamily};">${safeSubject}</h1>
<div style="font-size:15px;line-height:1.6;color:#4a4a4a;font-family:${fontFamily};">${node.body_html || "<p>Email content goes here.</p>"}</div>
${
  node.cta_text
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
<tr><td style="background-color:${bgColor};border-radius:${ctaBorderRadius};text-align:center;">
<a href="${safeCtaUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;font-family:${fontFamily};">${safeCtaText}</a>
</td></tr>
</table>`
    : ""
}
</td></tr>
<tr><td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;color:#9ca3af;font-family:${fontFamily};">${safeFooter}</p>
${brand.social_links ? buildSocialLinks(brand.social_links) : ""}
<p style="margin:8px 0 0;font-size:11px;color:#d1d5db;font-family:${fontFamily};"><a href="{{unsubscribe_url}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildSocialLinks(
  links: Record<string, string | undefined>
): string {
  const items = Object.entries(links)
    .filter(([, url]) => url)
    .map(
      ([platform, url]) =>
        `<a href="${sanitizeUrl(url!)}" style="color:#6b7280;text-decoration:none;font-size:12px;margin-right:12px;">${escHtml(platform.charAt(0).toUpperCase() + platform.slice(1))}</a>`
    )
    .join("");
  return items
    ? `<p style="margin:8px 0 0;">${items}</p>`
    : "";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { ok } = rateLimit(`generate-emails:${ip}`, 3, 60_000);
  if (!ok)
    return NextResponse.json(
      { detail: "Too many requests" },
      { status: 429 }
    );

  try {
    const body = await req.json();
    const {
      brand_config,
      stages,
      analysis = {},
    } = body as {
      brand_config: BrandConfigInput;
      stages: StageEmailInput[];
      analysis: Record<string, unknown>;
    };

    if (
      !brand_config ||
      !stages ||
      !Array.isArray(stages) ||
      stages.length === 0
    ) {
      return NextResponse.json(
        { detail: "brand_config and stages are required" },
        { status: 400 }
      );
    }

    if (stages.length > 3) {
      return NextResponse.json(
        { detail: "Max 3 stage emails per request" },
        { status: 400 }
      );
    }

    // Input validation
    if (brand_config.sender_name && brand_config.sender_name.length > 100) {
      brand_config.sender_name = brand_config.sender_name.slice(0, 100);
    }
    if (brand_config.primary_color && !/^#[0-9a-fA-F]{3,8}$/.test(brand_config.primary_color)) {
      brand_config.primary_color = "#1e293b";
    }
    if (brand_config.secondary_color && !/^#[0-9a-fA-F]{3,8}$/.test(brand_config.secondary_color)) {
      brand_config.secondary_color = undefined;
    }
    if (brand_config.logo_url && !brand_config.logo_url.startsWith("https://") && !brand_config.logo_url.startsWith("http://")) {
      brand_config.logo_url = "";
    }
    if (brand_config.footer_content && brand_config.footer_content.length > 500) {
      brand_config.footer_content = brand_config.footer_content.slice(0, 500);
    }

    // Truncate stage email fields to prevent prompt injection
    for (const s of stages) {
      if (s.email_node.subject) s.email_node.subject = s.email_node.subject.slice(0, 200);
      if (s.email_node.preview_text) s.email_node.preview_text = s.email_node.preview_text.slice(0, 300);
      if (s.email_node.body_html) s.email_node.body_html = s.email_node.body_html.slice(0, 2000);
      if (s.email_node.cta_text) s.email_node.cta_text = s.email_node.cta_text.slice(0, 100);
      if (s.stage_name) s.stage_name = s.stage_name.slice(0, 100);
      if (s.stage_description) s.stage_description = s.stage_description.slice(0, 300);
    }

    // If no Gemini key, return stub HTML emails
    if (!genAI) {
      const emails = stages.map((s) => ({
        node_id: s.email_node.id,
        stage_name: s.stage_name,
        subject: s.email_node.subject || "",
        html: stubEmailHtml(brand_config, s),
        status: "ready" as const,
      }));
      return NextResponse.json({ emails });
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const stageDescriptions = stages
        .map(
          (s, i) => `
EMAIL ${i + 1} — Stage: "${s.stage_name}"
Stage purpose: ${s.stage_description}
Subject line: ${s.email_node.subject || "N/A"}
Preview text: ${s.email_node.preview_text || "N/A"}
Body copy: ${s.email_node.body_html || "N/A"}
CTA text: ${s.email_node.cta_text || "N/A"}
CTA URL: ${s.email_node.cta_url || "#"}`
        )
        .join("\n");

      const ctaStyleDesc =
        brand_config.cta_style === "pill"
          ? "fully rounded pill shape (border-radius: 25px)"
          : brand_config.cta_style === "rounded"
            ? "rounded corners (border-radius: 8px)"
            : "square corners (border-radius: 0)";

      const templateStyleGuide: Record<string, string> = {
        minimal: "TEMPLATE STYLE: Minimal — Clean, generous whitespace, single-column, no background images, subtle dividers, light text. Focus on readability.",
        editorial: "TEMPLATE STYLE: Editorial — Content-rich, multi-section, subtle section dividers, pull quotes or highlighted stats, slightly longer body copy with editorial formatting.",
        promotional: "TEMPLATE STYLE: Promotional — Bold, eye-catching, large hero section with background color blocks, prominent CTA, urgency-driven design, badge/label elements.",
      };

      const prompt = `You are an expert email HTML developer. Generate ${stages.length} production-ready HTML emails.

BRAND GUIDELINES:
- Logo URL: ${brand_config.logo_url || "none"}
- Brand name: ${brand_config.sender_name}
- Primary color: ${brand_config.primary_color}
- Secondary color: ${brand_config.secondary_color || "auto"}
- Font: ${brand_config.font_family}
- Header: ${brand_config.header_style}
- CTA button style: ${ctaStyleDesc}
- Tone: ${brand_config.tone_override || (analysis.tone as string) || "professional"}
- Footer: ${brand_config.footer_content}

${templateStyleGuide[brand_config.template_style || "minimal"] || templateStyleGuide.minimal}

EMAILS TO GENERATE:
${stageDescriptions}

REQUIREMENTS:
- Table-based layout (ESP compatible)
- ALL styles inline (no <style> blocks)
- Max width 600px, centered
- Structure: hidden preheader → branded header with logo → body → CTA button → footer with unsubscribe
- Include {{first_name}} and {{unsubscribe_url}} personalization tokens
- Each email is a complete <!DOCTYPE html> document
- No JavaScript, no external CSS
- Use the brand copy provided but enhance it — make it compelling and on-brand

Return ONLY a JSON array: [{"stage_name":"...","html":"..."}]
No markdown, no code fences, just raw JSON.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 16384 },
      });

      let text = result.response.text().trim();
      // Robust code-fence stripping
      text = text.replace(/^```\w*\n?/, "").replace(/\n?```\s*$/, "").trim();

      const parsed = JSON.parse(text);

      // Validate response shape
      const generated: { stage_name: string; html: string }[] = [];
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (
            item &&
            typeof item === "object" &&
            typeof item.stage_name === "string" &&
            typeof item.html === "string"
          ) {
            generated.push({ stage_name: item.stage_name, html: item.html });
          }
        }
      }

      const emails = stages.map((s) => {
        const match = generated.find(
          (g) =>
            g.stage_name.toLowerCase() ===
            s.stage_name.toLowerCase()
        );
        return {
          node_id: s.email_node.id,
          stage_name: s.stage_name,
          subject: s.email_node.subject || "",
          html: match?.html || stubEmailHtml(brand_config, s),
          status: "ready" as const,
        };
      });

      return NextResponse.json({ emails });
    } catch (aiError) {
      console.error("Gemini email generation failed, using stub:", aiError);
      const emails = stages.map((s) => ({
        node_id: s.email_node.id,
        stage_name: s.stage_name,
        subject: s.email_node.subject || "",
        html: stubEmailHtml(brand_config, s),
        status: "ready" as const,
      }));
      return NextResponse.json({ emails });
    }
  } catch (e) {
    console.error("Email generation error:", e);
    return NextResponse.json(
      { detail: "Email generation failed" },
      { status: 500 }
    );
  }
}
