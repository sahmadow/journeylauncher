"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  WizardState,
  INITIAL_WIZARD_STATE,
  LifecycleStage,
  BusinessType,
  ScoreValue,
  DataAvailability,
  EmailGenState,
} from "@/types";

const STORAGE_KEY = "jl_wizard_state";
import { WizardShell } from "@/components/wizard/WizardShell";
import { ScreenLandingPage } from "@/components/wizard/ScreenLandingPage";
import { ScreenBusinessDesc } from "@/components/wizard/ScreenBusinessDesc";
import { ScreenLifecycleSegmentation } from "@/components/wizard/ScreenLifecycleSegmentation";
import { ScreenDataCollection } from "@/components/wizard/ScreenDataCollection";
import { ScreenLifecycleGaps } from "@/components/wizard/ScreenLifecycleGaps";
import { ScreenWebhookSummary } from "@/components/wizard/ScreenWebhookSummary";
import { ScreenBrandBrief } from "@/components/wizard/ScreenBrandBrief";
import { ScreenEmailCapture } from "@/components/wizard/ScreenEmailCapture";
import { ScreenCanvas } from "@/components/wizard/ScreenCanvas";
import { ScreenSummary } from "@/components/wizard/ScreenSummary";
import {
  scrapePage,
  analyzeSources,
  generateFlow,
  saveSubmission,
} from "@/lib/api";

const TOTAL_SCREENS = 10;

function loadSavedState(): WizardState {
  if (typeof window === "undefined") return INITIAL_WIZARD_STATE;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WizardState;
      // Reset transient state
      return { ...parsed, isLoading: false, error: null };
    }
  } catch { /* ignore parse errors */ }
  return INITIAL_WIZARD_STATE;
}

