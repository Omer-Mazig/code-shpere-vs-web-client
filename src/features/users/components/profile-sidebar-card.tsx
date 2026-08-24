import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { AUTH_PATHS } from "@/lib/routes.constants";

/** IDE-window style banner with fake traffic-light controls. */
const CardBanner = () => (
  <div className="relative h-16 shrink-0 bg-linear-to-r from-primary via-purple-500 to-glow">
    <div className="bg-grid-dots absolute inset-0 opacity-30" />
    <div className="absolute top-2.5 left-3 flex gap-1.5">
      <span className="size-2 rounded-full bg-white/50" />
      <span className="size-2 rounded-full bg-white/35" />
      <span className="size-2 rounded-full bg-white/20" />
    </div>
  </div>
);

type StatLinkProps = {
  to: string;
  value: number;
  label: string;
};

const StatLink = ({ to, value, label }: StatLinkProps) => (
  <Link
    to={to}
    className="group flex flex-col items-center rounded-lg py-1.5 transition-colors hover:bg-accent"
  >
    <span className="text-sm font-semibold tabular-nums group-hover:text-primary">
      {value}
    </span>
    <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
      {label}
    </span>
  </Link>
);

const AuthedProfileCard = ({ userId }: { userId: string }) => {
  const { data: profile, isPending } = useQuery(
    usersQueryOptionsFactory.myProfile(),
  );

  if (isPending) {
    return (
      <Card className="gap-0 overflow-hidden py-0 pb-4">
        <CardBanner />
        <div className="relative px-4">
          <Skeleton className="-mt-7 size-14 rounded-full ring-4 ring-card" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (!profile) return null;

  const profilePath = `/profile/${userId}`;

  return (
    <Card className="animate-fade-up gap-0 overflow-hidden py-0 pb-3">
      <CardBanner />
      {/* relative so the overlapping avatar paints above the positioned banner */}
      <div className="relative px-4">
        <Link
          to={profilePath}
          className="inline-block"
        >
          <UserAvatar
            user={profile}
            size="lg"
            className="-mt-7 ring-4 ring-card transition-transform hover:scale-105"
          />
        </Link>

        <div className="mt-2">
          <Link
            to={profilePath}
            className="text-sm font-semibold transition-colors hover:text-primary"
          >
            {profile.displayName ?? profile.username}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {profile.bio}
            </p>
          )}
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-3 gap-1">
          <StatLink
            to={`${profilePath}/followers`}
            value={profile.followersCount}
            label="followers"
          />
          <StatLink
            to={`${profilePath}/following`}
            value={profile.followingCount}
            label="following"
          />
          <StatLink
            to={`${profilePath}/posts`}
            value={profile.postsCount ?? 0}
            label="posts"
          />
        </div>

        <Separator className="my-3" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to={profilePath}>
            View profile
            <ArrowRight
              className="size-3.5"
              data-icon="inline-end"
            />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

const GuestProfileCard = () => {
  const { open: openSignIn } = useSignInModal();

  return (
    <Card className="animate-fade-up gap-0 overflow-hidden py-0 pb-4">
      <CardBanner />
      <div className="relative px-4">
        <div className="-mt-7 flex size-14 items-center justify-center rounded-full bg-card ring-4 ring-card">
          <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-primary to-glow">
            <Sparkles className="size-6 text-white" />
          </div>
        </div>

        <h2 className="mt-3 text-sm font-semibold">
          Join the <span className="text-gradient-brand">CodeSphere</span>{" "}
          community
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Share what you're building, follow developers you admire, and keep up
          with the community.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => openSignIn()}
          >
            Sign in
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={AUTH_PATHS.SIGN_UP}>Create account</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

/** Left-rail identity card: profile summary when signed in, join CTA for guests. */
export const ProfileSidebarCard = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <AuthedProfileCard userId={user.id} />;
  }

  return <GuestProfileCard />;
};
