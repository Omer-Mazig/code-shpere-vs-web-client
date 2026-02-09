import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { useFollowUser } from "../hooks/use-follow-user";

type FollowButtonProps = {
  userId: string;
  isFollowing: boolean;
};

export const FollowButton = ({ userId, isFollowing }: FollowButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const { followMutation, unfollowMutation } = useFollowUser(userId);

  // Don't show follow button for own profile
  if (user?.id === userId) return null;

  const handleClick = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
