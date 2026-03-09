"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";

const STAGES = [
  { label: "Acquire", color: "#00C978", icon: "↗" },
  { label: "Activate", color: "#00A8E8", icon: "⚡" },
  { label: "Engage", color: "#8B5CF6", icon: "💬" },
  { label: "Monetise", color: "#D49400", icon: "💰" },
  { label: "Retain", color: "#E05555", icon: "♻" },
];

const PARTICLE_COUNT = 40;

const METRICS = [
  { label: "Retention", value: "+34%" },
  { label: "LTV", value: "2.8×" },
  { label: "Churn", value: "-41%" },
];

/* ------------------------------------------------------------------ */
/*  Lifecycle Ring SVG                                                 */
/* ------------------------------------------------------------------ */

function LifecycleRing({
  activeStage,
  progress,
}: {
  activeStage: number;
  progress: number;
}) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 160;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        {STAGES.map((s, i) => (
          <radialGradient key={i} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-glow">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Orbit ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(15,42,51,0.08)"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />

      {/* Animated arc showing progress */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={STAGES[activeStage].color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${(progress * 2 * Math.PI * radius) / STAGES.length} ${2 * Math.PI * radius}`}
        strokeDashoffset={0}
        opacity="0.5"
        style={{
          transform: `rotate(${(activeStage * 360) / STAGES.length - 90}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: "stroke 0.6s ease",
        }}
      />

      {/* Stage nodes */}
      {STAGES.map((stage, i) => {
        const angle = (i * 2 * Math.PI) / STAGES.length - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const isActive = i === activeStage;
        const nodeRadius = isActive ? 36 : 24;

        return (
          <g
            key={i}
            style={{
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Glow behind active node */}
            {isActive && (
              <circle
                cx={x}
                cy={y}
                r={60}
                fill={`url(#glow-${i})`}
                filter="url(#blur-glow)"
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
              />
            )}

            {/* Node circle */}
            <circle
              cx={x}
              cy={y}
              r={nodeRadius}
              fill={isActive ? stage.color : "rgba(15,42,51,0.04)"}
              stroke={stage.color}
              strokeWidth={isActive ? 2.5 : 1}
              opacity={isActive ? 1 : 0.4}
              style={{
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            {/* Icon */}
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isActive ? 18 : 13}
              style={{
                transition: "all 0.4s ease",
                opacity: isActive ? 1 : 0.5,
              }}
            >
              {stage.icon}
            </text>

            {/* Label */}
            <text
              x={x}
              y={y + nodeRadius + 18}
              textAnchor="middle"
              fill={isActive ? stage.color : "rgba(15,42,51,0.35)"}
              fontSize={isActive ? 13 : 11}
              fontFamily="var(--font-sans)"
              fontWeight={isActive ? 700 : 400}
              letterSpacing="0.05em"
              style={{ transition: "all 0.4s ease", textTransform: "uppercase" }}
            >
              {stage.label}
            </text>
          </g>
        );
      })}

      {/* Center pulse */}
      <circle
        cx={cx}
        cy={cy}
        r={28}
        fill="rgba(15,42,51,0.03)"
        stroke="rgba(15,42,51,0.08)"
        strokeWidth="1"
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(15,42,51,0.5)"
        fontSize="10"
        fontFamily="var(--font-sans)"
        fontWeight="600"
        letterSpacing="0.15em"
        style={{ textTransform: "uppercase" }}
      >
        LTV
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Particles Canvas                                          */
/* ------------------------------------------------------------------ */

function FloatingParticles({ activeStage }: { activeStage: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      phase: number;
    }[]
  >([]);
  const color = STAGES[activeStage].color;

  useEffect(() => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useAnimationFrame((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const t = time * 0.001;

    particlesRef.current.forEach((p) => {
      p.x += p.vx + Math.sin(t + p.phase) * 0.15;
      p.y += p.vy + Math.cos(t + p.phase) * 0.1;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const pulse = Math.sin(t * 2 + p.phase) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.opacity * (0.5 + pulse * 0.5);
      ctx.fill();
    });

    // Draw connections
    ctx.globalAlpha = 1;
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const a = particlesRef.current[i];
        const b = particlesRef.current[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const cycleDuration = 3000;
    let start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / cycleDuration, 1);
      setProgress(p);
      if (p >= 1) {
        setActiveStage((prev) => (prev + 1) % STAGES.length);
        start = now;
        setProgress(0);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="hero-glow relative overflow-hidden py-28 md:py-40">
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 40%, ${STAGES[activeStage].color}06 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 70% 60%, ${STAGES[activeStage].color}04 0%, transparent 70%)
          `,
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <FloatingParticles activeStage={activeStage} />

      <div className="relative z-10 mx-auto flex max-w-[900px] flex-col items-center gap-8 px-6 text-center">
        {/* Tagline */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <span className="inline-block rounded-full border border-border px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            CRM & Lifecycle Marketing
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl font-bold leading-[1.08] tracking-tight md:text-[56px]"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          }}
        >
          Build Lifecycle Systems
          <br />
          That{" "}
          <span
            style={{
              color: STAGES[activeStage].color,
              transition: "color 0.6s ease",
            }}
          >
            {STAGES[activeStage].label}
          </span>
        </h1>

        {/* Lifecycle Ring */}
        <div
          className="my-4"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "scale(1)" : "scale(0.8)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
          }}
        >
          <LifecycleRing activeStage={activeStage} progress={progress} />
        </div>

        {/* Metric Chips */}
        <div
          className="flex flex-wrap justify-center gap-4"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s",
          }}
        >
          {METRICS.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-white/60 px-5 py-2.5 backdrop-blur-sm"
            >
              <span
                className="font-mono text-xl font-bold"
                style={{
                  color: STAGES[activeStage].color,
                  transition: "color 0.6s ease",
                }}
              >
                {m.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div
          className="mt-2 flex gap-3"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s",
          }}
        >
          <a
            href="https://calendly.com/saleh-journeylauncher/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              backgroundColor: STAGES[activeStage].color,
              transition: "background-color 0.6s ease, opacity 0.2s ease",
            }}
          >
            Book a Session ↗
          </a>
          <Link
            href="/flow"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-[#0F2A33] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a3d4a]"
          >
            Generate Free CRM Flow
          </Link>
        </div>
      </div>
    </section>
  );
}
