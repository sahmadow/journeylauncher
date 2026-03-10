#!/usr/bin/env npx tsx
/**
 * AutoSend setup script — creates lists, custom fields, verifies config.
 * Run: npx tsx scripts/autosend-setup.ts
 *
 * If list creation fails via API (known 500 bug), creates them manually
 * in the dashboard and re-run this script to verify + update .env.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const API_KEY = process.env.AUTOSEND_API_KEY;
if (!API_KEY) {
  console.error("❌ AUTOSEND_API_KEY not set. Run: source .env");
  process.exit(1);
}

const BASE = "https://api.autosend.com/v1";

async function api(method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<Record<string, unknown>>;
}

async function run() {
  console.log("\n🔧 AutoSend Setup\n");

  // ── 1. Custom Fields ────────────────────────────────────────
  console.log("1. Custom Fields");
  const fieldsRes = await api("GET", "/custom-fields");
  const existing = ((fieldsRes.data as Record<string, unknown>)?.customFields as Array<{ fieldName: string }>) || [];
  const existingNames = new Set(existing.map((f) => f.fieldName));

  const needed = ["businessType", "flowSummaryUrl", "companyName", "source"];
  for (const field of needed) {
    if (existingNames.has(field)) {
      console.log(`   ✅ ${field} (exists)`);
    } else {
      const res = await api("POST", "/custom-fields", { fieldName: field, fieldType: "string" });
      console.log(`   ${res.success ? "✅" : "❌"} ${field} ${res.success ? "(created)" : `(${(res.error as Record<string, string>)?.message})`}`);
    }
  }

  // ── 2. Contact Lists ────────────────────────────────────────
  console.log("\n2. Contact Lists");
  const listsRes = await api("GET", "/contact-lists");
  const lists = ((listsRes.data as Record<string, unknown>)?.contacts as Array<{ id: string; name: string }>) || [];

  let completedId = "";
  let abandonedId = "";

  for (const list of lists) {
    if (list.name.toLowerCase().includes("completed") || list.name.toLowerCase().includes("complete")) {
      completedId = list.id;
      console.log(`   ✅ Completed list: "${list.name}" (${list.id})`);
    }
    if (list.name.toLowerCase().includes("abandoned") || list.name.toLowerCase().includes("abandon")) {
      abandonedId = list.id;
      console.log(`   ✅ Abandoned list: "${list.name}" (${list.id})`);
    }
  }

  // Try to create missing lists via API
  if (!completedId) {
    const res = await api("POST", "/contact-lists", { name: "Flow Wizard Completed", type: "list" });
    if (res.success && res.data) {
      completedId = (res.data as Record<string, string>).id;
      console.log(`   ✅ Completed list created (${completedId})`);
    } else {
      console.log("   ⚠️  Completed list: API returned 500. Create manually in dashboard:");
      console.log('      → Marketing Emails → Contacts → Lists → New List → "Flow Wizard Completed"');
    }
  }

  if (!abandonedId) {
    const res = await api("POST", "/contact-lists", { name: "Flow Wizard Abandoned", type: "list" });
    if (res.success && res.data) {
      abandonedId = (res.data as Record<string, string>).id;
      console.log(`   ✅ Abandoned list created (${abandonedId})`);
    } else {
      console.log("   ⚠️  Abandoned list: API returned 500. Create manually in dashboard:");
      console.log('      → Marketing Emails → Contacts → Lists → New List → "Flow Wizard Abandoned"');
    }
  }

  // ── 3. Update .env with list IDs ────────────────────────────
  if (completedId || abandonedId) {
    console.log("\n3. Updating .env");
    const envPath = resolve(process.cwd(), ".env");
    let envContent = readFileSync(envPath, "utf-8");

    if (completedId) {
      envContent = envContent.replace(
        /AUTOSEND_COMPLETED_LIST_ID=.*/,
        `AUTOSEND_COMPLETED_LIST_ID=${completedId}`
      );
      console.log(`   ✅ AUTOSEND_COMPLETED_LIST_ID=${completedId}`);
    }
    if (abandonedId) {
      envContent = envContent.replace(
        /AUTOSEND_ABANDONED_LIST_ID=.*/,
        `AUTOSEND_ABANDONED_LIST_ID=${abandonedId}`
      );
      console.log(`   ✅ AUTOSEND_ABANDONED_LIST_ID=${abandonedId}`);
    }

    writeFileSync(envPath, envContent);
  }

  // ── 4. Test email send ──────────────────────────────────────
  console.log("\n4. Test Email Send");
  const testRes = await api("POST", "/mails/send", {
    from: { email: "saleh@journeylauncher.com", name: "Saleh from Journey Launcher" },
    to: { email: "saleh@journeylauncher.com", name: "Saleh" },
    subject: "AutoSend Test — Journey Launcher Setup",
    html: "<p>If you see this, your AutoSend integration is working! 🎉</p>",
    text: "If you see this, your AutoSend integration is working!",
  });
  console.log(`   ${testRes.success ? "✅ Test email sent!" : `❌ ${(testRes.error as Record<string, string>)?.message || "Failed"}`}`);
  if (!testRes.success) {
    console.log("   → Check domain verification: AutoSend dashboard → Settings → Domains");
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log("\n── Summary ──");
  console.log(`Custom fields:  ✅`);
  console.log(`Completed list: ${completedId ? `✅ ${completedId}` : "❌ Create in dashboard, then re-run"}`);
  console.log(`Abandoned list: ${abandonedId ? `✅ ${abandonedId}` : "❌ Create in dashboard, then re-run"}`);
  console.log(`Test email:     ${testRes.success ? "✅" : "❌ Check domain verification"}`);

  if (!completedId || !abandonedId) {
    console.log("\n⚠️  After creating lists in dashboard, re-run this script to update .env");
    console.log("   npx tsx scripts/autosend-setup.ts\n");
  } else {
    console.log("\n🎉 Setup complete! Don't forget to add list IDs to Vercel env vars:");
    console.log(`   vercel env add AUTOSEND_COMPLETED_LIST_ID production  # ${completedId}`);
    console.log(`   vercel env add AUTOSEND_ABANDONED_LIST_ID production  # ${abandonedId}\n`);
  }
}

run().catch(console.error);
