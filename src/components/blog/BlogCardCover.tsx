"use client";

import {
  BarChart3,
  GitBranch,
  Mail,
  MousePointerClick,
  RefreshCw,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Zap,
  Bot,
  Layers,
  ArrowDownUp,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  funnel: ArrowDownUp,
  lifecycle: RefreshCw,
  mail: Mail,
  users: Users,
  target: Target,
  rocket: Rocket,
  chart: BarChart3,
  trending: TrendingUp,
  click: MousePointerClick,
  zap: Zap,
  bot: Bot,
  layers: Layers,
  git: GitBranch,
};

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #0F2A33 0%, #1a4a5a 50%, #2d6b7a 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #2d3436 0%, #636e72 100%)",
  "linear-gradient(135deg, #0F2A33 0%, #234e5c 40%, #3a7a8c 100%)",
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  "linear-gradient(135deg, #1c1c1c 0%, #383838 50%, #0F2A33 100%)",
];

interface BlogCardCoverProps {
  index: number;
  cover?: string;
  coverIcon?: string;
  tag?: string;
}

export function BlogCardCover({ index, cover, coverIcon, tag }: BlogCardCoverProps) {
  const Icon = coverIcon ? ICON_MAP[coverIcon] : null;
  const gradient = cover ?? CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <div
      className="relative flex h-52 items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Icon composition */}
      {Icon && (
        <div className="relative z-10 flex items-center justify-center">
          {/* Large background icon */}
          <Icon
            size={140}
            strokeWidth={0.5}
            className="absolute text-white/[0.08]"
          />
          {/* Main icon */}
          <Icon
            size={64}
            strokeWidth={1.2}
            className="text-white/70 drop-shadow-lg"
          />
        </div>
      )}

      {/* Tag badge */}
      {tag && (
        <span className="absolute bottom-4 left-5 z-10 rounded-full bg-white/20 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
          {tag}
        </span>
      )}
    </div>
  );
}
