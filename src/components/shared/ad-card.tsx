import { useState } from "react";
import {
  Bug,
  Rocket,
  ShieldCheck,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SideCard } from "@/components/shared/side-card";
import { cn } from "@/lib/utils";

type DummyAd = {
  id: string;
  sponsor: string;
  tagline: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  gradient: string;
};

const DUMMY_ADS: DummyAd[] = [
  {
    id: "devdeck",
    sponsor: "DevDeck",
    tagline: "Your terminal, superpowered.",
    description:
      "AI-assisted shell with inline docs, smart history, and zero config.",
    cta: "Try it free",
    icon: SquareTerminal,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    id: "shipfast",
    sponsor: "ShipFast CI",
    tagline: "Green builds in half the time.",
    description:
      "Parallel test sharding and remote caching for monorepos of any size.",
    cta: "Start shipping",
    icon: Rocket,
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
  },
  {
    id: "typesafe",
    sponsor: "TypeSafe Cloud",
    tagline: "Deploy with confidence.",
    description:
      "End-to-end typed infrastructure. Catch config drift before prod does.",
    cta: "Get started",
    icon: ShieldCheck,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
  },
  {
    id: "octotrack",
    sponsor: "OctoTrack",
    tagline: "Issue tracking that keeps up.",
    description:
      "Triage bugs straight from stack traces. Built for fast-moving teams.",
    cta: "See a demo",
    icon: Bug,
    gradient: "from-orange-500 via-amber-500 to-rose-500",
  },
];

/** Dummy "Promoted" card with a randomly picked fake dev-tool ad. */
export const AdCard = () => {
  const [ad] = useState(
    () => DUMMY_ADS[Math.floor(Math.random() * DUMMY_ADS.length)],
  );
  const Icon = ad.icon;

  return (
    <SideCard
      kicker="promoted"
      action={
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Ad
        </span>
      }
      contentClassName="flex flex-col gap-3"
    >
      <div
        className={cn(
          "relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br",
          ad.gradient,
        )}
      >
        <div className="bg-grid-dots absolute inset-0 opacity-40" />
        <div className="relative flex size-12 items-center justify-center rounded-xl bg-white/90 shadow-lg backdrop-blur-sm dark:bg-white/80">
          <Icon className="size-6 text-neutral-900" />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">{ad.sponsor}</p>
        <p className="text-sm text-foreground/90">{ad.tagline}</p>
        <p className="mt-1 text-xs text-muted-foreground">{ad.description}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          toast(`${ad.sponsor} is a demo ad`, {
            description: "Nothing to see here — this sponsor doesn't exist.",
          })
        }
      >
        {ad.cta}
      </Button>
    </SideCard>
  );
};
