"use client";

import { useState } from "react";
import { FlowNode as FlowNodeType } from "@/types";
import { Bell, MonitorSmartphone, ChevronDown, ChevronUp } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

interface Props {
  node: FlowNodeType;
  stageColor: string;
}

const NODE_W = "w-72";

export function FlowNode({ node, stageColor }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  if (node.type === "trigger") {
    return (
      <div className={`flex ${NODE_W} items-center gap-3 rounded-lg border-2 px-4 py-3`} style={{ borderColor: stageColor }}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: stageColor }}>T</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{node.label || "Entry Trigger"}</p>
          {node.description && <p className="text-xs text-muted-foreground">{node.description}</p>}
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

  if (node.type === "push") {
    return (
      <div className={`${NODE_W} rounded-lg border bg-white p-3 shadow-sm`}>
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-purple-100">
            <Bell className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <span className="text-xs text-muted-foreground">Push Notification</span>
        </div>
        <p className="text-sm font-semibold">{node.label}</p>
        {node.description && <p className="mt-0.5 text-xs text-muted-foreground">{node.description}</p>}
      </div>
    );
  }

  if (node.type === "in_app") {
    return (
      <div className={`${NODE_W} rounded-lg border bg-white p-3 shadow-sm`}>
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-100">
            <MonitorSmartphone className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <span className="text-xs text-muted-foreground">In-App</span>
        </div>
        <p className="text-sm font-semibold">{node.label}</p>
        {node.description && <p className="mt-0.5 text-xs text-muted-foreground">{node.description}</p>}
        {node.cta_text && (
          <span className="mt-1.5 inline-block rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
            {node.cta_text}
          </span>
        )}
      </div>
    );
  }

  // Email node — inline expandable preview
  return (
    <div
      className={`${NODE_W} rounded-lg border bg-white shadow-sm cursor-pointer`}
      onClick={() => setShowPreview(!showPreview)}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">E</div>
          <span className="text-xs text-muted-foreground">Email</span>
          <span className="ml-auto text-muted-foreground">
            {showPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </div>
        <p className="text-sm font-semibold">{node.subject}</p>
        {node.preview_text && <p className="mt-1 text-xs text-muted-foreground">{node.preview_text}</p>}
      </div>

      {showPreview && (
        <div className="border-t px-4 py-3">
          {node.body_html ? (
            <div
              className="prose prose-sm prose-slate max-w-none text-xs"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(node.body_html) }}
            />
          ) : (
            <p className="text-xs text-muted-foreground italic">No body content</p>
          )}
          {node.cta_text && (
            <div className="mt-3">
              <span className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">
                {node.cta_text}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
