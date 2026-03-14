"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BrandConfig,
  GeneratedEmail,
  GeneratedFlow,
  ScrapedData,
  Analysis,
  FlowNode,
} from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scrapedData: ScrapedData | null;
  analysis: Analysis | null;
  flow: GeneratedFlow;
  onEmailsGenerated: (emails: GeneratedEmail[], brandConfig: BrandConfig) => void;
}

const FONT_OPTIONS = [
  "Arial, Helvetica, sans-serif",
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Georgia, serif",
  "Verdana, sans-serif",
];

const FONT_LABELS: Record<string, string> = {
  "Arial, Helvetica, sans-serif": "Arial",
  "Inter, sans-serif": "Inter",
  "Roboto, sans-serif": "Roboto",
  "Georgia, serif": "Georgia",
  "Verdana, sans-serif": "Verdana",
};

function selectKeyEmail(nodes: FlowNode[]): FlowNode | null {
  const emailNodes = nodes.filter((n) => n.type === "email" && n.subject);
  return emailNodes[0] || null;
}

export function EmailStudioPanel({
  isOpen,
  onClose,
  scrapedData,
  analysis,
  flow,
  onEmailsGenerated,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<BrandConfig>(() => ({
    logo_url: scrapedData?.logo_url || "",
    primary_color: scrapedData?.colors?.[0] || "#1e293b",
    secondary_color: scrapedData?.colors?.[1] || "",
    font_family: FONT_OPTIONS[0],
    header_style: "logo-only",
    footer_content: `© ${new Date().getFullYear()} ${scrapedData?.title || "Your Company"}. All rights reserved.`,
    cta_style: "rounded",
    template_style: "minimal",
    tone_override: analysis?.tone || "professional",
    sender_name: scrapedData?.title || "",
    sender_address: "",
  }));

  const updateConfig = useCallback(
    <K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Select one key email per stage
      const stages = flow.stages
        .map((stage) => {
          const keyEmail = selectKeyEmail(stage.nodes);
          if (!keyEmail) return null;
          return {
            stage_name: stage.stage,
            stage_description: stage.description,
            email_node: {
              id: keyEmail.id,
              subject: keyEmail.subject,
              preview_text: keyEmail.preview_text,
              body_html: keyEmail.body_html,
              cta_text: keyEmail.cta_text,
              cta_url: keyEmail.cta_url,
            },
          };
        })
        .filter(Boolean);

      if (stages.length === 0) {
        setError("No email nodes found in flow stages");
        setIsGenerating(false);
        return;
      }

      const res = await fetch("/api/generate-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_config: config,
          stages,
          analysis: analysis || {},
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Generation failed");
      }

      const { emails } = (await res.json()) as {
        emails: GeneratedEmail[];
      };
      onEmailsGenerated(emails, config);
    } catch (err) {
      console.error("Email generation error:", err);
      setError(
        err instanceof Error ? err.message : "Generation failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const stageEmailCount = flow.stages.filter((s) =>
    s.nodes.some((n) => n.type === "email" && n.subject)
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Email Studio
                </h3>
                <p className="text-xs text-slate-500">
                  {stageEmailCount} stage{stageEmailCount !== 1 ? "s" : ""} will
                  get branded emails
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Brand Identity */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700 mb-1">
                  Brand Identity
                </legend>

                <div className="space-y-1.5">
                  <Label htmlFor="logo_url" className="text-xs">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={config.logo_url}
                    onChange={(e) => updateConfig("logo_url", e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sender_name" className="text-xs">Brand Name</Label>
                  <Input
                    id="sender_name"
                    value={config.sender_name}
                    onChange={(e) => updateConfig("sender_name", e.target.value)}
                    placeholder="Your Company"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Scraped color swatches */}
                {scrapedData?.colors && scrapedData.colors.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Brand Colors (from site)</Label>
                    <div className="flex gap-1.5">
                      {scrapedData.colors.slice(0, 6).map((c, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (!config.primary_color || config.primary_color === scrapedData.colors[0]) {
                              updateConfig("primary_color", c);
                            } else {
                              updateConfig("secondary_color", c);
                            }
                          }}
                          className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                            config.primary_color === c || config.secondary_color === c
                              ? "border-slate-900 ring-1 ring-slate-900"
                              : "border-slate-200"
                          }`}
                          style={{ backgroundColor: c }}
                          title={`${c} — click to use`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="primary_color" className="text-xs">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primary_color"
                        value={config.primary_color}
                        onChange={(e) => updateConfig("primary_color", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={config.primary_color}
                        onChange={(e) => updateConfig("primary_color", e.target.value)}
                        className="h-8 flex-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="secondary_color" className="text-xs">Secondary</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondary_color"
                        value={config.secondary_color || "#6366f1"}
                        onChange={(e) => updateConfig("secondary_color", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={config.secondary_color || ""}
                        onChange={(e) => updateConfig("secondary_color", e.target.value)}
                        className="h-8 flex-1 text-xs font-mono"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Typography & Style */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700 mb-1">
                  Style
                </legend>

                <div className="space-y-1.5">
                  <Label className="text-xs">Font Family</Label>
                  <select
                    value={config.font_family}
                    onChange={(e) =>
                      updateConfig(
                        "font_family",
                        e.target.value
                      )
                    }
                    className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {FONT_LABELS[f] || f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">CTA Button Style</Label>
                  <div className="flex gap-2">
                    {(["rounded", "pill", "square"] as const).map(
                      (style) => (
                        <button
                          key={style}
                          onClick={() =>
                            updateConfig("cta_style", style)
                          }
                          className={`flex-1 py-1.5 text-xs font-medium border transition-colors ${
                            config.cta_style === style
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                          style={{
                            borderRadius:
                              style === "pill"
                                ? "20px"
                                : style === "rounded"
                                  ? "6px"
                                  : "0",
                          }}
                        >
                          {style.charAt(0).toUpperCase() +
                            style.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                  {/* Live CTA preview */}
                  <div className="mt-2 flex justify-center">
                    <span
                      className="inline-block px-6 py-2 text-xs font-semibold text-white"
                      style={{
                        backgroundColor: config.primary_color,
                        borderRadius:
                          config.cta_style === "pill"
                            ? "25px"
                            : config.cta_style === "rounded"
                              ? "8px"
                              : "0",
                      }}
                    >
                      Example CTA
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Header Style</Label>
                  <select
                    value={config.header_style}
                    onChange={(e) =>
                      updateConfig(
                        "header_style",
                        e.target.value as BrandConfig["header_style"]
                      )
                    }
                    className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs"
                  >
                    <option value="logo-only">Logo Only</option>
                    <option value="logo-tagline">
                      Logo + Tagline
                    </option>
                    <option value="logo-nav">Logo + Nav</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tone</Label>
                  <select
                    value={config.tone_override || "professional"}
                    onChange={(e) =>
                      updateConfig("tone_override", e.target.value)
                    }
                    className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="bold">Bold</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Template Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["minimal", "editorial", "promotional"] as const).map((style) => {
                      const descriptions: Record<string, string> = {
                        minimal: "Clean & simple",
                        editorial: "Content-rich",
                        promotional: "Bold & visual",
                      };
                      return (
                        <button
                          key={style}
                          onClick={() => updateConfig("template_style", style)}
                          className={`rounded-lg border p-2 text-center transition-colors ${
                            config.template_style === style
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="block text-xs font-medium capitalize">{style}</span>
                          <span className="block text-[10px] text-slate-400">{descriptions[style]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </fieldset>

              {/* Footer */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700 mb-1">
                  Footer
                </legend>
                <div className="space-y-1.5">
                  <Label htmlFor="footer_content" className="text-xs">Footer Text</Label>
                  <textarea
                    id="footer_content"
                    value={config.footer_content}
                    onChange={(e) => updateConfig("footer_content", e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs"
                  />
                </div>
              </fieldset>

              {/* Generation progress */}
              {isGenerating && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                  <p className="text-xs font-medium text-blue-800">Generating branded emails...</p>
                  {flow.stages
                    .filter((s) => s.nodes.some((n) => n.type === "email" && n.subject))
                    .map((stage) => (
                      <div key={stage.stage} className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        <span className="text-[11px] text-blue-700">{stage.stage}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t px-5 py-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !config.sender_name}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating {stageEmailCount} email
                    {stageEmailCount !== 1 ? "s" : ""}...
                  </span>
                ) : (
                  `Generate ${stageEmailCount} Stage Email${stageEmailCount !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
