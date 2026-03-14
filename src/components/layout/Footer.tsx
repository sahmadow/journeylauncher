"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const FOOTER_COLS = [
  {
    title: "Services",
    links: [
      { label: "CRM Strategy", href: "#how-it-works" },
      { label: "Lifecycle Automation", href: "#what-you-get" },
      { label: "Email Sequences", href: "#what-you-get" },
      { label: "Customer Journey Mapping", href: "#what-you-get" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Free CRM Flow Generator", href: "/flow" },
      { label: "The Playbook", href: "/deck.html" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "#contact" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/108653018/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1248px] px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <img src="/logo-new.svg" alt="Journey Launcher" className="h-6 w-6" />
              JOURNEY LAUNCHER
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              CRM & Lifecycle Marketing Consultancy. Berlin.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wider">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={() => {
                        if (link.label === "Blog") trackEvent("click_blog", { location: "footer" });
                        if (link.label === "Free CRM Flow Generator") trackEvent("click_generate_flow", { location: "footer" });
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <p className="font-mono text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Journey Launcher. All rights reserved.
          </p>
          <a href="#" className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
