import { Autosend } from "autosendjs";

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
 */
export async function upsertFlowContact(
  email: string,
  customFields: FlowContactFields,
  listIds: string[]
): Promise<void> {
  try {
    // Filter out empty list IDs
    const validListIds = listIds.filter(Boolean);

    try {
      // create() supports listIds for list assignment
      await autosend.contacts.create({
        email,
        listIds: validListIds,
        customFields,
      });
      console.log(`[AutoSend] Created contact ${email} → lists: ${validListIds.join(", ")}`);
    } catch (createErr: unknown) {
      // If contact already exists, fall back to upsert (no listIds support)
      // The contact stays on their existing lists; new list assignment needs dashboard automation
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
 * NOTE: AutoSend API does not support per-list removal.
 * Relies on AutoSend automation exit conditions instead.
 * This function is a no-op placeholder for documentation purposes.
 */
export async function removeFromList(
  email: string,
  listId: string
): Promise<void> {
  // AutoSend SDK does not support removing a contact from a specific list.
  // The abandoned flow automation uses an exit condition (contact joins Completed list)
  // to stop sending, so explicit removal is not required.
  console.log(
    `[AutoSend] removeFromList is a no-op — ${email} removal from ${listId} handled by automation exit condition`
  );
}
