import { Link } from "react-router-dom";
import { Bell, ChevronRight, KeyRound, UserRound } from "lucide-react";
import { SETTINGS_PATHS } from "@/lib/routes.constants";

const SECTIONS = [
  {
    to: SETTINGS_PATHS.PROFILE,
    title: "Public profile",
    description: "Display name, bio, links, and the photo others see.",
    icon: UserRound,
  },
  {
    to: SETTINGS_PATHS.ACCOUNT,
    title: "Account",
    description: "Email, password, and account deactivation.",
    icon: KeyRound,
  },
  {
    to: SETTINGS_PATHS.NOTIFICATIONS,
    title: "Notifications",
    description: "Choose which activity creates an in-app notification.",
    icon: Bell,
  },
] as const;

export const SettingsHub = () => (
  <ul className="space-y-3">
    {SECTIONS.map((section) => {
      const Icon = section.icon;
      return (
        <li key={section.to}>
          <Link
            to={section.to}
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block font-medium">{section.title}</span>
              <span className="block text-sm text-muted-foreground">
                {section.description}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      );
    })}
  </ul>
);
