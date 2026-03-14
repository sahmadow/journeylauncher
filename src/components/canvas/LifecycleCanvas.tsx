"use client";

import { motion } from "framer-motion";
import { GeneratedFlow, GeneratedEmail } from "@/types";
import { StageSection } from "./StageSection";

export interface StageGenerateRequest {
  stageName: string;
  stageDescription: string;
  keyEmailNode: GeneratedFlow["stages"][0]["nodes"][0];
}

interface Props {
  flow: GeneratedFlow;
  brandColors: string[];
  logoUrl: string;
  brandName: string;
  generatedEmails?: GeneratedEmail[];
  onGenerateEmail?: (req: StageGenerateRequest) => void;
  generatingStage?: string | null;
}

const STAGE_COLORS: Record<string, string> = {
  "Early Engagement": "#3b82f6",
  Engagement: "#8b5cf6",
  Monetisation: "#f59e0b",
  Retention: "#10b981",
};

export function LifecycleCanvas({ flow, brandColors, logoUrl, brandName, generatedEmails = [], onGenerateEmail, generatingStage }: Props) {
  const primaryColor = brandColors[0] || "#3b82f6";
  return (
    <div className="space-y-8">
      {flow.stages.map((stage, i) => {
        // Normalize stage name — Gemini may return stage, name, or stage_name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = stage as any;
        const stageName: string = stage.stage || raw.name || raw.stage_name || `Stage ${i + 1}`;
        const stageEmail = generatedEmails.find(
          (e) => e.stage_name === stageName
        );
        const keyEmailNode = stage.nodes.find((n) => n.type === "email" && n.subject);

        return (
          <motion.div key={stageName} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3, duration: 0.5 }}>
            <StageSection
              stage={stage}
              stageName={stageName}
              color={STAGE_COLORS[stageName] || primaryColor}
              brandColors={brandColors}
              logoUrl={logoUrl}
              brandName={brandName}
              generatedEmail={stageEmail}
              onGenerateEmail={onGenerateEmail && keyEmailNode ? () => onGenerateEmail({ stageName, stageDescription: stage.description, keyEmailNode }) : undefined}
              isGenerating={generatingStage === stageName}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
