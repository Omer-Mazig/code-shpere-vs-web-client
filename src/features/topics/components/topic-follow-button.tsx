import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { useFollowTopic } from "../hooks/use-follow-topic";

type TopicFollowButtonProps = {
  topicId: string;
  isFollowed: boolean;
};

export const TopicFollowButton = ({
  topicId,
  isFollowed,
}: TopicFollowButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const { followMutation, unfollowMutation } = useFollowTopic(topicId);
  const busy = followMutation.isPending || unfollowMutation.isPending;

  if (isFollowed) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="w-full sm:w-auto"
        disabled={busy}
        onClick={() => {
          if (!isAuthenticated) {
            openSignIn();
            return;
          }
          unfollowMutation.mutate();
        }}
      >
        Following
      </Button>
    );
  }

  return (
    <Button
        type="button"
        variant="secondary"
        size="xs"
        className="w-full sm:w-auto"
      disabled={busy}
      onClick={() => {
        if (!isAuthenticated) {
          openSignIn();
          return;
        }
        followMutation.mutate();
      }}
    >
      Follow
    </Button>
  );
};
