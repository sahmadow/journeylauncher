"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const MENU_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "What We Use", href: "/#what-we-use" },
  { label: "We Advised", href: "/#we-advised" },
  { label: "What You Get", href: "/#what-you-get" },
  { label: "Contact", href: "/#contact" },
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

        {/* Primary links + CTAs + menu toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Blog
          </Link>
          <a
            href="https://calendly.com/saleh-journeylauncher/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:block"
          >
            Book a Session
          </a>
          <Link
            href="/flow"
            className="hidden rounded-lg bg-[#0F2A33] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a3d4a] sm:block"
          >
            Generate Free CRM Flow
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="ml-1"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="border-t border-border bg-white px-6 pb-6">
          <div className="flex flex-col gap-4 pt-4">
            {MENU_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {/* Show Blog + CTAs in menu on small screens */}
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:hidden">
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Blog
              </Link>
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
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#0F2A33] px-4 py-2.5 text-center text-sm font-medium text-white"
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
