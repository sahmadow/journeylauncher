"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreValue } from "@/types";

interface Props {
  onSubmit: (clm: ScoreValue, personalisation: ScoreValue) => void;
  defaultClm: ScoreValue | null;
  defaultPersonalisation: ScoreValue | null;
  onBack: () => void;
}

interface Option {
  label: string;
  description: string;
  value: ScoreValue;
  shortcut: string;
}

const CLM_OPTIONS: Option[] = [
  { label: "Yes", description: "We segment into lifecycle stages", value: 2, shortcut: "1" },
  { label: "A little", description: "We do 1-2 stages but not all", value: 1, shortcut: "2" },
  { label: "No", description: "Not yet or unsure how to start", value: 0, shortcut: "3" },
];

const PERSONALISATION_OPTIONS: Option[] = [
  { label: "Yes", description: "We build automated communication tailored to user profiles", value: 2, shortcut: "1" },
  { label: "Sometimes", description: "Single cases but no automation at scale", value: 1, shortcut: "2" },
  { label: "No", description: "We don't do personalisation", value: 0, shortcut: "3" },
];

function OptionCards({
  options,
  selected,
  focused,
  onSelect,
  isActive,
}: {
  options: Option[];
  selected: ScoreValue | null;
  focused: number;
  onSelect: (v: ScoreValue) => void;
  isActive: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt, i) => {
        const isSelected = selected === opt.value;
        const isFocused = isActive && focused === i;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`relative rounded-lg border-2 p-4 text-center transition-all ${
              isSelected
                ? "border-slate-900 bg-slate-50"
                : isFocused
                  ? "border-slate-400 bg-slate-50/50 ring-2 ring-slate-300/50"
                  : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-medium text-slate-400">
              {opt.shortcut}
            </span>
            <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
            <p className="mt-1 text-xs text-slate-500">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function ScreenLifecycleSegmentation({
  onSubmit,
  defaultClm,
  defaultPersonalisation,
  onBack,
}: Props) {
  const [clm, setClm] = useState<ScoreValue | null>(defaultClm);
  const [personalisation, setPersonalisation] = useState<ScoreValue | null>(defaultPersonalisation);
  // 0 = question 1 (CLM), 1 = question 2 (personalisation)
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance to Q2 after CLM selected
  const handleClmSelect = useCallback((v: ScoreValue) => {
    setClm(v);
    setActiveQuestion(1);
    setFocusIndex(0);
  }, []);

  const handlePersSelect = useCallback((v: ScoreValue) => {
    setPersonalisation(v);
  }, []);

  // Submit when both answered
  const canSubmit = clm !== null && personalisation !== null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const options = activeQuestion === 0 ? CLM_OPTIONS : PERSONALISATION_OPTIONS;
      const selectFn = activeQuestion === 0 ? handleClmSelect : handlePersSelect;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setFocusIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusIndex((prev) => Math.min(options.length - 1, prev + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (activeQuestion === 1) {
            setActiveQuestion(0);
            setFocusIndex(0);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (activeQuestion === 0 && clm !== null) {
            setActiveQuestion(1);
            setFocusIndex(0);
          }
          break;
        case "1":
          e.preventDefault();
          selectFn(options[0].value);
          break;
        case "2":
          e.preventDefault();
          selectFn(options[1].value);
          break;
        case "3":
          e.preventDefault();
          selectFn(options[2].value);
          break;
        case "Enter":
          e.preventDefault();
          if (activeQuestion === 0) {
            // Select focused option and advance
            handleClmSelect(options[focusIndex].value);
          } else if (activeQuestion === 1 && personalisation === null) {
            // Select focused option
            handlePersSelect(options[focusIndex].value);
          } else if (canSubmit) {
            onSubmit(clm!, personalisation!);
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeQuestion, focusIndex, clm, personalisation, canSubmit, onSubmit, handleClmSelect, handlePersSelect]);

  return (
    <motion.div
      ref={containerRef}
      key="lifecycle-segmentation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-xl flex-col gap-6 pt-16"
      tabIndex={-1}
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Lifecycle Segmentation
        </h2>
        <p className="text-slate-500">
          Tell us about your current lifecycle marketing maturity.
        </p>
      </div>

      <div className="space-y-8">
        {/* Question 1: CLM */}
        <div
          className={`rounded-xl p-5 transition-all ${
            activeQuestion === 0
              ? "bg-white ring-1 ring-slate-200 shadow-sm"
              : clm !== null
                ? "bg-slate-50/50"
                : ""
          }`}
          onClick={() => setActiveQuestion(0)}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              1
            </span>
            <p className="text-sm font-medium text-slate-700">
              Do you segment customers into lifecycle stages? (e.g. Onboarding, Engagement, Retention)
            </p>
          </div>
          {clm !== null && activeQuestion !== 0 ? (
            <div className="mt-3 ml-8">
              <span className="rounded-full border border-slate-900 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900">
                {CLM_OPTIONS.find((o) => o.value === clm)?.label}
              </span>
            </div>
          ) : (
            <div className="mt-3">
              <OptionCards
                options={CLM_OPTIONS}
                selected={clm}
                focused={focusIndex}
                onSelect={handleClmSelect}
                isActive={activeQuestion === 0}
              />
            </div>
          )}
        </div>

        {/* Question 2: Personalisation */}
        <AnimatePresence>
          {(clm !== null || defaultPersonalisation !== null) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl p-5 transition-all ${
                activeQuestion === 1
                  ? "bg-white ring-1 ring-slate-200 shadow-sm"
                  : personalisation !== null
                    ? "bg-slate-50/50"
                    : ""
              }`}
              onClick={() => setActiveQuestion(1)}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  2
                </span>
                <p className="text-sm font-medium text-slate-700">
                  Do you personalise based on user intent and behaviours?
                </p>
              </div>
              {personalisation !== null && activeQuestion !== 1 ? (
                <div className="mt-3 ml-8">
                  <span className="rounded-full border border-slate-900 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900">
                    {PERSONALISATION_OPTIONS.find((o) => o.value === personalisation)?.label}
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <OptionCards
                    options={PERSONALISATION_OPTIONS}
                    selected={personalisation}
                    focused={focusIndex}
                    onSelect={handlePersSelect}
                    isActive={activeQuestion === 1}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmit(clm!, personalisation!)}
          className="flex-1"
        >
          Continue
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">
        {canSubmit
          ? <>Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue</>
          : "Use 1 / 2 / 3 or arrow keys to select"}
      </p>
    </motion.div>
  );
}
