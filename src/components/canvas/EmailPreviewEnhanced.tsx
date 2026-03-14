"use client";

import { useState, useCallback } from "react";
import { FlowNode } from "@/types";
import { Button } from "@/components/ui/button";

type ViewMode = "desktop" | "mobile";
type Tab = "preview" | "source";

interface Props {
  node: FlowNode;
  generatedHtml?: string;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
  onClose: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function EmailPreviewEnhanced({
  node,
  generatedHtml,
  brandColors,
  logoUrl,
  brandName,
  onClose,
  onRegenerate,
  isRegenerating,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const primaryColor = brandColors[0] || "#3b82f6";
  const hasGenerated = !!generatedHtml;

  const iframeWidth = viewMode === "mobile" ? 375 : 600;

  const handleCopy = useCallback(async () => {
    if (!generatedHtml) return;
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = generatedHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedHtml]);

  // Fallback: basic preview if no generated HTML
  if (!hasGenerated) {
    return (
      <div className="w-80 rounded-xl border bg-white shadow-lg">
        <div
          className="rounded-t-xl px-4 py-3"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2">
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                className="h-5 w-5 rounded"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
            )}
            <span className="text-sm font-medium text-white">
              {brandName || "Your Brand"}
            </span>
          </div>
        </div>
        <div className="border-b px-4 py-2">
          <p className="text-sm font-semibold">{node.subject}</p>
          <p className="text-xs text-muted-foreground">{node.preview_text}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Generate branded emails to see enhanced preview
          </p>
        </div>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] rounded-xl border bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border-b px-4 py-2.5 bg-slate-50">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="truncate text-xs font-medium text-slate-700">
            {node.subject}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
          Ready
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-3 py-1.5 bg-white">
        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("source")}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeTab === "source"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            HTML
          </button>
        </div>

        {/* View mode toggle (preview tab only) */}
        <div className="flex items-center gap-1">
          {activeTab === "preview" && (
            <div className="flex rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode("desktop")}
                className={`p-1.5 ${viewMode === "desktop" ? "bg-slate-100" : ""}`}
                title="Desktop (600px)"
              >
                <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`p-1.5 border-l border-slate-200 ${viewMode === "mobile" ? "bg-slate-100" : ""}`}
                title="Mobile (375px)"
              >
                <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}

          {activeTab === "source" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy HTML
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === "preview" && (
        <div className="flex justify-center overflow-hidden bg-slate-100 p-3">
          <div
            className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300"
            style={{ width: iframeWidth }}
          >
            <iframe
              srcDoc={generatedHtml}
              sandbox=""
              title={`Email preview: ${node.subject}`}
              className="w-full border-0"
              style={{ height: 500 }}
            />
          </div>
        </div>
      )}
      {activeTab === "source" && (
        <div className="max-h-[500px] overflow-auto bg-slate-950 p-3">
          <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed text-slate-300 font-mono">
            {generatedHtml}
          </pre>
        </div>
      )}
      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <svg
                className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </button>
          )}
          <span className="text-[10px] text-slate-400">
            {viewMode === "mobile" ? "375px" : "600px"}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
          Close
        </Button>
      </div>
    </div>
  );
}
