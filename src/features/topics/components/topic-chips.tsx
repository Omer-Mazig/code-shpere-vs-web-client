import { Badge } from "@/components/ui/badge";
import type { TopicPreview } from "../types";

type TopicChipsProps = {
  topics: TopicPreview[];
  className?: string;
};

export const TopicChips = ({ topics, className }: TopicChipsProps) => {
  if (topics.length === 0) {
    return null;
  }

  return (
    <ul className={className ?? "flex flex-wrap gap-1.5"}>
      {topics.map((topic) => (
        <li key={topic.id}>
          <Badge variant="secondary">{topic.name}</Badge>
        </li>
      ))}
    </ul>
  );
};
