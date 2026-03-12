import { Autosend } from "autosendjs";
import {
  BRAND,
  flowReadyEmail,
  flowFollowUpEmail,
  flowAbandonedEmail,
} from "./email-templates";

const COMPLETED_LIST_ID = process.env.AUTOSEND_COMPLETED_LIST_ID || "";
const ABANDONED_LIST_ID = process.env.AUTOSEND_ABANDONED_LIST_ID || "";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY || "");

export { COMPLETED_LIST_ID, ABANDONED_LIST_ID };

type FlowContactFields = Record<string, string | number>;

/**
 * Upsert a contact into AutoSend and assign to a list.
 * Tries create first (supports listIds), falls back to upsert for duplicates.
 */
export async function upsertFlowContact(
  email: string,
  customFields: FlowContactFields,
  listIds: string[]
): Promise<void> {
  try {
    const validListIds = listIds.filter(Boolean);
    try {
      await autosend.contacts.create({ email, listIds: validListIds, customFields });
      console.log(`[AutoSend] Created contact ${email} → lists: ${validListIds.join(", ")}`);
    } catch {
      await autosend.contacts.upsert({ email, customFields });
      console.log(`[AutoSend] Upserted contact ${email} (existing)`);
    }
  } catch (err) {
    console.error(`[AutoSend] Failed to upsert contact ${email}:`, err);
  }
}

/** No-op — AutoSend SDK doesn't support per-list removal. */
export async function removeFromList(email: string, listId: string): Promise<void> {
  console.log(`[AutoSend] removeFromList no-op — ${email} / ${listId}`);
}

/** Send "Flow Ready" email immediately (Email 1). */
export async function sendFlowReadyEmail(
  toEmail: string,
  brandName: string,
  flowSummaryUrl: string
): Promise<void> {
  try {
    const { subject, html, text } = flowReadyEmail({ brandName, flowSummaryUrl });
    await autosend.emails.send({
      from: BRAND.from,
      to: { email: toEmail },
      replyTo: BRAND.replyTo,
      subject,
      html,
      text,
    });
    console.log(`[AutoSend] Sent "Flow Ready" to ${toEmail}`);
  } catch (err) {
    console.error(`[AutoSend] Failed "Flow Ready" to ${toEmail}:`, err);
  }
}

/** Send 7-day follow-up email (Email 2). Called by cron. */
export async function sendFlowFollowUpEmail(
  toEmail: string,
  brandName: string,
  flowSummaryUrl: string
): Promise<void> {
  try {
    const { subject, html, text } = flowFollowUpEmail({ brandName, flowSummaryUrl });
    await autosend.emails.send({
      from: BRAND.from,
      to: { email: toEmail },
      replyTo: BRAND.replyTo,
      subject,
      html,
      text,
    });
    console.log(`[AutoSend] Sent "Follow-Up" to ${toEmail}`);
  } catch (err) {
    console.error(`[AutoSend] Failed "Follow-Up" to ${toEmail}:`, err);
  }
}

/** Send abandoned flow email (Email 3). Called by cron. */
export async function sendAbandonedFlowEmail(toEmail: string): Promise<void> {
  try {
    const { subject, html, text } = flowAbandonedEmail({ email: toEmail });
    await autosend.emails.send({
      from: BRAND.from,
      to: { email: toEmail },
      replyTo: BRAND.replyTo,
      subject,
      html,
      text,
    });
    console.log(`[AutoSend] Sent "Abandoned" to ${toEmail}`);
  } catch (err) {
    console.error(`[AutoSend] Failed "Abandoned" to ${toEmail}:`, err);
  }
}
