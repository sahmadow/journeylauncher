"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (desc: string) => void;
  defaultValue: string;
}

export function ScreenBusinessDesc({ onSubmit, defaultValue }: Props) {
  const [desc, setDesc] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.trim()) onSubmit(desc.trim());
  };

  return (
    <motion.div key="business-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex w-full max-w-xl flex-col gap-6 pt-16">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Tell us about your business</h2>
        <p className="text-muted-foreground">Describe what you do, who your customers are, and your main goals.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea placeholder="e.g. We're a SaaS platform that helps small businesses manage their invoicing..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={6} className="text-base" autoFocus />
        <Button type="submit" size="lg" disabled={!desc.trim()}>Continue</Button>
      </form>
    </motion.div>
  );
}
