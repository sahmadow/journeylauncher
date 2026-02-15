"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LifecycleStage } from "@/types";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  onSubmit: (gaps: LifecycleStage[]) => void;
  defaultGaps: LifecycleStage[];
}

const STAGES: { value: LifecycleStage; label: string; subtitle: string }[] = [
  {
    value: "Early Engagement",
    label: "Early Engagement",
    subtitle: "Welcome sequences, onboarding flows, activation emails",
  },
  {
    value: "Engagement",
    label: "Engagement",
    subtitle: "Feature adoption, usage tips, milestone celebrations",
  },
  {
    value: "Monetisation",
    label: "Monetisation",
    subtitle: "Trial conversions, upgrade nudges, pricing announcements",
  },
  {
    value: "Retention",
    label: "Retention",
    subtitle: "Win-back campaigns, re-engagement, churn prevention",
  },
];

export function ScreenLifecycleGaps({ onSubmit, defaultGaps }: Props) {
  const [selected, setSelected] = useState<LifecycleStage[]>(defaultGaps);
  const canSubmit = selected.length > 0;
  const handleEnter = useCallback(() => { if (canSubmit) onSubmit(selected); }, [canSubmit, onSubmit, selected]);
  useEnterKey(handleEnter, canSubmit);

  const toggle = (stage: LifecycleStage) => {
    setSelected((prev) =>
      prev.includes(stage)
        ? prev.filter((s) => s !== stage)
        : [...prev, stage]
    );
  };

  return (
    <motion.div
      key="lifecycle-gaps"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Which lifecycle stages need attention?
        </h2>
        <p className="text-slate-500">
          Select the areas you want to automate. All are selected by default.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {STAGES.map((stage) => (
          <div
            key={stage.value}
            className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer"
            onClick={() => toggle(stage.value)}
          >
            <Checkbox
              checked={selected.includes(stage.value)}
              onCheckedChange={() => toggle(stage.value)}
              id={stage.value}
            />
            <div>
              <Label htmlFor={stage.value} className="text-base font-medium cursor-pointer">
                {stage.label}
              </Label>
              <p className="text-sm text-slate-500">{stage.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => onSubmit(selected)}
        disabled={!canSubmit}
      >
        Continue
      </Button>
      {canSubmit && (
        <p className="text-center text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue
        </p>
      )}
    </motion.div>
  );
}
