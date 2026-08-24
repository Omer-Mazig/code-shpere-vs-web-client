import {
  Bookmark,
  CalendarDays,
  FileText,
  Hash,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { SideCard } from "@/components/shared/side-card";
import { useAuth } from "@/features/auth/auth.context";

/* Dummy quick actions below the profile card — real features come later */

const SHORTCUTS: { icon: LucideIcon; label: string }[] = [
  { icon: Bookmark, label: "Saved items" },
  { icon: FileText, label: "My drafts" },
  { icon: Hash, label: "Topics" },
  { icon: CalendarDays, label: "Events" },
];

export const ShortcutsCard = () => (
  <SideCard
    kicker="shortcuts"
    contentClassName="-mx-2 flex flex-col"
  >
    {SHORTCUTS.map(({ icon: Icon, label }) => (
      <button
        key={label}
        type="button"
        onClick={() => toast(`${label} is coming soon`)}
        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Icon className="size-4" />
        {label}
      </button>
    ))}
  </SideCard>
);

const STAT_ROWS = [
  { label: "Profile views", value: 17, delta: "+4 this week" },
  { label: "Post impressions", value: 142, delta: "+23 this week" },
];

/** Dummy analytics teaser, shown for signed-in users only. */
export const ProfileStatsCard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <SideCard
      kicker="your_stats"
      contentClassName="flex flex-col gap-3"
    >
      {STAT_ROWS.map((stat) => (
        <div
          key={stat.label}
          className="flex items-baseline justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">
              {stat.label}
            </p>
            <p className="font-mono text-[10px] text-glow">{stat.delta}</p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">
            {stat.value}
          </span>
        </div>
      ))}

      <button
        type="button"
        onClick={() => toast("Analytics is coming soon")}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <TrendingUp className="size-3.5" />
        View all analytics
      </button>
    </SideCard>
  );
};
