import { Link, useLocation } from "react-router-dom";
import { Code2, LogOut, User, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { useAuth } from "@/features/auth/auth.context";
import { FEED_PATHS, ARTICLE_PATHS, AUTH_PATHS } from "@/lib/routes.constants";
import { cn } from "@/lib/utils";

export const AppHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Feed", path: FEED_PATHS.FEED },
    { label: "Articles", path: ARTICLE_PATHS.ARTICLES },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Code2 className="h-6 w-6" />
            <span>CodeSphere</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground",
                    location.pathname.startsWith(item.path) &&
                      "text-foreground bg-accent",
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link to={ARTICLE_PATHS.CREATE_ARTICLE}>
              <Button variant="outline" size="sm" className="gap-2">
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Write</span>
              </Button>
            </Link>
          )}

          <ModeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {user.displayName?.[0]?.toUpperCase() ??
                      user.username[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.displayName ?? user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to={`/profile/${user.id}`}
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
            <Link to={AUTH_PATHS.SIGN_IN}>
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
