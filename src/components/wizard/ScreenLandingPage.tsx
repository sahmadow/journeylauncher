"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

const LOADING_MESSAGES = [
  "Analysing your page...",
  "Understanding your business...",
  "Evaluating gaps...",
  "Almost done...",
];

export function ScreenLandingPage({ onSubmit, isLoading, error }: Props) {
  const [url, setUrl] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  if (isLoading) {
    return (
      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 pt-24">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-foreground" />
        <motion.p key={msgIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-muted-foreground">
          {LOADING_MESSAGES[msgIndex]}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div key="landing-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex w-full max-w-xl flex-col items-center gap-8 pt-16">
      <div className="text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight">Generate your personalised CRM flow</h2>
        <p className="text-muted-foreground">Enter your landing page URL and we&apos;ll analyze your business</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
        <Input type="text" placeholder="https://yoursite.com" value={url} onChange={(e) => setUrl(e.target.value)} className="h-12 text-base" autoFocus />
        <Button type="submit" size="lg" disabled={!url.trim()} className="bg-[#2ecc71] text-white hover:bg-[#27ae60]">Analyze</Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </motion.div>
  );
}
