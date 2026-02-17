"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlowNode as FlowNodeType } from "@/types";
import { EmailPreview } from "./EmailPreview";

interface Props {
  node: FlowNodeType;
  stageColor: string;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
}

export function FlowNode({ node, stageColor, brandColors, logoUrl, brandName }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  if (node.type === "trigger") {
    return (
      <div className="flex w-64 items-center gap-3 rounded-lg border-2 px-4 py-3" style={{ borderColor: stageColor }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: stageColor }}>T</div>
        <div>
          <p className="text-sm font-semibold">{node.label || "Entry Trigger"}</p>
          {(node.description) && <p className="text-xs text-muted-foreground">{node.description}</p>}
        </div>
      </div>
    );
  }

  if (node.type === "wait") {
    return (
      <div className="flex w-48 items-center justify-center gap-2 rounded-full border bg-secondary px-4 py-2">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-muted-foreground">Wait {node.duration}</span>
      </div>
    );
  }

  if (node.type === "condition") {
    return (
      <div className="flex w-56 items-center justify-center rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">{node.condition || node.label || "Check condition"}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-72 cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md" onClick={() => setShowPreview(!showPreview)}>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">E</div>
          <span className="text-xs text-muted-foreground">Email</span>
        </div>
        <p className="text-sm font-semibold">{node.subject}</p>
        {node.preview_text && <p className="mt-1 text-xs text-muted-foreground">{node.preview_text}</p>}
        <p className="mt-2 text-xs text-blue-500">Click to preview</p>
      </div>
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute left-full top-0 z-10 ml-4">
            <EmailPreview node={node} brandColors={brandColors} logoUrl={logoUrl} brandName={brandName} onClose={() => setShowPreview(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
