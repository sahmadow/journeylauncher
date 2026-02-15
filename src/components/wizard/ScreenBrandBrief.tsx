"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEnterKey } from "@/hooks/useEnterKey";
import {
  Analysis,
  BusinessType,
  ScrapedData,
  ScoreValue,
  DataAvailability,
  LifecycleStage,
} from "@/types";

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  service: "Service",
};

const CLM_LABELS: Record<number, string> = {
  0: "Not yet",
  1: "Getting started",
  2: "Established",
};

const PERSONALISATION_LABELS: Record<number, string> = {
  0: "Not yet",
  1: "Sometimes",
  2: "Automated",
};

const DATA_AVAILABILITY_LABELS: Record<DataAvailability, string> = {
  all: "All available",
  some: "Partially available",
  none: "Not available",
};

interface Props {
  analysis: Analysis | null;
  scrapedData: ScrapedData | null;
  businessTypeOverride: BusinessType | null;
  onBusinessTypeChange: (type: BusinessType) => void;
  clmScore: ScoreValue | null;
  personalisationScore: ScoreValue | null;
  dataSources: string[];
  dataAvailability: DataAvailability | null;
  lifecycleGaps: LifecycleStage[];
  onGenerateFlow: () => void;
  isLoading: boolean;
}

export function ScreenBrandBrief({
  analysis,
  scrapedData,
  businessTypeOverride,
  onBusinessTypeChange,
  clmScore,
  personalisationScore,
  dataSources,
  dataAvailability,
  lifecycleGaps,
  onGenerateFlow,
  isLoading,
}: Props) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const handleEnter = useCallback(() => { if (!isLoading) onGenerateFlow(); }, [isLoading, onGenerateFlow]);
  useEnterKey(handleEnter, !isLoading);
  const activeType = businessTypeOverride ?? analysis?.business_type ?? "saas";
  const isOverridden = businessTypeOverride !== null;

  return (
    <motion.div
      key="brand-brief"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Brand Brief</h2>
        <p className="text-slate-500">
          Review your setup before generating the lifecycle flow.
        </p>
      </div>

      {/* Card 1: Brand Analysis */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium uppercase text-slate-400">
          Brand Analysis
        </p>

        <div className="flex items-center gap-4">
          {scrapedData?.logo_url && (
            <img
              src={scrapedData.logo_url}
              alt={`${scrapedData.title || "Brand"} logo`}
              className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {scrapedData?.title || "Your Brand"}
            </p>
            {scrapedData?.url && (
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{scrapedData.url}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Business type:</span>
            <span className="text-sm font-medium text-slate-700">
              {BUSINESS_TYPE_LABELS[activeType]}
            </span>
            {isOverridden && (
              <span className="text-xs text-amber-500">(edited)</span>
            )}
            <button
              type="button"
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Change
            </button>
          </div>
          {showTypeSelector && (
            <div className="mt-2 flex gap-2">
              {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onBusinessTypeChange(type);
                      setShowTypeSelector(false);
                    }}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      activeType === type
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {BUSINESS_TYPE_LABELS[type]}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {analysis?.usp && (
          <p className="text-sm text-slate-600 line-clamp-2">{analysis.usp}</p>
        )}

        {analysis?.tone && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Tone:</span>
            <span className="text-sm capitalize text-slate-700">
              {analysis.tone}
            </span>
          </div>
        )}

        {scrapedData?.colors && scrapedData.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Colors:</span>
            <div className="flex gap-1.5">
              {scrapedData.colors.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-slate-200"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Your Setup */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium uppercase text-slate-400">
          Your Setup
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">CLM maturity:</span>
            <p className="font-medium text-slate-700">
              {clmScore !== null ? CLM_LABELS[clmScore] : "—"}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Personalisation:</span>
            <p className="font-medium text-slate-700">
              {personalisationScore !== null
                ? PERSONALISATION_LABELS[personalisationScore]
                : "—"}
            </p>
          </div>
        </div>

        {dataSources.length > 0 && !dataSources.includes("None") && (
          <div>
            <span className="text-sm text-slate-500">Data sources:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {dataSources.map((src) => (
                <span
                  key={src}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}

        {dataAvailability && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Data availability:</span>
            <span className="font-medium text-slate-700">
              {DATA_AVAILABILITY_LABELS[dataAvailability]}
            </span>
          </div>
        )}

        {lifecycleGaps.length > 0 && (
          <div>
            <span className="text-sm text-slate-500">Focus areas:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {lifecycleGaps.map((gap) => (
                <span
                  key={gap}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button size="lg" onClick={onGenerateFlow} disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </span>
        ) : (
          "Generate Lifecycle Flow"
        )}
      </Button>
      {!isLoading && (
        <p className="text-center text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to generate
        </p>
      )}
    </motion.div>
  );
}
