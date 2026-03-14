"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlowNode as FlowNodeType, GeneratedEmail } from "@/types";
import { EmailPreviewEnhanced } from "./EmailPreviewEnhanced";

interface Props {
  node: FlowNodeType;
  stageColor: string;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
  generatedEmail?: GeneratedEmail;
  isKeyEmail?: boolean;
  onGeneratePreview?: () => void;
  isGenerating?: boolean;
}

export function FlowNode({ node, stageColor, brandColors, logoUrl, brandName, generatedEmail, isKeyEmail, onGeneratePreview, isGenerating }: Props) {
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

  const hasGeneratedHtml = generatedEmail?.status === "ready" && !!generatedEmail.html;

  return (
    <div className="relative">
      <div
        className={`w-72 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${hasGeneratedHtml ? "ring-2 ring-green-200" : ""}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">E</div>
          <span className="text-xs text-muted-foreground">Email</span>
          {hasGeneratedHtml && (
            <span className="ml-auto rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Branded</span>
          )}
        </div>
        <p className="text-sm font-semibold cursor-pointer" onClick={() => setShowPreview(!showPreview)}>{node.subject}</p>
        {node.preview_text && <p className="mt-1 text-xs text-muted-foreground">{node.preview_text}</p>}

        {/* Generate Preview / View Preview button — only on key email node */}
        {isKeyEmail && !hasGeneratedHtml && (
          <button
            onClick={(e) => { e.stopPropagation(); onGeneratePreview?.(); }}
            disabled={isGenerating}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
                Generating...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Generate Preview
              </>
            )}
          </button>
        )}

        {/* View branded preview */}
        {hasGeneratedHtml && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? "Hide Preview" : "View Preview"}
          </button>
        )}

        {/* Plain preview for non-key emails */}
        {!isKeyEmail && (
          <p className="mt-2 text-xs text-blue-500 cursor-pointer" onClick={() => setShowPreview(!showPreview)}>Click to preview</p>
        )}
      </div>
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute left-full top-0 z-10 ml-4">
            <EmailPreviewEnhanced
              node={node}
              generatedHtml={generatedEmail?.html}
              brandColors={brandColors}
              logoUrl={logoUrl}
              brandName={brandName}
              onClose={() => setShowPreview(false)}
              onRegenerate={isKeyEmail ? onGeneratePreview : undefined}
              isRegenerating={isGenerating}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
