import { Link } from "react-router-dom";
import { TopicFollowButton } from "./topic-follow-button";
import { topicDetailPath } from "@/lib/routes.constants";
import type { Topic } from "../types";

type TopicCardProps = {
  topic: Topic;
};

export const TopicCard = ({ topic }: TopicCardProps) => (
  <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
    <Link
      to={topicDetailPath(topic.slug)}
      className="min-w-0"
    >
      <p className="font-medium hover:text-primary">#{topic.name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {topic.description}
      </p>
    </Link>
    <div>
      <TopicFollowButton
        topicId={topic.id}
        isFollowed={topic.isFollowed}
      />
    </div>
  </div>
);
