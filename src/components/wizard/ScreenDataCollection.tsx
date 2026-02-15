"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  onSubmit: (sources: string[], other: string) => void;
  defaultSources: string[];
}

const DATA_SOURCES = [
  "Stripe",
  "Segment / Mixpanel / Amplitude",
  "App database",
  "Shopify / WooCommerce",
  "Google Analytics / PostHog",
  "None",
];

export function ScreenDataCollection({ onSubmit, defaultSources }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSources);
  const [other, setOther] = useState("");
  const [showOther, setShowOther] = useState(false);
  const canSubmit = selected.length > 0;
  const handleEnter = useCallback(() => { if (canSubmit) onSubmit(selected, other); }, [canSubmit, onSubmit, selected, other]);
  useEnterKey(handleEnter, canSubmit);

  const toggle = (src: string) => {
    if (src === "None") {
      setSelected(["None"]);
      return;
    }
    setSelected((prev) => {
      const filtered = prev.filter((s) => s !== "None");
      return filtered.includes(src)
        ? filtered.filter((s) => s !== src)
        : [...filtered, src];
    });
  };

  return (
    <motion.div
      key="data-collection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Do you collect these data signals?
        </h2>
        <p className="text-slate-500">
          Key lifecycle signals help us personalise your CRM flow. Select the data sources you currently use.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DATA_SOURCES.map((src) => (
          <div
            key={src}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer"
            onClick={() => toggle(src)}
          >
            <Checkbox
              checked={selected.includes(src)}
              onCheckedChange={() => toggle(src)}
              id={src}
            />
            <Label htmlFor={src} className="cursor-pointer">
              {src}
            </Label>
          </div>
        ))}

        <div
          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer"
          onClick={() => setShowOther(!showOther)}
        >
          <Checkbox
            checked={showOther}
            onCheckedChange={() => setShowOther(!showOther)}
            id="other"
          />
          <Label htmlFor="other" className="cursor-pointer">
            Other
          </Label>
        </div>

        {showOther && (
          <Input
            placeholder="Describe your data source..."
            value={other}
            onChange={(e) => setOther(e.target.value)}
            className="ml-8"
            autoFocus
          />
        )}
      </div>

      <Button
        size="lg"
        onClick={() => onSubmit(selected, other)}
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
