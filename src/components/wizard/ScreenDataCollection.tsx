"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEnterKey } from "@/hooks/useEnterKey";
import {
  Globe,
  Mail,
  MousePointerClick,
  CreditCard,
  Users,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

interface Props {
  onSubmit: (sources: string[], other: string) => void;
  defaultSources: string[];
}

interface DataCategory {
  label: string;
  description: string;
  icon: LucideIcon;
}

const DATA_CATEGORIES: DataCategory[] = [
  { label: "Website Activity", description: "Page views, time on site, traffic sources", icon: Globe },
  { label: "Email Engagement", description: "Opens, clicks, opt-ins, list subscriptions", icon: Mail },
  { label: "In-App Behaviour", description: "Feature usage, sessions, onboarding progress", icon: MousePointerClick },
  { label: "Purchase & Billing", description: "Transactions, subscriptions, payment status", icon: CreditCard },
  { label: "Customer Profiles", description: "Name, company, role, demographics, location", icon: Users },
  { label: "Forms & Surveys", description: "Lead forms, NPS scores, feedback, support tickets", icon: ClipboardList },
  { label: "Ad & Social Data", description: "Ad clicks, UTM tracking, referral sources", icon: Megaphone },
];

export function ScreenDataCollection({ onSubmit, defaultSources }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSources.filter((s) => s !== "None"));
  const submit = useCallback(() => {
    onSubmit(selected.length > 0 ? selected : ["None"], "");
  }, [onSubmit, selected]);
  useEnterKey(submit, true);

  const toggle = (src: string) => {
    setSelected((prev) =>
      prev.includes(src)
        ? prev.filter((s) => s !== src)
        : [...prev, src]
    );
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
          What customer data do you track?
        </h2>
        <p className="text-slate-500">
          Select the types of data your team currently collects. This helps us build smarter lifecycle triggers for your CRM flow.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DATA_CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.label);
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                isSelected
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => toggle(cat.label)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggle(cat.label)}
                id={cat.label}
              />
              <Icon size={20} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <Label htmlFor={cat.label} className="text-base font-medium cursor-pointer">
                  {cat.label}
                </Label>
                <p className="text-sm text-slate-500">{cat.description}</p>
              </div>
            </div>
          );
        })}

      </div>

      <Button
        size="lg"
        onClick={submit}
      >
        {selected.length > 0 ? "Continue" : "Skip"}
      </Button>
      <p className="text-center text-xs text-slate-400">
        Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue
      </p>
    </motion.div>
  );
}