export default function FlowPage() {
  const [state, setState] = useState<WizardState>(loadSavedState);

  // Persist state to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* storage full — ignore */ }
  }, [state]);

  const update = useCallback(
    (partial: Partial<WizardState>) =>
      setState((prev) => ({ ...prev, ...partial })),
    []
  );

  const goTo = useCallback(
    (screen: number) => {
      window.scrollTo(0, 0);
      update({ currentScreen: screen, error: null });
    },
    [update]
  );

  const handleBack = useCallback(() => {
    if (state.currentScreen > 1) goTo(state.currentScreen - 1);
  }, [state.currentScreen, goTo]);

  const handleScrape = useCallback(async (url: string) => {
    update({ isLoading: true, error: null, landingPageUrl: url });
    try {
      const res = await scrapePage(url);
      update({ scrapedData: res.scraped_data, analysis: res.analysis, isLoading: false, currentScreen: 2 });
    } catch (e) {
      update({ isLoading: false, error: e instanceof Error ? e.message : "Scraping failed" });
    }
  }, [update]);

  const handleBusinessDesc = useCallback((desc: string) => {
    update({ businessDesc: desc, currentScreen: 3 });
  }, [update]);

  const handleLifecycleSegmentation = useCallback((clm: ScoreValue, personalisation: ScoreValue) => {
    update({ clmScore: clm, personalisationScore: personalisation, currentScreen: 4 });
  }, [update]);

  const handleDataSources = useCallback((sources: string[], other: string) => {
    update({ dataSources: sources, dataSourceOther: other, currentScreen: 5 });
    if (sources.length > 0 && !sources.includes("None")) {
      setState((prev) => {
        analyzeSources(sources, prev.businessDesc)
          .then((res) => setState((s) => ({ ...s, webhookSummary: res.webhook_summary })))
          .catch(() => {});
        return prev;
      });
    }
  }, [update]);

  const handleLifecycleGaps = useCallback((gaps: LifecycleStage[]) => {
    update({ lifecycleGaps: gaps, currentScreen: 6 });
  }, [update]);

  const handleWebhookContinue = useCallback((dataAvailability: DataAvailability) => {
    update({ dataAvailability, currentScreen: 7 });
  }, [update]);

  const handleBusinessTypeChange = useCallback((type: BusinessType) => {
    update({ businessTypeOverride: type });
  }, [update]);

  // Screen 7 → 8: Generate flow, then show email capture
  const handleGenerateFlow = useCallback(async () => {
    // Start generating flow in background, navigate to email capture with loading=false
    // so the email form is immediately usable
    update({ currentScreen: 8, isLoading: false });
    try {
      const analysisWithOverride = state.businessTypeOverride && state.analysis
        ? { ...state.analysis, business_type: state.businessTypeOverride }
        : state.analysis;
      const res = await generateFlow({
        scraped_data: state.scrapedData,
        business_desc: state.businessDesc,
        lifecycle_gaps: state.lifecycleGaps,
        analysis: analysisWithOverride,
      });
      update({ generatedFlow: res.flow });
    } catch (e) {
      update({ error: e instanceof Error ? e.message : "Flow generation failed" });
    }
  }, [update, state.scrapedData, state.businessDesc, state.lifecycleGaps, state.analysis, state.businessTypeOverride]);

  // Screen 8: Email capture → 9 (canvas)
  const handleEmailCapture = useCallback(async (email: string) => {
    update({ email, isLoading: true });
    try {
      // Save email capture only — full submission saved on screen 10
      await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "flow_wizard" }),
      });
    } catch {
      // Non-critical — continue even if email save fails
    }
    update({ isLoading: false, currentScreen: 9 });
  }, [update]);

  const handleSave = useCallback(async () => {
    update({ isLoading: true });
    try {
      await saveSubmission({
        landing_page_url: state.landingPageUrl,
        scraped_data: state.scrapedData,
        business_desc: state.businessDesc,
        clm_score: state.clmScore,
        personalisation_score: state.personalisationScore,
        data_availability: state.dataAvailability,
        lifecycle_gaps: state.lifecycleGaps,
        data_sources: state.dataSources,
        data_source_other: state.dataSourceOther || null,
        generated_flow: state.generatedFlow,
        webhook_summary: state.webhookSummary,
        analysis: state.analysis,
        email_gen_config: state.emailGenState?.brand_config || null,
        generated_emails: state.emailGenState?.generated_emails || null,
        email: state.email,
      });
      update({ isLoading: false });
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    } catch (e) {
      update({ isLoading: false, error: e instanceof Error ? e.message : "Save failed" });
    }
  }, [update, state]);

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 1: return <ScreenLandingPage onSubmit={handleScrape} isLoading={state.isLoading} error={state.error} />;
      case 2: return <ScreenBusinessDesc onSubmit={handleBusinessDesc} defaultValue={state.businessDesc} />;
      case 3: return <ScreenLifecycleSegmentation onSubmit={handleLifecycleSegmentation} defaultClm={state.clmScore} defaultPersonalisation={state.personalisationScore} onBack={handleBack} />;
      case 4: return <ScreenDataCollection onSubmit={handleDataSources} defaultSources={state.dataSources} />;
      case 5: return <ScreenLifecycleGaps onSubmit={handleLifecycleGaps} defaultGaps={state.lifecycleGaps} />;
      case 6: return <ScreenWebhookSummary webhookSummary={state.webhookSummary} dataSources={state.dataSources} onContinue={handleWebhookContinue} />;
      case 7: return <ScreenBrandBrief analysis={state.analysis} scrapedData={state.scrapedData} businessTypeOverride={state.businessTypeOverride} onBusinessTypeChange={handleBusinessTypeChange} clmScore={state.clmScore} personalisationScore={state.personalisationScore} dataSources={state.dataSources} dataAvailability={state.dataAvailability} lifecycleGaps={state.lifecycleGaps} onGenerateFlow={handleGenerateFlow} isLoading={state.isLoading} />;
      case 8: return <ScreenEmailCapture onSubmit={handleEmailCapture} isLoading={state.isLoading} />;
      case 9: return <ScreenCanvas flow={state.generatedFlow} isLoading={state.isLoading} scrapedData={state.scrapedData} onContinue={() => goTo(10)} />;
      case 10: return <ScreenSummary state={state} onSave={handleSave} isLoading={state.isLoading} />;
      default: return null;
    }
  };

  return (
    <WizardShell currentScreen={state.currentScreen} totalScreens={TOTAL_SCREENS} onBack={handleBack}>
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
    </WizardShell>
  );
}
