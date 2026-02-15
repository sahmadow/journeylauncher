"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { useEnterKey } from "@/hooks/useEnterKey";

interface Props {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export function ScreenEmailCapture({ onSubmit, isLoading }: Props) {
  const [email, setEmail] = useState("");
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleEnter = useCallback(() => { if (isValid && !isLoading) onSubmit(email); }, [isValid, isLoading, onSubmit, email]);
  useEnterKey(handleEnter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(email);
  };

  return (
    <motion.div key="email-capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex w-full max-w-md flex-col items-center gap-8 pt-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2ecc71]/10">
          <Mail size={28} className="text-[#2ecc71]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Your flow is ready!</h2>
        <p className="text-muted-foreground">Enter your email to see your personalised CRM flow and receive a copy.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" autoFocus />
        <Button type="submit" size="lg" disabled={!isValid || isLoading} className="bg-[#2ecc71] text-white hover:bg-[#27ae60]">
          {isLoading ? "Saving..." : "See My CRM Flow"}
        </Button>
      </form>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock size={12} />
        <span>No spam. We only use this to send your flow results.</span>
      </div>
    </motion.div>
  );
}
