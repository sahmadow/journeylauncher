"use client";

import { FlowStage } from "@/types";
import { FlowNode } from "./FlowNode";
import { FlowConnector } from "./FlowConnector";

interface Props {
  stage: FlowStage;
  color: string;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
}

export function StageSection({ stage, color, brandColors, logoUrl, brandName }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-bold">{stage.stage}</h3>
        <span className="text-sm text-muted-foreground">{stage.description}</span>
      </div>
      <div className="flex flex-col items-center gap-0">
        {stage.nodes.map((node, i) => (
          <div key={node.id} className="flex flex-col items-center">
            <FlowNode node={node} stageColor={color} brandColors={brandColors} logoUrl={logoUrl} brandName={brandName} />
            {i < stage.nodes.length - 1 && (
              <FlowConnector type={stage.nodes[i].type === "condition" ? "branch" : "straight"} labels={stage.nodes[i].type === "condition" ? { yes: stage.nodes[i].yes_label || "Yes", no: stage.nodes[i].no_label || "No" } : undefined} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
