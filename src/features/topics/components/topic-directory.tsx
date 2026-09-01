import { useSuspenseQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/features/auth/auth.context";
import { topicsQueryOptionsFactory } from "../topics-query-options-factory";
import { TopicCard } from "./topic-card";

export const TopicDirectorySkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton
        key={index}
        className="h-32 rounded-xl"
      />
    ))}
  </div>
);

export const TopicDirectory = () => {
  const { user } = useAuth();
  const { data: topics } = useSuspenseQuery(
    topicsQueryOptionsFactory.list(user?.id),
  );

  if (topics.length === 0) {
    return (
      <EmptyState
        icon={Hash}
        title="No topics yet"
        description="The curated catalog is empty in this environment."
      />
    );
  }

  const followed = topics.filter((topic) => topic.isFollowed);
  const rest = topics.filter((topic) => !topic.isFollowed);

  return (
    <div className="flex flex-col gap-8">
      {followed.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Following
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {followed.map((topic) => (
              <li key={topic.id}>
                <TopicCard topic={topic} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        {followed.length > 0 ? (
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            All topics
          </h2>
        ) : null}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rest.map((topic) => (
            <li key={topic.id}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
