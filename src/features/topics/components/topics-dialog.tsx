import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth.context";
import { topicsQueryOptionsFactory } from "../topics-query-options-factory";
import { TopicFollowButton } from "./topic-follow-button";

type TopicsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TopicsDialog = ({ open, onOpenChange }: TopicsDialogProps) => {
  const { user } = useAuth();
  const { data: topics, isPending, isError } = useQuery({
    ...topicsQueryOptionsFactory.list(user?.id),
    enabled: open,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Topics</DialogTitle>
          <DialogDescription>
            Follow curated topics. This does not change your home feed yet.
          </DialogDescription>
        </DialogHeader>

        {topics && topics.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.description}
                  </p>
                </div>
                <TopicFollowButton
                  topicId={topic.id}
                  isFollowed={topic.isFollowed}
                />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Could not load topics.
          </p>
        ) : isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-10 w-full"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No topics are available yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
