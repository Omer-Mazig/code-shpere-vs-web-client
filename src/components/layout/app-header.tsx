import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Code2,
  Home,
  LogOut,
  Menu,
  PenSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/shared/mode-toggle";
import {
  getUserDisplayName,
  UserAvatar,
} from "@/components/shared/user-avatar";
import { useAuth } from "@/features/auth/auth.context";
import { useViewer } from "@/features/users/hooks/use-viewer";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import {
  FEED_PATHS,
  ARTICLE_PATHS,
  AUTH_PATHS,
  NOTIFICATION_PATHS,
} from "@/lib/routes.constants";
import { cn } from "@/lib/utils";

export const AppHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const viewer = useViewer();
  const chromeUser = viewer ?? user;
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const homePath = isAuthenticated ? FEED_PATHS.FEED : ARTICLE_PATHS.ARTICLES;

  const navItems = [
    ...(isAuthenticated
      ? [{ label: "Feed", path: FEED_PATHS.FEED, icon: Home }]
      : []),
    { label: "Articles", path: ARTICLE_PATHS.ARTICLES, icon: BookOpen },
    ...(isAuthenticated
      ? [
          {
            label: "Notifications",
            path: NOTIFICATION_PATHS.NOTIFICATIONS,
            icon: Bell,
          },
        ]
      : []),
  ];

  const profilePath = user ? `/profile/${user.id}` : AUTH_PATHS.SIGN_IN;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            to={homePath}
            className="group flex items-center gap-2"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-glow shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Code2 className="size-4 text-white" />
            </span>
            <span className="font-mono text-base font-semibold tracking-tight">
              code<span className="text-primary">_</span>sphere
              <span
                className="animate-caret-blink ml-0.5 text-primary"
                aria-hidden
              >
                ▍
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive(item.path) && "text-foreground",
                )}
              >
                {item.label}
                {/* Animated active indicator aligned with the header's bottom border */}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-3 h-0.5 origin-center rounded-full bg-linear-to-r from-primary to-glow transition-all duration-300",
                    isActive(item.path)
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0",
                  )}
                />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link to={ARTICLE_PATHS.CREATE_ARTICLE}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <PenSquare
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span className="sr-only sm:not-sr-only sm:inline">
                  Write
                </span>
              </Button>
            </Link>
          )}

          <NotificationBell />
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {isAuthenticated && chromeUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  aria-label={getUserDisplayName(chromeUser)}
                >
                  <UserAvatar
                    user={chromeUser}
                    size="sm"
                  />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {chromeUser.displayName ?? chromeUser.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to={profilePath}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to={AUTH_PATHS.SIGN_IN}
              className="hidden md:inline-flex"
            >
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      <Sheet
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      >
        <SheetContent
          side="left"
          className="w-72 p-0"
        >
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-primary to-glow">
                <Code2 className="size-3.5 text-white" />
              </span>
              <span className="font-mono font-semibold tracking-tight">
                code<span className="text-primary">_</span>sphere
              </span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive(item.path) && "bg-accent text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <Link
                to={profilePath}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  location.pathname.startsWith(`/profile/${user.id}`) &&
                    "bg-accent text-foreground",
                )}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            )}
          </nav>

          <div className="mt-auto flex items-center justify-between border-t p-4">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ModeToggle />
          </div>

          <div className="border-t p-4">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setMobileNavOpen(false);
                  void logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                className="w-full"
                asChild
              >
                <Link
                  to={AUTH_PATHS.SIGN_IN}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
