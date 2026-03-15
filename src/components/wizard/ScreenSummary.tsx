"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download, ArrowRight } from "lucide-react";
import { WizardState, GeneratedEmail } from "@/types";
import { generateRecommendations, Recommendation } from "@/lib/recommendations";
// canvas-confetti & JSZip dynamically imported to avoid SSR issues

interface Props {
  state: WizardState;
  onSave: () => void;
  isLoading: boolean;
}

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const CATEGORY_ORDER = ["Strategy", "Data", "Targeting", "Campaigns", "Reporting"] as const;

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div
        className="flex cursor-pointer items-start justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900">{rec.title}</h4>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[rec.priority]}`}
            >
              {rec.priority}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{rec.description}</p>
        </div>
        {expanded ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        )}
      </div>

      {expanded && rec.actionItems.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">
            Action Items
          </p>
          <ul className="space-y-1.5">
            {rec.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                  readOnly
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ScreenSummary({ state, onSave, isLoading }: Props) {
  const totalEmails =
    state.generatedFlow?.stages.reduce(
      (sum, stage) => sum + stage.nodes.filter((n) => n.type === "email").length,
      0
    ) || 0;

  const totalStages = state.generatedFlow?.stages.length || 0;
  const totalDataSources = state.dataSources.filter((s) => s !== "None").length;
  const recommendations = generateRecommendations(state);

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = recommendations.filter((r) => r.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<string, Recommendation[]>
  );

  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(Object.keys(grouped))
  );

  const handleDownload = async () => {
    const brandName = state.scrapedData?.title || "Your Brand";
    const logoUrl = state.scrapedData?.logo_url || "";
    const accentColor = state.scrapedData?.colors?.[0] || "#1e293b";
    const businessType = state.businessTypeOverride || state.analysis?.business_type || "saas";
    const clmLabels = ["No CLM", "Basic CLM", "Advanced CLM"];
    const persLabels = ["No Personalisation", "Basic Personalisation", "Advanced Personalisation"];
    const dataLabels: Record<string, string> = { all: "Full Access", some: "Partial Access", none: "No Data" };

    const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const stagesHtml = state.generatedFlow?.stages.map((stage) => {
      const emailCount = stage.nodes.filter((n) => n.type === "email").length;
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escHtml(stage.stage)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${emailCount} emails</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${escHtml(stage.description || "")}</td></tr>`;
    }).join("") || "";

    const priorityColors: Record<string, string> = { high: "#dc2626", medium: "#d97706", low: "#64748b" };

    // Build recommendation HTML with checkbox action items
    const recsHtml = CATEGORY_ORDER
      .filter((cat) => grouped[cat])
      .map((cat) => {
        const items = grouped[cat]
          .map((rec) => {
            const actionHtml = rec.actionItems.length > 0
              ? `<div style="margin:8px 0 0;padding-left:4px;">${rec.actionItems.map((a) => `<label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;margin-bottom:6px;color:#475569;font-size:13px;"><input type="checkbox" style="margin-top:3px;"><span>${escHtml(a)}</span></label>`).join("")}</div>`
              : "";
            return `<div style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <strong style="color:#0f172a;">${escHtml(rec.title)}</strong>
                <span style="background:${priorityColors[rec.priority] || "#64748b"};color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;">${rec.priority}</span>
              </div>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">${escHtml(rec.description)}</p>
              ${actionHtml}
            </div>`;
          })
          .join("");
        return `<details open><summary>${escHtml(cat)} (${grouped[cat].length})</summary>${items}</details>`;
      })
      .join("");

    const dataSourcePills = state.dataSources
      .filter((s) => s !== "None")
      .map((s) => `<span style="display:inline-block;background:#f1f5f9;border-radius:12px;padding:4px 12px;font-size:13px;margin:2px 4px 2px 0;">${escHtml(s)}</span>`)
      .join("");

    // Build lifecycle flow detail HTML
    const nodeTypeStyles: Record<string, { border: string; badge: string; badgeLabel: string }> = {
      trigger: { border: "#22c55e", badge: "background:#dcfce7;color:#166534;", badgeLabel: "Trigger" },
      email: { border: "#3b82f6", badge: "background:#dbeafe;color:#1e40af;", badgeLabel: "Email" },
      wait: { border: "#94a3b8", badge: "background:#f1f5f9;color:#475569;", badgeLabel: "Wait" },
      condition: { border: "#f59e0b", badge: "background:#fef3c7;color:#92400e;", badgeLabel: "Condition" },
      push: { border: "#a855f7", badge: "background:#f3e8ff;color:#6b21a8;", badgeLabel: "Push" },
      in_app: { border: "#14b8a6", badge: "background:#ccfbf1;color:#115e59;", badgeLabel: "In-App" },
    };

    const lifecycleFlowHtml = state.generatedFlow?.stages.map((stage) => {
      const nodesHtml = stage.nodes.map((node, idx) => {
        const style = nodeTypeStyles[node.type] || nodeTypeStyles.trigger;
        const isLast = idx === stage.nodes.length - 1;
        const borderStyle = node.type === "wait" ? "border-left:2px dashed #94a3b8;" : `border-left:3px solid ${style.border};`;

        let content = "";
        if (node.type === "trigger") {
          content = `<div style="font-weight:600;color:#0f172a;">${escHtml(node.label || "Trigger")}</div>${node.description ? `<div style="color:#64748b;font-size:13px;margin-top:2px;">${escHtml(node.description)}</div>` : ""}`;
        } else if (node.type === "email") {
          content = `<div style="font-weight:600;color:#0f172a;">${escHtml(node.subject || node.label || "Email")}</div>${node.preview_text ? `<div style="color:#64748b;font-size:13px;font-style:italic;margin-top:2px;">${escHtml(node.preview_text)}</div>` : ""}${node.cta_text ? `<div style="margin-top:6px;"><span style="background:#3b82f6;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;">${escHtml(node.cta_text)}</span></div>` : ""}`;
        } else if (node.type === "wait") {
          content = `<div><span style="background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:12px;font-size:13px;font-weight:500;">${escHtml(node.duration || "Wait")}</span></div>`;
        } else if (node.type === "condition") {
          content = `<div style="font-weight:600;color:#0f172a;">${escHtml(node.condition || node.label || "Condition")}</div><div style="margin-top:6px;display:flex;gap:8px;"><span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:10px;font-size:12px;">Yes: ${escHtml(node.yes_label || "Continue")}</span><span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:10px;font-size:12px;">No: ${escHtml(node.no_label || "Exit")}</span></div>`;
        } else if (node.type === "push") {
          content = `<div style="font-weight:600;color:#0f172a;">${escHtml(node.label || "Push Notification")}</div>${node.description ? `<div style="color:#64748b;font-size:13px;margin-top:2px;">${escHtml(node.description)}</div>` : ""}`;
        } else if (node.type === "in_app") {
          content = `<div style="font-weight:600;color:#0f172a;">${escHtml(node.label || "In-App Placement")}</div>${node.description ? `<div style="color:#64748b;font-size:13px;margin-top:2px;">${escHtml(node.description)}</div>` : ""}${node.cta_text ? `<div style="margin-top:6px;"><span style="background:#14b8a6;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;">${escHtml(node.cta_text)}</span></div>` : ""}`;
        }

        return `<div class="node" style="${borderStyle}padding:12px 16px;margin-left:20px;${isLast ? "" : "margin-bottom:0;"}position:relative;">
          <span class="node-badge" style="${style.badge}font-size:11px;padding:2px 8px;border-radius:10px;margin-bottom:6px;display:inline-block;">${style.badgeLabel}</span>
          ${content}
        </div>`;
      }).join("");

      return `<details><summary>${escHtml(stage.stage)}</summary><p style="color:#64748b;font-size:13px;margin:4px 0 12px;">${escHtml(stage.description || "")}</p>${nodesHtml}</details>`;
    }).join("") || "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lifecycle Flow Summary — ${escHtml(brandName)}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;color:#0f172a;background:#f8fafc;}
  .container{max-width:720px;margin:0 auto;padding:40px 24px;}
  .header{background:${accentColor};color:#fff;padding:32px 24px;border-radius:12px;margin-bottom:32px;}
  .header h1{margin:0 0 8px;font-size:24px;}
  .header p{margin:0;opacity:0.85;font-size:14px;}
  .header img{flex-shrink:0;}
  .section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .metric{background:#f8fafc;border-radius:8px;padding:12px 16px;}
  .metric-label{font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:4px;}
  .metric-value{font-size:16px;font-weight:600;}
  table{width:100%;border-collapse:collapse;}
  th{text-align:left;padding:8px 12px;border-bottom:2px solid #e2e8f0;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;}
  details{margin-bottom:16px;}
  summary{cursor:pointer;font-size:18px;font-weight:600;padding:8px 0;color:#0f172a;}
  summary::-webkit-details-marker{color:#64748b;}
  .node{position:relative;padding:12px 16px;margin-left:20px;border-left:2px solid #e2e8f0;}
  .node-badge{font-size:11px;padding:2px 8px;border-radius:10px;}
  @media print{body{background:#fff;}.container{padding:20px;}details{display:block;}details>summary{display:block;}details[open]>*{display:block;}}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    ${logoUrl ? `<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;"><img src="${escHtml(logoUrl)}" alt="${escHtml(brandName)} logo" style="height:48px;width:48px;border-radius:10px;object-fit:contain;background:#fff;padding:4px;" onerror="this.style.display='none'"><h1 style="margin:0;font-size:24px;">${escHtml(brandName)}</h1></div>` : `<h1>${escHtml(brandName)}</h1>`}
    <p style="margin:0;opacity:0.85;font-size:14px;">Lifecycle Flow Summary${state.landingPageUrl ? ` — ${escHtml(state.landingPageUrl)}` : ""}</p>
  </div>

  <div class="section">
    <details open><summary>Overview</summary>
    <div class="grid">
      <div class="metric"><div class="metric-label">Business Type</div><div class="metric-value">${escHtml(businessType)}</div></div>
      <div class="metric"><div class="metric-label">CLM Maturity</div><div class="metric-value">${clmLabels[state.clmScore ?? 0]}</div></div>
      <div class="metric"><div class="metric-label">Personalisation</div><div class="metric-value">${persLabels[state.personalisationScore ?? 0]}</div></div>
      <div class="metric"><div class="metric-label">Data Availability</div><div class="metric-value">${dataLabels[state.dataAvailability ?? "none"]}</div></div>
    </div>
    </details>
  </div>

  ${dataSourcePills ? `<div class="section"><details open><summary>Data Sources</summary><div>${dataSourcePills}</div></details></div>` : ""}

  ${stagesHtml ? `<div class="section"><details open><summary>Lifecycle Stages</summary><table><thead><tr><th>Stage</th><th>Emails</th><th>Description</th></tr></thead><tbody>${stagesHtml}</tbody></table></details></div>` : ""}

  ${lifecycleFlowHtml ? `<div class="section"><details><summary>Lifecycle Flow Detail</summary>${lifecycleFlowHtml}</details></div>` : ""}

  ${recsHtml ? `<div class="section"><details open><summary>Recommendations</summary>${recsHtml}</details></div>` : ""}

  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:32px;">Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
</div>
</body>
</html>`;

    const generatedEmails: GeneratedEmail[] =
      state.emailGenState?.generated_emails?.filter((e) => e.status === "ready") || [];

    try {
      if (generatedEmails.length > 0) {
        // ZIP download with email HTMLs
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        zip.file("flow-summary.html", html);

        const emailsFolder = zip.folder("emails");
        generatedEmails.forEach((email, i) => {
          const slug = email.stage_name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const filename = `${String(i + 1).padStart(2, "0")}-${slug}.html`;
          emailsFolder?.file(filename, email.html);
        });

        // Brand guidelines JSON
        if (state.emailGenState?.brand_config) {
          const assetsFolder = zip.folder("assets");
          assetsFolder?.file(
            "brand-guidelines.json",
            JSON.stringify(state.emailGenState.brand_config, null, 2)
          );
        }

        // README
        zip.file(
          "README.txt",
          `LIFECYCLE FLOW EXPORT
====================
Generated by Journey Launcher (journeylauncher.com)
Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}

CONTENTS
--------
- flow-summary.html     Full lifecycle flow summary report
- emails/               One branded HTML email per lifecycle stage
- assets/               Brand configuration (JSON)

IMPORTING INTO YOUR ESP
-----------------------
1. Open each HTML file in the emails/ folder
2. Copy the full HTML source
3. Paste into your ESP's HTML email editor (Braze, Klaviyo, Iterable, Mailchimp, etc.)
4. Replace personalization tokens:
   - {{first_name}}      → your ESP's first name merge tag
   - {{company_name}}    → your ESP's company merge tag
   - {{unsubscribe_url}} → your ESP's unsubscribe link

NOTES
-----
- Emails use table-based layout for maximum ESP compatibility
- All styles are inline — no external CSS dependencies
- Max width: 600px, responsive on mobile
- Test in Gmail, Outlook, and Apple Mail before sending

Questions? Book a setup call: https://calendly.com/saleh-journeylauncher/30min
`
        );

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lifecycle-flow-export.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Single HTML download (no generated emails)
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lifecycle-flow-summary.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[Download] Failed:", err);
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const confettiFired = useRef(false);

  useEffect(() => {
    onSave();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire confetti on mount (once) — dynamic import to avoid SSR issues
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 80, spread: 70, angle: 60, origin: { x: 0, y: 0.6 }, colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"] });
      confetti({ particleCount: 80, spread: 70, angle: 120, origin: { x: 1, y: 0.6 }, colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"] });
      timers.push(setTimeout(() => {
        confetti({ particleCount: 40, spread: 90, origin: { x: 0.3, y: 0.5 } });
        confetti({ particleCount: 40, spread: 90, origin: { x: 0.7, y: 0.5 } });
      }, 300));
      timers.push(setTimeout(() => {
        confetti({ particleCount: 30, spread: 120, origin: { x: 0.5, y: 0.4 }, gravity: 0.8 });
      }, 600));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-8 pt-16"
    >
      {/* Header + Logo */}
      <div className="text-center">
        {state.scrapedData?.logo_url && (
          <img
            src={state.scrapedData.logo_url}
            alt={`${state.scrapedData.title || "Brand"} logo`}
            className="mx-auto mb-4 h-14 w-14 rounded-xl object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <h2 className="mb-2 text-3xl font-bold text-slate-900">
          Your Flow is Ready!
        </h2>
      </div>

      {/* Sales pitch + CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-slate-200 bg-white p-6 text-center"
      >
        <p className="mb-4 text-slate-700">
          At JourneyLauncher we help marketing teams build CRM agents that can orchestrate and scale your lifecycle campaigns. Book a call to learn more.
        </p>
        <a
          href="https://calendly.com/saleh-journeylauncher/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-glow group inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Book Setup Call</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Emails" value={totalEmails} />
        <StatCard label="Lifecycle Stages" value={totalStages} />
        <StatCard label="Data Sources" value={totalDataSources} />
      </div>

      {/* Stages breakdown */}
      {state.generatedFlow && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="mb-3 text-xs font-medium uppercase text-slate-400">
            Stages Configured
          </p>
          <div className="space-y-2">
            {state.generatedFlow.stages.map((stage, i) => {
              const name = stage.stage || stage.name || stage.stage_name || `Stage ${i + 1}`;
              return (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-slate-700">{name}</span>
                  <span className="text-sm text-slate-500">
                    {stage.nodes.filter((n) => n.type === "email").length} emails
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {Object.keys(grouped).length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Recommendations
          </h3>
          <div className="space-y-4">
            {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => (
              <div key={cat}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="mb-2 flex w-full items-center gap-2 text-left"
                >
                  {openCategories.has(cat) ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                    {cat}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({grouped[cat].length})
                  </span>
                </button>
                {openCategories.has(cat) && (
                  <div className="space-y-3 pl-6">
                    {grouped[cat].map((rec, i) => (
                      <RecommendationCard key={`${cat}-${i}`} rec={rec} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTAs */}
      <div className="flex flex-col gap-3">
        <a
          href="https://calendly.com/saleh-journeylauncher/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-glow group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-8 text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Book Setup Call</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
        <Button variant="outline" size="lg" className="w-full" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {state.emailGenState?.generated_emails?.some((e) => e.status === "ready")
            ? "Download Flow + Emails (ZIP)"
            : "Download Flow Summary"}
        </Button>
      </div>

      {isLoading && (
        <p className="text-center text-sm text-slate-400">
          Saving your automation...
        </p>
      )}

      {state.error && (
        <p className="text-center text-sm text-red-500">{state.error}</p>
      )}
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
