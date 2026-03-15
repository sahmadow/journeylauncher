import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Import the stub flow generator inline to keep it self-contained
function stubFlow(lifecycleGaps: string[], scrapedData: Record<string, unknown>, analysis: Record<string, unknown>) {
  const title = (scrapedData.title as string) || "our platform";
  const biz = (analysis.usp as string) || "your product";
  const businessType = (analysis.business_type as string) || "saas";

  const ctas: Record<string, Record<string, string>> = {
    saas: { primary: "Start Free Trial", secondary: "Explore Features", upgrade: "Upgrade Now" },
    ecommerce: { primary: "Shop Now", secondary: "Browse Collection", upgrade: "Complete Your Order" },
    service: { primary: "Book a Call", secondary: "View Case Studies", upgrade: "Get Your Proposal" },
  };
  const cta = ctas[businessType] || ctas.saas;

  const templates: Record<string, Record<string, { description: string; nodes: Record<string, unknown>[] }>> = {
    saas: {
      "Early Engagement": {
        description: "Product-led onboarding with activation tracking",
        nodes: [
          { id: "ee-1", type: "trigger", label: "User Signs Up", description: "New user registration detected" },
          { id: "ee-2", type: "email", subject: `Welcome to ${title} — here's your first step`, preview_text: "One action to unlock your full experience", body_html: `<p>Hi there!</p><p>${biz}</p><p>The fastest way to see value: <strong>complete your first project</strong>.</p>`, cta_text: "Create Your First Project", cta_url: "#" },
          { id: "ee-push", type: "push", label: "Complete your setup", description: "Your workspace is ready — finish setup in 2 minutes" },
          { id: "ee-3", type: "wait", duration: "1 day" },
          { id: "ee-inapp", type: "in_app", label: "Welcome Banner", description: "Create your first project to unlock the full experience", cta_text: "Start Now" },
          { id: "ee-4", type: "condition", condition: "Completed first project?", yes_label: "Activated", no_label: "Not activated" },
          { id: "ee-5", type: "email", subject: `Nice work! Here's what to explore next on ${title}`, preview_text: "You're off to a great start", body_html: "<p>Congrats on completing your first project! Here's a feature power users love.</p>", cta_text: "Try Automated Workflows", cta_url: "#" },
          { id: "ee-6", type: "email", subject: "Let's get you started — step by step", preview_text: "A quick guide to your first win", body_html: "<p>Getting started is easy. Here's exactly what to do.</p>", cta_text: cta.primary, cta_url: "#" },
          { id: "ee-7", type: "wait", duration: "3 days" },
          { id: "ee-8", type: "email", subject: "Quick question — how's it going?", preview_text: "Your feedback shapes our product", body_html: "<p>How likely are you to recommend us? (0-10)</p>", cta_text: "Share Your Rating", cta_url: "#" },
        ],
      },
      "Engagement": {
        description: "Feature adoption with milestone celebrations",
        nodes: [
          { id: "en-1", type: "trigger", label: "Completed Onboarding + 7 Days Active", description: "User finished activation" },
          { id: "en-2", type: "email", subject: "A power-user tip based on your activity", preview_text: "Personalized tips", body_html: "<p>Based on how you're using the platform, here's a time-saving tip.</p>", cta_text: cta.secondary, cta_url: "#" },
          { id: "en-push", type: "push", label: "New feature unlocked", description: "Automated reports are now available for your account" },
          { id: "en-3", type: "wait", duration: "4 days" },
          { id: "en-inapp", type: "in_app", label: "Feature Spotlight", description: "Try advanced filters to find insights faster", cta_text: "Try It" },
          { id: "en-4", type: "condition", condition: "Used advanced features?", yes_label: "Power user", no_label: "Standard user" },
          { id: "en-5", type: "email", subject: "You've hit a milestone!", preview_text: "Celebrating your progress", body_html: "<p>You're in the top 20% of users!</p>", cta_text: "Explore Integrations", cta_url: "#" },
          { id: "en-6", type: "email", subject: "Users like you love this feature", preview_text: "Feature recommendation", body_html: "<p>78% of users with similar workflows found automated reports to be a game-changer.</p>", cta_text: "Set Up Reports", cta_url: "#" },
          { id: "en-7", type: "wait", duration: "5 days" },
          { id: "en-8", type: "email", subject: "Here's what you've accomplished", preview_text: "Your impact in numbers", body_html: "<p>A quick look at your journey with us.</p>", cta_text: "Discover More Features", cta_url: "#" },
        ],
      },
      "Monetisation": {
        description: "Value-first upgrade path",
        nodes: [
          { id: "mo-1", type: "trigger", label: "Trial Day 7", description: "Early awareness push" },
          { id: "mo-2", type: "email", subject: "Your first week — here's what you've built", preview_text: "Summary of your progress", body_html: "<p>You've been with us a week! Upgrading means no limits.</p>", cta_text: "See Pro Plan", cta_url: "#" },
          { id: "mo-push", type: "push", label: "Your trial ends in 3 days", description: "Upgrade now to keep all your work and data" },
          { id: "mo-3", type: "wait", duration: "3 days" },
          { id: "mo-inapp", type: "in_app", label: "Upgrade Banner", description: "Unlock unlimited projects and priority support", cta_text: "See Plans" },
          { id: "mo-4", type: "condition", condition: "Used premium feature?", yes_label: "Experienced premium", no_label: "Free-tier only" },
          { id: "mo-5", type: "email", subject: "You're already using premium features", preview_text: "Don't lose access", body_html: "<p>Upgrade now to keep access.</p>", cta_text: cta.upgrade, cta_url: "#" },
          { id: "mo-6", type: "wait", duration: "4 days" },
          { id: "mo-7", type: "condition", condition: "Upgraded?", yes_label: "Converted", no_label: "Still on trial" },
          { id: "mo-8", type: "email", subject: "Special offer before your trial ends", preview_text: "Save 20%", body_html: "<p><strong>20% off your first 3 months</strong> if you upgrade today.</p>", cta_text: "Claim 20% Off", cta_url: "#" },
        ],
      },
      "Retention": {
        description: "Win-back with value-led re-engagement",
        nodes: [
          { id: "re-1", type: "trigger", label: "Usage Drop Detected", description: "Activity decreased 50%+" },
          { id: "re-2", type: "email", subject: "Here's what's new since you've been away", preview_text: "New features", body_html: "<p>We've been building new things you might find useful.</p>", cta_text: "See What's New", cta_url: "#" },
          { id: "re-push", type: "push", label: "We miss you!", description: "3 new features added since your last visit" },
          { id: "re-3", type: "wait", duration: "3 days" },
          { id: "re-inapp", type: "in_app", label: "Welcome Back Popup", description: "Here's what's new since you've been away", cta_text: "See What's New" },
          { id: "re-4", type: "condition", condition: "Returned?", yes_label: "Re-engaged", no_label: "Still disengaged" },
          { id: "re-5", type: "email", subject: "Welcome back! Here's a perk", preview_text: "A reward for coming back", body_html: "<p>We've unlocked a loyalty perk in your account.</p>", cta_text: "See My Perk", cta_url: "#" },
          { id: "re-6", type: "wait", duration: "5 days" },
          { id: "re-7", type: "email", subject: "What could we do better?", preview_text: "Your feedback helps", body_html: "<p>What's the #1 thing that would bring you back?</p>", cta_text: "Share Feedback", cta_url: "#" },
        ],
      },
    },
    ecommerce: {
      "Early Engagement": {
        description: "Welcome flow with first-purchase incentive",
        nodes: [
          { id: "ee-1", type: "trigger", label: "New Account Created", description: "Customer creates account" },
          { id: "ee-2", type: "email", subject: `Welcome to ${title} — 10% off your first order`, preview_text: "Your welcome discount", body_html: `<p>${biz}</p><p>Use code <strong>WELCOME10</strong> for 10% off.</p>`, cta_text: "Shop Now", cta_url: "#" },
          { id: "ee-push", type: "push", label: "Your discount is waiting", description: "Use WELCOME10 for 10% off your first order" },
          { id: "ee-3", type: "wait", duration: "2 days" },
          { id: "ee-inapp", type: "in_app", label: "Welcome Banner", description: "New here? Get 10% off your first order", cta_text: "Shop Now" },
          { id: "ee-4", type: "condition", condition: "Made first purchase?", yes_label: "Purchased", no_label: "No purchase" },
          { id: "ee-5", type: "email", subject: "Order confirmed — what's next", preview_text: "Recommendations based on purchase", body_html: "<p>Thanks for your order! You might also love these.</p>", cta_text: "Browse Recommendations", cta_url: "#" },
          { id: "ee-6", type: "email", subject: "Your discount expires soon", preview_text: "Don't miss 10% off", body_html: "<p>Your WELCOME10 code expires in 48 hours.</p>", cta_text: "Shop Now", cta_url: "#" },
          { id: "ee-7", type: "wait", duration: "3 days" },
          { id: "ee-8", type: "email", subject: "Top picks this week", preview_text: "Trending products", body_html: "<p>Here's what our customers are loving.</p>", cta_text: "Browse Trending", cta_url: "#" },
        ],
      },
      "Engagement": {
        description: "Product discovery and wishlist engagement",
        nodes: [
          { id: "en-1", type: "trigger", label: "First Purchase + 7 Days", description: "Post-purchase engagement" },
          { id: "en-2", type: "email", subject: "New arrivals you'll love", preview_text: "Based on your history", body_html: "<p>New products in categories you love.</p>", cta_text: "Browse New Arrivals", cta_url: "#" },
          { id: "en-push", type: "push", label: "Back in stock!", description: "An item you viewed is available again" },
          { id: "en-3", type: "wait", duration: "5 days" },
          { id: "en-inapp", type: "in_app", label: "Recommended Products", description: "Picks based on your browsing history", cta_text: "View All" },
          { id: "en-4", type: "condition", condition: "Added to wishlist?", yes_label: "Has wishlist", no_label: "No wishlist" },
          { id: "en-5", type: "email", subject: "Your wishlist item is selling fast!", preview_text: "Don't miss out", body_html: "<p>One of your wishlist items is running low!</p>", cta_text: "View Wishlist", cta_url: "#" },
          { id: "en-6", type: "email", subject: "How was your purchase?", preview_text: "Leave a review, earn $5", body_html: "<p>Leave a review and get a <strong>$5 credit</strong>.</p>", cta_text: "Leave a Review", cta_url: "#" },
        ],
      },
      "Monetisation": {
        description: "Cart recovery and repeat purchase incentives",
        nodes: [
          { id: "mo-1", type: "trigger", label: "Cart Abandoned", description: "Items in cart, no checkout" },
          { id: "mo-2", type: "email", subject: "You left something in your cart", preview_text: "Complete your order", body_html: "<p>Your items are still waiting!</p>", cta_text: "Complete Your Order", cta_url: "#" },
          { id: "mo-push", type: "push", label: "You left items in your cart", description: "Complete your order before items sell out" },
          { id: "mo-3", type: "wait", duration: "1 day" },
          { id: "mo-inapp", type: "in_app", label: "Cart Recovery Popup", description: "Your cart is waiting — free shipping on orders over $50", cta_text: "View Cart" },
          { id: "mo-4", type: "condition", condition: "Completed purchase?", yes_label: "Purchased", no_label: "Still abandoned" },
          { id: "mo-5", type: "email", subject: "Your cart items are going fast", preview_text: "Limited stock", body_html: "<p>Limited stock on your cart items.</p>", cta_text: "Complete Your Order", cta_url: "#" },
          { id: "mo-6", type: "wait", duration: "2 days" },
          { id: "mo-7", type: "email", subject: "Free shipping on your order", preview_text: "We'll cover shipping", body_html: "<p>Use code <strong>FREESHIP</strong> at checkout.</p>", cta_text: "Claim Free Shipping", cta_url: "#" },
        ],
      },
      "Retention": {
        description: "Win-back with new arrivals and incentives",
        nodes: [
          { id: "re-1", type: "trigger", label: "No Purchase in 60 Days", description: "Lapsed customer" },
          { id: "re-2", type: "email", subject: "New arrivals you'll love", preview_text: "See what's new", body_html: "<p>Check out our newest products!</p>", cta_text: "Browse New Arrivals", cta_url: "#" },
          { id: "re-push", type: "push", label: "Flash sale: 24hrs only", description: "Up to 30% off your favourite categories" },
          { id: "re-3", type: "wait", duration: "5 days" },
          { id: "re-inapp", type: "in_app", label: "Win-Back Popup", description: "It's been a while — here's 15% off to welcome you back", cta_text: "Claim Offer" },
          { id: "re-4", type: "condition", condition: "Returned?", yes_label: "Re-engaged", no_label: "Still inactive" },
          { id: "re-5", type: "email", subject: "15% off — we'd love you back", preview_text: "Exclusive offer", body_html: "<p>Use code <strong>COMEBACK15</strong> for 15% off.</p>", cta_text: "Claim Your Discount", cta_url: "#" },
          { id: "re-6", type: "wait", duration: "7 days" },
          { id: "re-7", type: "email", subject: "We'd love your feedback", preview_text: "Help us improve", body_html: "<p>What could we do better?</p>", cta_text: "Share Feedback", cta_url: "#" },
        ],
      },
    },
    service: {
      "Early Engagement": {
        description: "Lead nurturing with expertise showcase",
        nodes: [
          { id: "ee-1", type: "trigger", label: "Lead Captured", description: "Form submission or inquiry" },
          { id: "ee-2", type: "email", subject: `Welcome from ${title}`, preview_text: "How we can help", body_html: `<p>${biz}</p><p>We've helped dozens of businesses achieve similar goals.</p>`, cta_text: "View Case Studies", cta_url: "#" },
          { id: "ee-push", type: "push", label: "New resource available", description: "Download our getting started guide" },
          { id: "ee-3", type: "wait", duration: "2 days" },
          { id: "ee-inapp", type: "in_app", label: "Consultation Banner", description: "Book a free 15-minute discovery call", cta_text: "Book Now" },
          { id: "ee-4", type: "condition", condition: "Opened email or visited site?", yes_label: "Engaged", no_label: "Cold" },
          { id: "ee-5", type: "email", subject: "How we helped a business like yours", preview_text: "Real success story", body_html: "<p>Here's a case study from a similar business.</p>", cta_text: "Read the Case Study", cta_url: "#" },
          { id: "ee-6", type: "email", subject: "Let's see if we're a good fit", preview_text: "15-minute discovery call", body_html: "<p>Book a free 15-minute call — no commitment.</p>", cta_text: "Book a Call", cta_url: "#" },
        ],
      },
      "Engagement": {
        description: "Expertise-building with educational content",
        nodes: [
          { id: "en-1", type: "trigger", label: "Attended Consultation", description: "Deeper engagement shown" },
          { id: "en-2", type: "email", subject: "An insider look at our process", preview_text: "Behind the scenes", body_html: "<p>Here's a peek at our methodology.</p>", cta_text: "Learn Our Approach", cta_url: "#" },
          { id: "en-push", type: "push", label: "New case study published", description: "See how we helped a business like yours" },
          { id: "en-3", type: "wait", duration: "4 days" },
          { id: "en-inapp", type: "in_app", label: "Resource Banner", description: "Download our industry insights report", cta_text: "Get Report" },
          { id: "en-4", type: "condition", condition: "Engaged with content?", yes_label: "Warm lead", no_label: "Lukewarm" },
          { id: "en-5", type: "email", subject: "What our clients say", preview_text: "Testimonials", body_html: "<p>Don't take our word for it — hear from our clients.</p>", cta_text: "See Testimonials", cta_url: "#" },
          { id: "en-6", type: "email", subject: "Free resource: our getting started guide", preview_text: "Actionable tips", body_html: "<p>A practical guide based on years of experience.</p>", cta_text: "Download Guide", cta_url: "#" },
        ],
      },
      "Monetisation": {
        description: "Proposal and conversion flow",
        nodes: [
          { id: "mo-1", type: "trigger", label: "Consultation Completed", description: "Discovery call done" },
          { id: "mo-2", type: "email", subject: "Your custom proposal is ready", preview_text: "Tailored to your needs", body_html: "<p>We've put together a proposal based on our discussion.</p>", cta_text: "View Your Proposal", cta_url: "#" },
          { id: "mo-push", type: "push", label: "Your proposal is ready", description: "Review your custom proposal and next steps" },
          { id: "mo-3", type: "wait", duration: "3 days" },
          { id: "mo-inapp", type: "in_app", label: "Booking Prompt", description: "Ready to move forward? Schedule your next session", cta_text: "Book Meeting" },
          { id: "mo-4", type: "condition", condition: "Viewed proposal?", yes_label: "Reviewing", no_label: "Hasn't opened" },
          { id: "mo-5", type: "email", subject: "Questions about the proposal?", preview_text: "Happy to discuss", body_html: "<p>Any questions? Happy to hop on a quick call.</p>", cta_text: "Schedule Follow-up", cta_url: "#" },
          { id: "mo-6", type: "wait", duration: "5 days" },
          { id: "mo-7", type: "email", subject: "Would a retainer work better?", preview_text: "Ongoing support option", body_html: "<p>Our retainer packages offer better value and priority access.</p>", cta_text: "See Retainer Options", cta_url: "#" },
        ],
      },
      "Retention": {
        description: "Client relationship nurturing",
        nodes: [
          { id: "re-1", type: "trigger", label: "Project Completed", description: "Engagement wrapped up" },
          { id: "re-2", type: "email", subject: "How did we do?", preview_text: "Quick feedback", body_html: "<p>We'd love to hear how the experience was.</p>", cta_text: "Share Feedback", cta_url: "#" },
          { id: "re-push", type: "push", label: "Quarterly check-in reminder", description: "Let's review your progress and plan ahead" },
          { id: "re-3", type: "wait", duration: "7 days" },
          { id: "re-inapp", type: "in_app", label: "Referral Banner", description: "Know someone who needs help? Earn rewards for referrals", cta_text: "Refer Now" },
          { id: "re-4", type: "condition", condition: "Left positive feedback?", yes_label: "Happy client", no_label: "No response" },
          { id: "re-5", type: "email", subject: "Know someone who could use our help?", preview_text: "Referral program", body_html: "<p>Both of you get a reward for referrals.</p>", cta_text: "Refer a Friend", cta_url: "#" },
          { id: "re-6", type: "wait", duration: "30 days" },
          { id: "re-7", type: "email", subject: "Quarterly check-in", preview_text: "We're here if you need anything", body_html: "<p>How's everything going since we worked together?</p>", cta_text: "Book a Call", cta_url: "#" },
        ],
      },
    },
  };

  const stageTemplates = templates[businessType] || templates.saas;
  const stages = lifecycleGaps.filter((gap: string) => stageTemplates[gap]).map((gap: string) => ({ stage: gap, ...stageTemplates[gap] }));
  return { stages };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { ok } = rateLimit(`generate:${ip}`, 5, 60_000);
  if (!ok) return NextResponse.json({ detail: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { scraped_data = {}, business_desc = "", lifecycle_gaps = [], analysis = {} } = body;

    if (!genAI) {
      return NextResponse.json({ flow: stubFlow(lifecycle_gaps, scraped_data, analysis) });
    }

    const businessType = analysis.business_type || "saas";
    const typeStrategies: Record<string, string> = {
      saas: "BUSINESS TYPE: SaaS\n- Early Engagement: trial activation\n- Engagement: feature adoption\n- Monetisation: upgrade nudges\n- Retention: usage-drop triggers",
      ecommerce: "BUSINESS TYPE: E-commerce\n- Early Engagement: welcome discount\n- Engagement: product recommendations\n- Monetisation: cart recovery\n- Retention: win-back campaigns",
      service: "BUSINESS TYPE: Service\n- Early Engagement: lead nurturing\n- Engagement: educational content\n- Monetisation: proposal follow-up\n- Retention: referral program",
    };

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Generate a complete customer lifecycle automation flow for a ${businessType} business.

Business: ${business_desc.slice(0, 500)}
Brand tone: ${analysis.tone || "professional"}
USP: ${analysis.usp || ""}
Features: ${JSON.stringify(analysis.features || [])}
Target audience: ${analysis.target_audience || ""}
Pricing: ${(scraped_data.pricing_text || "").slice(0, 500)}
Stages: ${JSON.stringify(lifecycle_gaps)}

${typeStrategies[businessType] || typeStrategies.saas}

For each stage, generate 8-11 nodes. Node types: trigger, email, wait, condition, push, in_app.
Each stage MUST include exactly 1 push node and 1 in_app node.
Trigger nodes MUST have: label, description.
Email nodes MUST have: subject, preview_text, body_html, cta_text, cta_url.
Wait nodes MUST have: duration.
Condition nodes MUST have: condition, yes_label, no_label.
Push nodes MUST have: label (notification title), description (notification body).
In-app nodes MUST have: label (placement name, e.g. "Welcome Banner", "Upgrade Prompt"), description (message), cta_text (action button text).
Return JSON: {"stages": [...]}. Return ONLY valid JSON.`;

      const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 4096 } });
      let text = result.response.text().trim();
      if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```$/, "");
      return NextResponse.json({ flow: JSON.parse(text) });
    } catch {
      return NextResponse.json({ flow: stubFlow(lifecycle_gaps, scraped_data, analysis) });
    }
  } catch (e) {
    console.error("Flow generation error:", e);
    return NextResponse.json({ detail: "Flow generation failed" }, { status: 500 });
  }
}
