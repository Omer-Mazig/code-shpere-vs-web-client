import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SideCard } from "@/components/shared/side-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { useFollowUser } from "../hooks/use-follow-user";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type { SuggestedUser } from "../types";

const SUGGESTIONS_LIMIT = 4;

const SuggestedUserRow = ({ user }: { user: SuggestedUser }) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const { followMutation, unfollowMutation } = useFollowUser(user.id);
  // Suggestions only ever contain users the viewer doesn't follow yet,
  // so follow state is tracked locally after the action.
  const [isFollowing, setIsFollowing] = useState(false);

  const handleToggle = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
      setIsFollowing(false);
    } else {
      followMutation.mutate();
      setIsFollowing(true);
    }
  };

  const profilePath = `/profile/${user.id}`;

  return (
    <div className="flex items-center gap-2.5">
      <Link
        to={profilePath}
        className="shrink-0"
      >
        <UserAvatar
          user={user}
          className="transition-transform hover:scale-105"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={profilePath}
          className="block truncate text-sm font-medium transition-colors hover:text-primary"
        >
          {user.displayName ?? user.username}
        </Link>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          @{user.username} · {user.followersCount}{" "}
          {user.followersCount === 1 ? "follower" : "followers"}
        </p>
      </div>

      <Button
        variant={isFollowing ? "outline" : "secondary"}
        size="xs"
        className="shrink-0"
        onClick={handleToggle}
      >
        {isFollowing ? (
          <>
            <Check className="animate-scale-in" />
            Following
          </>
        ) : (
          <>
            <Plus />
            Follow
          </>
        )}
      </Button>
    </div>
  );
};

const RowsSkeleton = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: SUGGESTIONS_LIMIT }, (_, i) => (
      <div
        key={i}
        className="flex items-center gap-2.5"
      >
        <Skeleton className="size-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-1.5 h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

/** Right-rail card suggesting the most-followed users the viewer doesn't follow yet. */
export const WhoToFollowCard = () => {
  const { user } = useAuth();
  const { data, isPending, isError } = useQuery(
    usersQueryOptionsFactory.suggestions(SUGGESTIONS_LIMIT, user?.id),
  );

  if (isError || (data && data.items.length === 0)) return null;

  return (
    <SideCard kicker="who_to_follow">
      {isPending ? (
        <RowsSkeleton />
      ) : (
        <div className="stagger-children flex flex-col gap-4">
          {data?.items.map((suggested) => (
            <SuggestedUserRow
              key={suggested.id}
              user={suggested}
            />
          ))}
        </div>
      )}
    </SideCard>
  );
};
