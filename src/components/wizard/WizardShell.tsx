"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WizardShellProps {
  currentScreen: number;
  totalScreens: number;
  onBack?: () => void;
  children: React.ReactNode;
}

const SCREEN_LABELS = [
  "Landing Page",
  "Business Info",
  "Lifecycle Segmentation",
  "Data Sources",
  "Lifecycle Gaps",
  "Webhooks",
  "Brand Brief",
  "Email Capture",
  "Lifecycle Canvas",
  "Summary",
];

export function WizardShell({
  currentScreen,
  totalScreens,
  onBack,
  children,
}: WizardShellProps) {
  const progress = (currentScreen / totalScreens) * 100;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentScreen > 1 && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-new.svg" alt="Journey Launcher" className="h-5 w-5" />
            <h1 className="text-xl font-bold tracking-tight">Journey Launcher</h1>
          </Link>
        </div>
        <span className="text-sm text-muted-foreground">
          Step {currentScreen} of {totalScreens}
        </span>
      </div>
      <Progress value={progress} className="mb-2 h-2" />
      <p className="mb-8 text-xs text-muted-foreground">
        {SCREEN_LABELS[currentScreen - 1]}
      </p>
      <div className="flex flex-1 items-start justify-center">{children}</div>
    </div>
  );
}
