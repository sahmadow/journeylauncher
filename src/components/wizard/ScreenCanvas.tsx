"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GeneratedFlow, ScrapedData, Analysis, GeneratedEmail, EmailGenState, BrandConfig } from "@/types";
import { LifecycleCanvas, StageGenerateRequest } from "@/components/canvas/LifecycleCanvas";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  flow: GeneratedFlow | null;
  isLoading: boolean;
  scrapedData: ScrapedData | null;
  analysis: Analysis | null;
  onContinue: () => void;
  emailGenState?: EmailGenState;
  onEmailGenStateChange?: (state: EmailGenState) => void;
}

function buildBrandConfig(scrapedData: ScrapedData | null, analysis: Analysis | null): BrandConfig {
  return {
    logo_url: scrapedData?.logo_url || "",
    primary_color: scrapedData?.colors?.[0] || "#1e293b",
    secondary_color: scrapedData?.colors?.[1] || "",
    font_family: "Inter, sans-serif",
    header_style: "logo-only",
    footer_content: `© ${new Date().getFullYear()} ${scrapedData?.title || "Your Company"}. All rights reserved.`,
    cta_style: "rounded",
    template_style: "minimal",
    tone_override: analysis?.tone || "professional",
    sender_name: scrapedData?.title || "",
  };
}

export function ScreenCanvas({
  flow,
  isLoading,
  scrapedData,
  analysis,
  onContinue,
  emailGenState,
  onEmailGenStateChange,
}: Props) {
  const [generatingStage, setGeneratingStage] = useState<string | null>(null);
  const canContinue = !isLoading && !!flow;
  const handleEnter = useCallback(() => { if (canContinue) onContinue(); }, [canContinue, onContinue]);
  useEnterKey(handleEnter, canContinue);

  const generatedEmails = emailGenState?.generated_emails || [];

  const handleGenerateForStage = useCallback(async (req: StageGenerateRequest) => {
    if (!flow) return;
    const { stageName, stageDescription, keyEmailNode } = req;
    setGeneratingStage(stageName);

    const brandConfig = emailGenState?.brand_config || buildBrandConfig(scrapedData, analysis);

    try {
      const res = await fetch("/api/generate-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_config: brandConfig,
          stages: [{
            stage_name: stageName,
            stage_description: stageDescription,
            email_node: {
              id: keyEmailNode.id,
              subject: keyEmailNode.subject,
              preview_text: keyEmailNode.preview_text,
              body_html: keyEmailNode.body_html,
              cta_text: keyEmailNode.cta_text,
              cta_url: keyEmailNode.cta_url,
            },
          }],
          analysis: analysis || {},
        }),
      });

      if (res.ok) {
        const { emails } = await res.json();
        const existing = generatedEmails.filter((e) => e.stage_name !== stageName);
        const updated = [...existing, ...(emails as GeneratedEmail[])];

        onEmailGenStateChange?.({
          brand_config: brandConfig,
          generated_emails: updated,
          generation_status: "complete",
          panel_open: false,
        });
      }
    } catch (err) {
      console.error("Email generation failed:", err);
    } finally {
      setGeneratingStage(null);
    }
  }, [flow, emailGenState, scrapedData, analysis, generatedEmails, onEmailGenStateChange]);

  if (isLoading || !flow) {
    return (
      <motion.div
        key="canvas-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6 pt-24"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-lg text-slate-600">
          Generating your customer lifecycle flow...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="canvas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full flex-col gap-6"
    >
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Your Customer Lifecycle Flow
        </h2>
        <p className="text-slate-500">
          Click on email nodes to preview the generated content
        </p>
      </div>

      <LifecycleCanvas
        flow={flow}
        brandColors={scrapedData?.colors || []}
        logoUrl={scrapedData?.logo_url || ""}
        brandName={scrapedData?.title || ""}
        generatedEmails={generatedEmails}
        onGenerateEmail={handleGenerateForStage}
        generatingStage={generatingStage || undefined}
      />

      <div className="flex flex-col items-center gap-2 pb-8">
        <Button size="lg" onClick={onContinue}>
          View Summary
        </Button>
        <p className="text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to continue
        </p>
      </div>
    </motion.div>
  );
}
