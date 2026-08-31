import { NavLink, Outlet } from "react-router-dom";
import { SETTINGS_PATHS } from "@/lib/routes.constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: SETTINGS_PATHS.ROOT, label: "Overview", end: true },
  { to: SETTINGS_PATHS.PROFILE, label: "Public profile", end: true },
  { to: SETTINGS_PATHS.ACCOUNT, label: "Account", end: true },
  { to: SETTINGS_PATHS.NOTIFICATIONS, label: "Notifications", end: true },
] as const;

export const SettingsLayout = () => (
  <div className="container mx-auto max-w-3xl px-4 py-6">
    <header className="mb-5 space-y-1">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Manage your public profile, account, and notifications.
      </p>
    </header>

    <nav
      aria-label="Settings"
      className="mb-5 flex flex-wrap gap-1"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);
