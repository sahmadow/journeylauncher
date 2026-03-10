import { Autosend } from "autosendjs";
import { BRAND, flowReadyEmail } from "./email-templates";

// AutoSend list IDs — set these after creating lists in AutoSend dashboard
const COMPLETED_LIST_ID = process.env.AUTOSEND_COMPLETED_LIST_ID || "";
const ABANDONED_LIST_ID = process.env.AUTOSEND_ABANDONED_LIST_ID || "";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY || "");

export { COMPLETED_LIST_ID, ABANDONED_LIST_ID };

type FlowContactFields = Record<string, string | number>;

/**
 * Upsert a contact into AutoSend and assign to a list.
 * Tries create (supports listIds) first, falls back to upsert for duplicates.
 * Non-blocking — errors are logged but never thrown.
 *
 * Adding to a list triggers AutoSend dashboard automations:
 *   - "Completed" list → 7-day follow-up automation
 *   - "Abandoned" list → 1hr abandoned flow automation
 */
export async function upsertFlowContact(
  email: string,
  customFields: FlowContactFields,
  listIds: string[]
): Promise<void> {
  try {
    const validListIds = listIds.filter(Boolean);

    try {
      await autosend.contacts.create({
        email,
        listIds: validListIds,
        customFields,
      });
      console.log(`[AutoSend] Created contact ${email} → lists: ${validListIds.join(", ")}`);
    } catch {
      // Contact already exists — upsert (SDK upsert doesn't support listIds)
      await autosend.contacts.upsert({
        email,
        customFields,
      });
      console.log(`[AutoSend] Upserted contact ${email} (existing contact)`);
    }
  } catch (err) {
    console.error(`[AutoSend] Failed to upsert contact ${email}:`, err);
  }
}

/**
 * Remove a contact from a specific list.
 * AutoSend SDK doesn't support per-list removal.
 * Relies on automation exit conditions instead.
 */
export async function removeFromList(
  email: string,
  listId: string
): Promise<void> {
  console.log(
    `[AutoSend] removeFromList is a no-op — ${email} removal from ${listId} handled by automation exit condition`
  );
}

/**
 * Send the "Flow Ready" email immediately after wizard completion via API.
 * Non-blocking — errors logged, never thrown.
 */
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
    console.log(`[AutoSend] Sent "Flow Ready" email to ${toEmail}`);
  } catch (err) {
    console.error(`[AutoSend] Failed to send "Flow Ready" email to ${toEmail}:`, err);
  }
}
