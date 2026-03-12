import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFlowFollowUpEmail, sendAbandonedFlowEmail } from "@/lib/autosend";
import type { ScrapedData } from "@/types";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * Daily cron (9am UTC) — sends delayed emails:
 *   1. Abandoned flow emails: next day after capture, if no submission exists
 *      and no email sent to this address in the last 24hr
 *   2. Follow-up emails: 7 days after submission (once per submission)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { abandoned: 0, followUp: 0, errors: 0 };

  // ── 1. Abandoned flow emails (next day after capture, no submission) ──
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingAbandoned = await prisma.emailCapture.findMany({
      where: {
        abandonedEmailSentAt: null,
        isDeleted: false,
        createdAt: { lt: oneDayAgo },
      },
      take: 50,
    });

    for (const capture of pendingAbandoned) {
      // Skip if user completed the wizard
      const hasSubmission = await prisma.submission.findFirst({
        where: { email: capture.email, isDeleted: false },
        select: { id: true },
      });

      if (hasSubmission) {
        await prisma.emailCapture.update({
          where: { id: capture.id },
          data: { abandonedEmailSentAt: new Date() },
        });
        continue;
      }

      // Skip if this email already received any email in the last 24hr
      // (e.g. they abandoned multiple times)
      const recentlySent = await prisma.emailCapture.findFirst({
        where: {
          email: capture.email,
          abandonedEmailSentAt: { gte: oneDayAgo },
        },
        select: { id: true },
      });

      if (recentlySent) {
        await prisma.emailCapture.update({
          where: { id: capture.id },
          data: { abandonedEmailSentAt: new Date() },
        });
        continue;
      }

      try {
        await sendAbandonedFlowEmail(capture.email);
        await prisma.emailCapture.update({
          where: { id: capture.id },
          data: { abandonedEmailSentAt: new Date() },
        });
        results.abandoned++;
      } catch (err) {
        console.error(`[Cron] Abandoned email failed for ${capture.email}:`, err);
        results.errors++;
      }
    }
  } catch (err) {
    console.error("[Cron] Abandoned batch failed:", err);
    results.errors++;
  }

  // ── 2. Follow-up emails (7 days after submission) ──
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pendingFollowUps = await prisma.submission.findMany({
      where: {
        followUpEmailSentAt: null,
        flowEmailSentAt: { not: null },
        isDeleted: false,
        email: { not: null },
        createdAt: { lt: sevenDaysAgo },
      },
      take: 50,
    });

    for (const sub of pendingFollowUps) {
      if (!sub.email) continue;

      const scraped = sub.scrapedData as ScrapedData | null;
      const brandName = scraped?.title || sub.landingPageUrl || "Your Brand";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.journeylauncher.com";
      const flowSummaryUrl = `${siteUrl}/flow-summary/${sub.id}`;

      try {
        await sendFlowFollowUpEmail(sub.email, brandName, flowSummaryUrl);
        await prisma.submission.update({
          where: { id: sub.id },
          data: { followUpEmailSentAt: new Date() },
        });
        results.followUp++;
      } catch (err) {
        console.error(`[Cron] Follow-up failed for ${sub.email}:`, err);
        results.errors++;
      }
    }
  } catch (err) {
    console.error("[Cron] Follow-up batch failed:", err);
    results.errors++;
  }

  console.log(`[Cron] Done — abandoned: ${results.abandoned}, followUp: ${results.followUp}, errors: ${results.errors}`);
  return NextResponse.json({ success: true, ...results });
}
