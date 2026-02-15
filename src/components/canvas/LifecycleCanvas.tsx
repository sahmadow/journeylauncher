"use client";

import { motion } from "framer-motion";
import { GeneratedFlow } from "@/types";
import { StageSection } from "./StageSection";

interface Props {
  flow: GeneratedFlow;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
}

const STAGE_COLORS: Record<string, string> = {
  "Early Engagement": "#3b82f6",
  Engagement: "#8b5cf6",
  Monetisation: "#f59e0b",
  Retention: "#10b981",
};

export function LifecycleCanvas({ flow, brandColors, logoUrl, brandName }: Props) {
  const primaryColor = brandColors[0] || "#3b82f6";
  return (
    <div className="space-y-8">
      {flow.stages.map((stage, i) => (
        <motion.div key={stage.stage} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3, duration: 0.5 }}>
          <StageSection stage={stage} color={STAGE_COLORS[stage.stage] || primaryColor} brandColors={brandColors} logoUrl={logoUrl} brandName={brandName} />
        </motion.div>
      ))}
    </div>
  );
}
