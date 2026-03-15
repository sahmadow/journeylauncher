"use client";

import { FlowStage } from "@/types";
import { FlowNode } from "./FlowNode";
import { FlowConnector } from "./FlowConnector";

interface Props {
  stage: FlowStage;
  stageName: string;
  color: string;
}

export function StageSection({ stage, stageName, color }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold" style={{ color }}>{stageName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
      </div>
      <div className="flex flex-col items-center gap-0">
        {stage.nodes.map((node, i) => (
          <div key={node.id || `node-${i}`} className="flex flex-col items-center">
            <FlowNode
              node={node}
              stageColor={color}
            />
            {i < stage.nodes.length - 1 && (
              <FlowConnector
                type={stage.nodes[i].type === "condition" ? "branch" : "straight"}
                labels={stage.nodes[i].type === "condition" ? { yes: stage.nodes[i].yes_label || "Yes", no: stage.nodes[i].no_label || "No" } : undefined}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
