import { useParams } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth.context";
import { TopicHub } from "@/features/topics/components/topic-hub";
import { topicsQueryOptionsFactory } from "@/features/topics/topics-query-options-factory";

export const TopicHubSkeleton = () => (
  <div className="container mx-auto max-w-3xl px-4 py-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="mt-3 h-4 w-full max-w-lg" />
    <Skeleton className="mt-6 h-9 w-56" />
    <Skeleton className="mt-8 h-40 w-full" />
  </div>
);

export const TopicHubPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: topic } = useSuspenseQuery(
    topicsQueryOptionsFactory.bySlug(slug ?? "", user?.id),
  );

  return <TopicHub topic={topic} />;
};
