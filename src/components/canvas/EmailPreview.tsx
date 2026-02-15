"use client";

import DOMPurify from "dompurify";
import { FlowNode } from "@/types";
import { Button } from "@/components/ui/button";

interface Props {
  node: FlowNode;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
  onClose: () => void;
}

export function EmailPreview({ node, brandColors, logoUrl, brandName, onClose }: Props) {
  const primaryColor = brandColors[0] || "#3b82f6";
  const sanitizedHtml = node.body_html ? DOMPurify.sanitize(node.body_html) : "";

  return (
    <div className="w-80 rounded-xl border bg-white shadow-lg">
      <div className="rounded-t-xl px-4 py-3" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-2">
          {logoUrl && <img src={logoUrl} alt="" className="h-5 w-5 rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />}
          <span className="text-sm font-medium text-white">{brandName || "Your Brand"}</span>
        </div>
      </div>
      <div className="border-b px-4 py-2">
        <p className="text-sm font-semibold">{node.subject}</p>
        <p className="text-xs text-muted-foreground">{node.preview_text}</p>
      </div>
      <div className="px-4 py-4">
        {sanitizedHtml ? (
          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        ) : (
          <p className="text-sm text-muted-foreground">Email body preview</p>
        )}
        {node.cta_text && (
          <div className="mt-4">
            <div className="inline-block rounded-lg px-6 py-2 text-center text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>{node.cta_text}</div>
          </div>
        )}
      </div>
      <div className="border-t px-4 py-2">
        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">Close Preview</Button>
      </div>
    </div>
  );
}
