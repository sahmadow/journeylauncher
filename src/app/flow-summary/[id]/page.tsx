import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateRecommendations, Recommendation } from "@/lib/recommendations";
import {
  GeneratedFlow,
  FlowStage,
  FlowNode,
  ScrapedData,
  WizardState,
  INITIAL_WIZARD_STATE,
  LifecycleStage,
  DataAvailability,
  ScoreValue,
  GeneratedEmail,
} from "@/types";
import { StageEmailPreview } from "@/components/flow-summary/StageEmailPreview";
import type { Metadata } from "next";

// Revalidate every hour — not real-time, but fresh enough
export const revalidate = 3600;

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission || submission.isDeleted) {
    return { title: "Flow Not Found — Journey Launcher" };
  }

  const scraped = submission.scrapedData as ScrapedData | null;
  const brandName = scraped?.title || "Your Brand";

  return {
    title: `Lifecycle Flow Summary — ${brandName}`,
    description: `CRM lifecycle flow summary generated for ${brandName} by Journey Launcher.`,
    robots: { index: false, follow: false },
  };
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const NODE_STYLES: Record<string, { border: string; badge: string; label: string }> = {
  trigger: { border: "border-l-green-500", badge: "bg-green-100 text-green-800", label: "Trigger" },
  email: { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-800", label: "Email" },
  wait: { border: "border-l-slate-400 border-dashed", badge: "bg-slate-100 text-slate-600", label: "Wait" },
  condition: { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-800", label: "Condition" },
  push: { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-800", label: "Push" },
  in_app: { border: "border-l-teal-500", badge: "bg-teal-100 text-teal-800", label: "In-App" },
};

const CATEGORY_ORDER = ["Strategy", "Data", "Targeting", "Campaigns", "Reporting"] as const;

function NodeCard({ node }: { node: FlowNode }) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.trigger;

  return (
    <div className={`ml-5 border-l-3 ${style.border} py-3 pl-4`}>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
        {style.label}
      </span>
      {node.type === "trigger" && (
        <div className="mt-1">
          <p className="font-semibold text-slate-900">{node.label || "Trigger"}</p>
          {node.description && <p className="mt-0.5 text-sm text-slate-500">{node.description}</p>}
        </div>
      )}
      {node.type === "email" && (
        <div className="mt-1">
          <p className="font-semibold text-slate-900">{node.subject || node.label || "Email"}</p>
          {node.preview_text && <p className="mt-0.5 text-sm italic text-slate-500">{node.preview_text}</p>}
          {node.cta_text && (
            <span className="mt-1.5 inline-block rounded-md bg-blue-500 px-3 py-1 text-xs text-white">
              {node.cta_text}
            </span>
          )}
        </div>
      )}
      {node.type === "wait" && (
        <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {node.duration || "Wait"}
        </span>
      )}
      {node.type === "condition" && (
        <div className="mt-1">
          <p className="font-semibold text-slate-900">{node.condition || node.label || "Condition"}</p>
          <div className="mt-1.5 flex gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800">
              Yes: {node.yes_label || "Continue"}
            </span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-800">
              No: {node.no_label || "Exit"}
            </span>
          </div>
        </div>
      )}
      {node.type === "push" && (
        <div className="mt-1">
          <p className="font-semibold text-slate-900">{node.label || "Push Notification"}</p>
          {node.description && <p className="mt-0.5 text-sm text-slate-500">{node.description}</p>}
        </div>
      )}
      {node.type === "in_app" && (
        <div className="mt-1">
          <p className="font-semibold text-slate-900">{node.label || "In-App Placement"}</p>
          {node.description && <p className="mt-0.5 text-sm text-slate-500">{node.description}</p>}
          {node.cta_text && (
            <span className="mt-1.5 inline-block rounded-md bg-teal-500 px-3 py-1 text-xs text-white">
              {node.cta_text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StageSection({ stage, generatedEmail }: { stage: FlowStage; generatedEmail?: GeneratedEmail }) {
  const emailCount = stage.nodes.filter((n) => n.type === "email").length;

  return (
    <details className="group" open>
      <summary className="cursor-pointer text-lg font-semibold text-slate-900">
        {stage.stage}
        <span className="ml-2 text-sm font-normal text-slate-400">({emailCount} emails)</span>
        {generatedEmail && (
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Preview
          </span>
        )}
      </summary>
      {stage.description && <p className="mt-1 text-sm text-slate-500">{stage.description}</p>}
      <div className="mt-3 space-y-0">
        {stage.nodes.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
      {generatedEmail?.html && (
        <StageEmailPreview
          html={generatedEmail.html}
          subject={generatedEmail.subject}
          stageName={stage.stage}
        />
      )}
    </details>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-slate-900">{rec.title}</h4>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[rec.priority]}`}>
          {rec.priority}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{rec.description}</p>
      {rec.actionItems.length > 0 && (
        <ul className="mt-2 space-y-1">
          {rec.actionItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function FlowSummaryPage({ params }: PageProps) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission || submission.isDeleted) {
    notFound();
  }

  const flow = submission.generatedFlow as GeneratedFlow | null;
  const scraped = submission.scrapedData as ScrapedData | null;
  const generatedEmails = (submission.generatedEmails as GeneratedEmail[] | null) || [];
  const brandName = scraped?.title || "Your Brand";
  const accentColor = scraped?.colors?.[0] || "#1e293b";
  const logoUrl = scraped?.logo_url || null;

  // Reconstruct minimal WizardState for recommendation generation
  const wizardState: WizardState = {
    ...INITIAL_WIZARD_STATE,
    businessDesc: submission.businessDesc || "",
    clmScore: (submission.clmScore as ScoreValue) ?? 0,
    personalisationScore: (submission.personalisationScore as ScoreValue) ?? 0,
    dataAvailability: (submission.dataAvailability as DataAvailability) || "none",
    lifecycleGaps: (submission.lifecycleGaps as LifecycleStage[]) || [],
    dataSources: (submission.dataSources as string[]) || [],
    dataSourceOther: submission.dataSourceOther || "",
    generatedFlow: flow,
    scrapedData: scraped,
    landingPageUrl: submission.landingPageUrl || "",
  };

  const recommendations = generateRecommendations(wizardState);
  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = recommendations.filter((r) => r.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<string, Recommendation[]>
  );

  const totalEmails = flow?.stages.reduce(
    (sum, s) => sum + s.nodes.filter((n) => n.type === "email").length,
    0
  ) || 0;
  const totalStages = flow?.stages.length || 0;
  const totalDataSources = wizardState.dataSources.filter((s) => s !== "None").length;

  const clmLabels = ["No CLM", "Basic CLM", "Advanced CLM"];
  const persLabels = ["No Personalisation", "Basic Personalisation", "Advanced Personalisation"];
  const dataLabels: Record<string, string> = { all: "Full Access", some: "Partial Access", none: "No Data" };

  const createdDate = submission.createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Header */}
        <div
          className="mb-8 rounded-xl px-8 py-8 text-white"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{brandName}</h1>
              <p className="mt-1 text-sm opacity-85">Lifecycle Flow Summary</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalEmails}</p>
            <p className="text-sm text-slate-500">Total Emails</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalStages}</p>
            <p className="text-sm text-slate-500">Lifecycle Stages</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalDataSources}</p>
            <p className="text-sm text-slate-500">Data Sources</p>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Business Type</p>
              <p className="font-semibold text-slate-900 capitalize">
                {wizardState.businessTypeOverride || wizardState.analysis?.business_type || "saas"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">CLM Maturity</p>
              <p className="font-semibold text-slate-900">{clmLabels[wizardState.clmScore ?? 0]}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Personalisation</p>
              <p className="font-semibold text-slate-900">{persLabels[wizardState.personalisationScore ?? 0]}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Data Availability</p>
              <p className="font-semibold text-slate-900">
                {dataLabels[wizardState.dataAvailability ?? "none"]}
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        {totalDataSources > 0 && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Data Sources</h2>
            <div className="flex flex-wrap gap-2">
              {wizardState.dataSources
                .filter((s) => s !== "None")
                .map((source) => (
                  <span
                    key={source}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {source}
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Flow Stages */}
        {flow && flow.stages.length > 0 && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Lifecycle Flow</h2>
            <div className="space-y-6">
              {flow.stages.map((stage) => {
                const stageEmail = generatedEmails.find(
                  (e) => e.stage_name === stage.stage && e.status === "ready"
                );
                return (
                  <StageSection
                    key={stage.stage}
                    stage={stage}
                    generatedEmail={stageEmail}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {Object.keys(grouped).length > 0 && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Recommendations</h2>
            <div className="space-y-6">
              {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => (
                <div key={cat}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {cat} ({grouped[cat].length})
                  </h3>
                  <div className="space-y-3">
                    {grouped[cat].map((rec, i) => (
                      <RecommendationCard key={`${cat}-${i}`} rec={rec} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mb-8 text-center">
          <a
            href="https://calendly.com/saleh-journeylauncher/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Book a Free Setup Call
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Generated on {createdDate} by{" "}
          <a href="https://www.journeylauncher.com" className="underline hover:text-slate-600">
            Journey Launcher
          </a>
        </p>
      </div>
    </div>
  );
}
