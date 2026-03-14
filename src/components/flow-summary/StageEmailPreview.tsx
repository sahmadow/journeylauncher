"use client";

import { useState } from "react";

interface Props {
  html: string;
  subject: string;
  stageName: string;
}

export function StageEmailPreview({ html, subject, stageName }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Branded Email Preview
          </span>
          <span className="text-xs text-slate-500">{subject}</span>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-green-200 p-3">
          <div className="mx-auto max-w-[600px] overflow-hidden rounded-lg border bg-white shadow-sm">
            <iframe
              srcDoc={html}
              sandbox=""
              title={`Email preview: ${stageName}`}
              className="w-full border-0"
              style={{ height: 500 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
