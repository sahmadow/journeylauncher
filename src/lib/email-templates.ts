/**
 * HTML email templates for Journey Launcher flow wizard.
 * Inline styles only — email clients don't support external CSS.
 */

const BRAND = {
  name: "Journey Launcher",
  url: "https://www.journeylauncher.com",
  calendly: "https://calendly.com/saleh-journeylauncher/30min",
  from: { email: "saleh@journeylauncher.com", name: "Saleh from Journey Launcher" },
  replyTo: { email: "saleh@journeylauncher.com", name: "Saleh" },
  color: "#0f172a",
  accent: "#3b82f6",
};

export { BRAND };

// ── Shared layout ─────────────────────────────────────────────

function layout(body: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Journey Launcher</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
          <!-- Header bar -->
          <tr>
            <td style="background-color:${BRAND.color};border-radius:12px 12px 0 0;padding:24px 32px;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;">Journey Launcher</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Sent by <a href="${BRAND.url}" style="color:#64748b;text-decoration:underline;">Journey Launcher</a><br/>
                CRM lifecycle strategy for growing brands.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${BRAND.color};border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ── Email 1: Flow Ready (sent immediately on completion) ──────

export function flowReadyEmail(vars: {
  brandName: string;
  flowSummaryUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your CRM Lifecycle Flow for ${vars.brandName} is Ready`;

  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">
        Your flow is ready &#127881;
      </h1>
      <p style="margin:0 0 8px;font-size:15px;color:#334155;line-height:1.6;">
        Hi there,
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        I just generated a custom CRM lifecycle flow for <strong>${vars.brandName}</strong>. It includes lifecycle stages, email sequences, triggers, and personalised recommendations based on your inputs.
      </p>
      <p style="margin:0 0 4px;font-size:15px;color:#334155;line-height:1.6;">
        View your full flow summary here:
      </p>
      ${button("View Your Flow Summary", vars.flowSummaryUrl)}
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        This flow is a strategic blueprint — ready to be implemented in your ESP (Klaviyo, Mailchimp, AutoSend, etc.).
      </p>
      <p style="margin:0 0 4px;font-size:15px;color:#334155;line-height:1.6;">
        Want help putting it into action? I offer a free 30-min setup call:
      </p>
      ${button("Book a Free Setup Call", BRAND.calendly)}
      <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
        — Saleh
      </p>`,
    `Your CRM lifecycle flow for ${vars.brandName} is ready. View your full summary and book a free setup call.`
  );

  const text = `Your CRM Lifecycle Flow for ${vars.brandName} is Ready

Hi there,

I just generated a custom CRM lifecycle flow for ${vars.brandName}. It includes lifecycle stages, email sequences, triggers, and personalised recommendations.

View your flow summary: ${vars.flowSummaryUrl}

Want help putting it into action? Book a free 30-min setup call:
${BRAND.calendly}

— Saleh
Journey Launcher | ${BRAND.url}`;

  return { subject, html, text };
}

// ── Email 2: Follow-up (7 days after completion) ──────────────

export function flowFollowUpEmail(vars: {
  brandName: string;
  flowSummaryUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Ready to put your ${vars.brandName} flow into action?`;

  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">
        Quick check-in
      </h1>
      <p style="margin:0 0 8px;font-size:15px;color:#334155;line-height:1.6;">
        Hi,
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Last week you generated a CRM lifecycle flow for <strong>${vars.brandName}</strong>. Just checking in — have you had a chance to review it?
      </p>
      ${button("Review Your Flow", vars.flowSummaryUrl)}
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Most brands I work with see the biggest gains from implementing just <strong>2-3 flows</strong> first (welcome, abandoned cart, post-purchase). I can help you prioritise and set them up.
      </p>
      <p style="margin:0 0 4px;font-size:15px;color:#334155;line-height:1.6;">
        Grab a free 30-min call and I'll walk you through the next steps:
      </p>
      ${button("Book a Free Setup Call", BRAND.calendly)}
      <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
        — Saleh
      </p>`,
    `Have you reviewed your CRM flow for ${vars.brandName}? Book a free call to get started.`
  );

  const text = `Ready to put your ${vars.brandName} flow into action?

Hi,

Last week you generated a CRM lifecycle flow for ${vars.brandName}. Just checking in — have you had a chance to review it?

Review your flow: ${vars.flowSummaryUrl}

Most brands see the biggest gains from implementing just 2-3 flows first. I can help you prioritise and set them up.

Book a free 30-min call: ${BRAND.calendly}

— Saleh
Journey Launcher | ${BRAND.url}`;

  return { subject, html, text };
}

// ── Email 3: Abandoned flow (1hr after email capture) ─────────

export function flowAbandonedEmail(vars: {
  email: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your CRM Flow — we saved your progress";

  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">
        Looks like you didn't finish
      </h1>
      <p style="margin:0 0 8px;font-size:15px;color:#334155;line-height:1.6;">
        Hi,
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        You started building a CRM lifecycle flow on Journey Launcher but didn't quite finish. No worries — the wizard only takes a couple more minutes.
      </p>
      ${button("Finish Your Flow", BRAND.url + "/flow")}
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Or if you'd prefer a hands-on approach, I'm happy to build one for you on a free call:
      </p>
      ${button("Book a Free Setup Call", BRAND.calendly)}
      <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
        — Saleh
      </p>`,
    `You started building a CRM flow but didn't finish. Pick up where you left off or book a free call.`
  );

  const text = `Your CRM Flow — we saved your progress

Hi,

You started building a CRM lifecycle flow on Journey Launcher but didn't quite finish. The wizard only takes a couple more minutes.

Finish your flow: ${BRAND.url}/flow

Or book a free 30-min call and I'll build one for you:
${BRAND.calendly}

— Saleh
Journey Launcher | ${BRAND.url}`;

  return { subject, html, text };
}
