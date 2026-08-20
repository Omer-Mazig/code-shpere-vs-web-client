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
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/features/auth/auth.context";
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
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { label: "Feed", path: FEED_PATHS.FEED, icon: Home },
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
            to="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <Code2 className="h-6 w-6" />
            <span>CodeSphere</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground",
                    isActive(item.path) && "text-foreground bg-accent",
                  )}
                >
                  {item.label}
                </Button>
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
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Write</span>
              </Button>
            </Link>
          )}

          <NotificationBell />
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <UserAvatar
                    user={user}
                    size="sm"
                  />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.displayName ?? user.username}
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
              <Code2 className="h-5 w-5" />
              CodeSphere
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
