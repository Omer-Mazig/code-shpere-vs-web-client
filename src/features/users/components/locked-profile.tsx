import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { signInPathWithReturnUrl } from "@/features/auth/return-url";
import { AUTH_PATHS } from "@/lib/routes.constants";
import type { UserPreview } from "../types";

type LockedProfileProps = {
  preview: UserPreview;
};

export const LockedProfile = ({ preview }: LockedProfileProps) => {
  const location = useLocation();
  const returnUrl = `${location.pathname}${location.search}${location.hash}`;
  const name = preview.displayName ?? preview.username;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-10 text-center shadow-sm">
        <UserAvatar
          user={preview}
          size="lg"
          className="size-24"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{name}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          @{preview.username}
        </p>
        <div className="mt-6 flex size-10 items-center justify-center rounded-full bg-muted">
          <Lock className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Viewing this profile requires an account. Sign in to see posts,
          articles, and followers.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to={signInPathWithReturnUrl(returnUrl)}>Sign in</Link>
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link to={AUTH_PATHS.SIGN_UP}>Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
