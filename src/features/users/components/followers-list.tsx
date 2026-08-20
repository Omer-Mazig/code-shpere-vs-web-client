import { Link } from "react-router-dom";
import type { FollowUser } from "../types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

type FollowersListProps = {
  users: FollowUser[];
  emptyMessage?: string;
};

export const FollowersList = ({
  users,
  emptyMessage = "No users to show.",
}: FollowersListProps) => {
  if (!users.length) {
    return (
      <EmptyState
        icon={Users}
        title={emptyMessage}
        className="py-8"
      />
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <Link
          key={user.id}
          to={`/profile/${user.id}`}
          className="flex items-center gap-3 py-3 hover:bg-accent/50 rounded px-2 transition-colors"
        >
          <UserAvatar
            user={user}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.displayName ?? user.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user.username}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
