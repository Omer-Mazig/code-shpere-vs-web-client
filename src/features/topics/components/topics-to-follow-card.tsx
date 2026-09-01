import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SideCard } from "@/components/shared/side-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth.context";
import { TOPIC_PATHS, topicDetailPath } from "@/lib/routes.constants";
import { topicsQueryOptionsFactory } from "../topics-query-options-factory";
import { TopicFollowButton } from "./topic-follow-button";

const SUGGESTIONS_LIMIT = 5;

const RowsSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: SUGGESTIONS_LIMIT }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-2"
      >
        <div className="flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-1.5 h-3 w-36" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const TopicsToFollowCard = () => {
  const { user } = useAuth();
  const { data, isPending, isError } = useQuery(
    topicsQueryOptionsFactory.list(user?.id),
  );

  const items = (data ?? [])
    .filter((topic) => !topic.isFollowed)
    .slice(0, SUGGESTIONS_LIMIT);

  if (items.length > 0) {
    return (
      <SideCard
        kicker="topics"
        action={
          <Link
            to={TOPIC_PATHS.TOPICS}
            className="text-xs font-medium text-muted-foreground hover:text-primary"
          >
            Browse all
          </Link>
        }
      >
        <div className="flex flex-col gap-3">
          {items.map((topic) => (
            <div
              key={topic.id}
              className="flex items-start gap-2"
            >
              <Link
                to={topicDetailPath(topic.slug)}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-medium hover:text-primary">
                  #{topic.name}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {topic.description}
                </p>
              </Link>
              <TopicFollowButton
                topicId={topic.id}
                isFollowed={topic.isFollowed}
              />
            </div>
          ))}
        </div>
      </SideCard>
    );
  }

  if (isError) {
    return null;
  }

  if (isPending) {
    return (
      <SideCard kicker="topics">
        <RowsSkeleton />
      </SideCard>
    );
  }

  return null;
};
