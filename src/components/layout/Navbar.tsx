"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Use", href: "#what-we-use" },
  { label: "We Advised", href: "#we-advised" },
  { label: "What You Get", href: "#what-you-get" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1248px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img src="/logo-new.svg" alt="Journey Launcher" className="h-7 w-7" />
          JOURNEY LAUNCHER
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://calendly.com/saleh-journeylauncher/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Book a Session
          </a>
          <Link
            href="/flow"
            className="rounded-lg bg-[#00c8ff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00aadd]"
          >
            Generate Free CRM Flow
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-white px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <a
                href="https://calendly.com/saleh-journeylauncher/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium"
              >
                Book a Session
              </a>
              <Link
                href="/flow"
                className="rounded-lg bg-[#00c8ff] px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Generate Free CRM Flow
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
