"use client";

import { GeneratedFlow } from "@/types";
import { StageSection } from "./StageSection";

interface Props {
  flow: GeneratedFlow;
  brandColors: string[];
}

const STAGE_COLORS: Record<string, string> = {
  "Early Engagement": "#3b82f6",
  Engagement: "#8b5cf6",
  Monetisation: "#f59e0b",
  Retention: "#10b981",
};

export function LifecycleCanvas({ flow, brandColors }: Props) {
  const primaryColor = brandColors[0] || "#3b82f6";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {flow.stages.map((stage, i) => {
        const stageName = stage.stage || stage.name || stage.stage_name || `Stage ${i + 1}`;

        return (
          <StageSection
            key={stageName}
            stage={stage}
            stageName={stageName}
            color={STAGE_COLORS[stageName] || primaryColor}
          />
        );
      })}
    </div>
  );
}
