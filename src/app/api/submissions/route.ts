import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  upsertFlowContact,
  removeFromList,
  sendFlowReadyEmail,
  COMPLETED_LIST_ID,
  ABANDONED_LIST_ID,
} from "@/lib/autosend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Save email capture separately if email provided
    if (body.email) {
      try {
        await prisma.emailCapture.create({
          data: { email: body.email, source: "flow_wizard" },
        });
      } catch (e) {
        console.error("[EmailCapture] Save failed:", e);
      }
    }

    const submission = await prisma.submission.create({
      data: {
        landingPageUrl: body.landing_page_url || null,
        businessDesc: body.business_desc || null,
        clmScore: body.clm_score ?? null,
        personalisationScore: body.personalisation_score ?? null,
        dataAvailability: body.data_availability || null,
        lifecycleGaps: body.lifecycle_gaps || null,
        dataSources: body.data_sources || null,
        dataSourceOther: body.data_source_other || null,
        scrapedData: body.scraped_data || null,
        generatedFlow: body.generated_flow || null,
        webhookSummary: body.webhook_summary || null,
        email: body.email || null,
      },
    });

    // Non-blocking: add to "Completed" list, remove from "Abandoned", send email
    if (body.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.journeylauncher.com";
      const flowSummaryUrl = `${siteUrl}/flow-summary/${submission.id}`;
      const brandName =
        body.scraped_data?.title || body.landing_page_url || "Your Brand";

      // Add contact to Completed list
      upsertFlowContact(
        body.email,
        {
          businessType: body.business_desc || "",
          companyName: body.landing_page_url || "",
          flowSummaryUrl,
          source: "flow_wizard",
        },
        [COMPLETED_LIST_ID]
      );

      // Remove from Abandoned list (no-op, handled by automation exit)
      removeFromList(body.email, ABANDONED_LIST_ID);

      // Send "Flow Ready" email immediately + mark as sent
      sendFlowReadyEmail(body.email, brandName, flowSummaryUrl).then(() => {
        prisma.submission
          .update({
            where: { id: submission.id },
            data: { flowEmailSentAt: new Date() },
          })
          .catch((err) => console.error("[Submission] Failed to mark flow email sent:", err));
      });
    }

    console.log(`[Submission] ${submission.id} — ${body.landing_page_url || body.email || "unknown"}`);
    return NextResponse.json({ id: submission.id, success: true });
  } catch (e) {
    console.error("Submission error:", e);
    return NextResponse.json({ detail: "Save failed" }, { status: 500 });
  }
}
