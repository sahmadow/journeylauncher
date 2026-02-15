"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GeneratedFlow, ScrapedData, Analysis } from "@/types";
import { LifecycleCanvas } from "@/components/canvas/LifecycleCanvas";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  flow: GeneratedFlow | null;
  isLoading: boolean;
  scrapedData: ScrapedData | null;
  analysis: Analysis | null;
  onContinue: () => void;
}

export function ScreenCanvas({
  flow,
  isLoading,
  scrapedData,
  analysis,
  onContinue,
}: Props) {
  const canContinue = !isLoading && !!flow;
  const handleEnter = useCallback(() => { if (canContinue) onContinue(); }, [canContinue, onContinue]);
  useEnterKey(handleEnter, canContinue);
  if (isLoading || !flow) {
    return (
      <motion.div
        key="canvas-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6 pt-24"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-lg text-slate-600">
          Generating your customer lifecycle flow...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="canvas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full flex-col gap-6"
    >
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Your Customer Lifecycle Flow
        </h2>
        <p className="text-slate-500">
          Click on email nodes to preview the generated content
        </p>
      </div>

      <LifecycleCanvas
        flow={flow}
        brandColors={scrapedData?.colors || []}
        logoUrl={scrapedData?.logo_url || ""}
        brandName={scrapedData?.title || ""}
      />

      <div className="flex flex-col items-center gap-2 pb-8">
        <Button size="lg" onClick={onContinue}>
          View Summary
        </Button>
        <p className="text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue
        </p>
      </div>
    </motion.div>
  );
}
