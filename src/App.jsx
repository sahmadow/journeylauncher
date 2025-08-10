// src/App.jsx
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  function validateEmail(value) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");
      // Simulate network. Replace with your real waitlist endpoint.
      await new Promise((res) => setTimeout(res, 800));
      const key = "waitlist_emails";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      if (!existing.includes(email)) existing.push(email);
      localStorage.setItem(key, JSON.stringify(existing));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <Sparkles className="h-5 w-5" />
            <span className="text-lg">JourneyLauncher</span>
          </a>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Coming soon
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6">
        <section className="pt-16 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Built for idea validation</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-indigo-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                Test your idea. See if it works. Fast.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Got an idea? We help you run quick tests, find your first fans,
              and see if it’s worth building — no marketing skills needed.
            </p>

            {/* Email Signup */}
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row"
            >
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative w-full">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? "email-error" : undefined}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "loading" ? "Submitting…" : "Join the waitlist"}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-400">No spam. Unsubscribe anytime.</p>

            {status === "error" && (
              <p id="email-error" className="mt-2 text-sm text-rose-400" role="alert">
                {error}
              </p>
            )}
            {status === "success" && (
              <p
                className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                role="status"
                aria-live="polite"
              >
                Thanks! You're on the list. We'll email you at launch.
              </p>
            )}
          </motion.div>
        </section>

        {/* Pain Points (renamed to Problems, 3 only) */}
        <section id="pain" className="mx-auto mt-20 max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Why starting is hard
            </h2>
            <p className="mt-2 text-slate-400">
              These are what JourneyLauncher eliminates.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Don’t know if anyone cares",
                desc: "Unsure if your idea will actually get attention.",
              },
              {
                title: "Zero marketing skills",
                desc: "Ads, pages, and copy feel impossible to make.",
              },
              {
                title: "Tight budget",
                desc: "You need results without spending big.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-900/20 p-5 shadow-sm hover:shadow-md hover:shadow-black/20"
              >
                <div className="mb-3 inline-flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide text-rose-300/90">
                    CHALLENGE
                  </span>
                </div>
                <h3 className="text-lg font-medium text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solution (keep 3 pillars) */}
        <section id="solution" className="mx-auto mt-20 max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How your product solves it
            </h2>
            <p className="mt-2 text-slate-400">
              Crisp, outcome-focused solutions.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "We make it launch-ready",
                desc: "Share your idea; we turn it into ads and a landing page.",
              },
              {
                title: "Find your first fans",
                desc: "We put you in front of the right people and track interest.",
              },
              {
                title: "See what works",
                desc: "Get clear data on whether your idea’s worth building.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="mb-3 inline-flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide text-emerald-300/90">
                    Solution
                  </span>
                </div>
                <h3 className="text-lg font-medium text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Secondary CTA */}
          <div className="mt-10 rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-600/10 via-slate-900/40 to-fuchsia-600/10 p-6 text-center">
            <h3 className="text-xl font-semibold">Be first to try it</h3>
            <p className="mt-1 text-slate-300">
              Join the waitlist and we&apos;ll notify you the moment we launch.
            </p>
            <button
              onClick={() => document.getElementById("email")?.focus()}
              className="mt-4 rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Join the waitlist
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto mt-20 max-w-5xl pb-24">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              FAQ
            </h2>
            <p className="mt-2 text-slate-400">
              Short answers you can customize later.
            </p>
          </div>
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/40">
            {[
              {
                q: "What is JourneyLauncher?",
                a: "A simple tool to test ideas, find first fans, and collect leads before you build.",
              },
              {
                q: "Who is it for?",
                a: "Aspiring founders and creators with small budgets and no marketing skills.",
              },
              {
                q: "When will it launch?",
                a: "We’re working on it. Join the waitlist to be first to know.",
              },
            ].map((item, i) => (
              <details key={i} className="group px-6 py-4 open:bg-slate-900/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-slate-100">
                  <span className="text-base font-medium">{item.q}</span>
                  <span className="text-slate-500 group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="mt-2 text-sm text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-400 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} JourneyLauncher. All rights reserved.</p>
          <nav className="flex gap-4">
            <a href="#" className="hover:text-slate-200">Privacy</a>
            <a href="#" className="hover:text-slate-200">Terms</a>
            <a href="#" className="hover:text-slate-200">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
