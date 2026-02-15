"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebhookSummary, DataAvailability, LifecycleSignal } from "@/types";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  webhookSummary: WebhookSummary | null;
  dataSources: string[];
  onContinue: (dataAvailability: DataAvailability) => void;
}

const DATA_RESOURCES = [
  { name: "Segment", url: "https://segment.com", desc: "Customer data platform — unify all your data sources" },
  { name: "Stripe", url: "https://stripe.com", desc: "Payment and subscription data" },
  { name: "PostHog", url: "https://posthog.com", desc: "Product analytics and session recordings" },
  { name: "Mixpanel", url: "https://mixpanel.com", desc: "Event-based product analytics" },
  { name: "Amplitude", url: "https://amplitude.com", desc: "Digital analytics and experimentation" },
  { name: "RudderStack", url: "https://rudderstack.com", desc: "Open-source customer data platform" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Usage: "bg-blue-50 text-blue-700 border-blue-200",
  Churn: "bg-red-50 text-red-700 border-red-200",
  Revenue: "bg-green-50 text-green-700 border-green-200",
  Engagement: "bg-purple-50 text-purple-700 border-purple-200",
};

function NoDataGuidance({ onContinue }: { onContinue: (da: DataAvailability) => void }) {
  return (
    <motion.div
      key="no-data-guidance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Data Collection: Getting Started
        </h2>
        <p className="text-slate-500">
          You haven&apos;t connected any data sources yet. That&apos;s okay —
          but data is the foundation of effective lifecycle marketing. Here&apos;s
          how to get started.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Why data matters
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Without behavioral data, all customers receive the same messaging.
          Even basic event tracking (signups, purchases, feature usage) enables
          targeted campaigns that convert 3-5x better than batch sends.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase text-slate-400">
          Recommended Tools
        </p>
        {DATA_RESOURCES.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="font-medium text-slate-800">{resource.name}</p>
            <p className="text-sm text-slate-500">{resource.desc}</p>
          </a>
        ))}
      </div>

      <Button size="lg" onClick={() => onContinue("none")}>
        Continue to Canvas
      </Button>

      <p className="text-center text-xs text-slate-400">
        You can still generate a lifecycle flow — we&apos;ll include data
        infrastructure recommendations in your summary.
      </p>
    </motion.div>
  );
}

const DATA_AVAILABILITY_OPTIONS: { label: string; description: string; value: DataAvailability; shortcut: string }[] = [
  { label: "Yes", description: "We already have all this data", value: "all", shortcut: "1" },
  { label: "Some", description: "We pull some of these", value: "some", shortcut: "2" },
  { label: "We have None", description: "", value: "none", shortcut: "3" },
];

function groupSignalsByCategory(signals: LifecycleSignal[]): Record<string, LifecycleSignal[]> {
  const grouped: Record<string, LifecycleSignal[]> = {};
  for (const s of signals) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  return grouped;
}

export function ScreenWebhookSummary({
  webhookSummary,
  dataSources,
  onContinue,
}: Props) {
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [dataAvailability, setDataAvailability] = useState<DataAvailability | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const hasNoData =
    dataSources.includes("None") ||
    dataSources.length === 0;

  const canSubmit = dataAvailability !== null;
  const handleEnter = useCallback(() => { if (canSubmit) onContinue(dataAvailability!); }, [canSubmit, onContinue, dataAvailability]);
  useEnterKey(handleEnter, canSubmit);

  // Number keys for data availability selection
  useEffect(() => {
    if (hasNoData || !webhookSummary) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "1") { e.preventDefault(); setDataAvailability("all"); }
      else if (e.key === "2") { e.preventDefault(); setDataAvailability("some"); }
      else if (e.key === "3") { e.preventDefault(); setDataAvailability("none"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasNoData, webhookSummary]);

  useEffect(() => {
    if (webhookSummary && !autoAdvance) {
      const timer = setTimeout(() => setAutoAdvance(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [webhookSummary, autoAdvance]);

  if (hasNoData) {
    return <NoDataGuidance onContinue={onContinue} />;
  }

  if (!webhookSummary) {
    return (
      <motion.div
        key="webhook-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6 pt-24"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-lg text-slate-600">Analyzing your data sources...</p>
      </motion.div>
    );
  }

  const signals = webhookSummary.signals || [];
  const groupedSignals = groupSignalsByCategory(signals);
  const hasWebhooksOrPolling = webhookSummary.webhooks.length > 0 || webhookSummary.polling.length > 0;

  return (
    <motion.div
      key="webhook-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Key Lifecycle Signals
        </h2>
        <p className="text-slate-500">{webhookSummary.summary}</p>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        {/* Data source pills */}
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">
            Data Sources
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {dataSources.map((src) => (
              <span
                key={src}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* Signals grouped by category */}
        {signals.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedSignals).map(([category, items]) => (
              <div key={category}>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    CATEGORY_COLORS[category] || "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {category}
                </span>
                <div className="mt-2 space-y-2">
                  {items.map((s, i) => (
                    <div key={i} className="rounded border border-slate-100 p-3">
                      <p className="font-medium text-slate-800">{s.signal}</p>
                      <p className="text-sm text-slate-500">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical details (collapsed) */}
        {hasWebhooksOrPolling && (
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              {showTechnical ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              Technical Details
            </button>

            {showTechnical && (
              <div className="mt-3 space-y-3">
                {webhookSummary.webhooks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Webhooks
                    </p>
                    {webhookSummary.webhooks.map((wh, i) => (
                      <div key={i} className="mt-2 rounded border border-slate-100 p-3">
                        <p className="font-medium text-slate-800">
                          {wh.source} — {wh.event}
                        </p>
                        <p className="text-sm text-slate-500">{wh.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {webhookSummary.polling.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Polling
                    </p>
                    {webhookSummary.polling.map((p, i) => (
                      <div key={i} className="mt-2 rounded border border-slate-100 p-3">
                        <p className="font-medium text-slate-800">
                          {p.source} — {p.frequency}
                        </p>
                        <p className="text-sm text-slate-500">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data availability question */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">
          Do you already have access to this data?
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DATA_AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDataAvailability(opt.value)}
              className={`relative rounded-lg border-2 p-4 text-center transition-all ${
                dataAvailability === opt.value
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-medium text-slate-400">
                {opt.shortcut}
              </span>
              <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
              {opt.description && (
                <p className="mt-1 text-xs text-slate-500">{opt.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        disabled={!canSubmit}
        onClick={() => canSubmit && onContinue(dataAvailability!)}
      >
        Continue
      </Button>
      <p className="text-center text-xs text-slate-400">
        {canSubmit
          ? <>Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue</>
          : "Use 1 / 2 / 3 to select"}
      </p>
    </motion.div>
  );
}
