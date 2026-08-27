import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/features/auth/auth.context";
import { useFollowUser } from "../hooks/use-follow-user";

type FollowButtonProps = {
  userId: string;
  isFollowing: boolean;
  allowUnfollow?: boolean;
};

export const FollowingBadge = () => (
  <Badge variant="secondary">Following</Badge>
);

export const FollowButton = ({
  userId,
  isFollowing,
  allowUnfollow = false,
}: FollowButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const { followMutation, unfollowMutation } = useFollowUser(userId);

  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  if (isFollowing && !allowUnfollow) {
    return <FollowingBadge />;
  }

  if (isFollowing && allowUnfollow) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={unfollowMutation.isPending}
          >
            Following
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfollow this user?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer see their posts in your feed. You can follow
              them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={unfollowMutation.isPending}
              onClick={() => unfollowMutation.mutate()}
            >
              Unfollow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      size="sm"
      disabled={followMutation.isPending}
      onClick={() => followMutation.mutate()}
    >
      Follow
    </Button>
  );
};
