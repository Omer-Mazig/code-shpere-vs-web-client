import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/features/auth/auth.context";
import { cn } from "@/lib/utils";
import { MAX_TOPICS_PER_ITEM } from "../topics.constants";
import { topicsQueryOptionsFactory } from "../topics-query-options-factory";

type TopicPickerProps = {
  value: string[];
  onChange: (topicIds: string[]) => void;
  disabled?: boolean;
};

export const TopicPicker = ({
  value,
  onChange,
  disabled,
}: TopicPickerProps) => {
  const { user } = useAuth();
  const { data: topics = [] } = useQuery(
    topicsQueryOptionsFactory.list(user?.id),
  );
  const selected = topics.filter((topic) => value.includes(topic.id));
  const atCap = value.length >= MAX_TOPICS_PER_ITEM;

  const toggle = (topicId: string) => {
    if (value.includes(topicId)) {
      onChange(value.filter((id) => id !== topicId));
      return;
    }
    if (atCap) {
      return;
    }
    onChange([...value, topicId]);
  };

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((topic) => (
            <li key={topic.id}>
              <Badge
                variant="secondary"
                className="gap-1"
              >
                {topic.name}
                <button
                  type="button"
                  className="rounded-full outline-none hover:bg-muted"
                  aria-label={`Remove ${topic.name}`}
                  disabled={disabled}
                  onClick={() => toggle(topic.id)}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="w-full justify-between font-normal sm:w-64"
          >
            {value.length > 0
              ? `${value.length} of ${MAX_TOPICS_PER_ITEM} topics`
              : "Add topics"}
            <ChevronsUpDown className="size-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0"
        >
          <Command>
            <CommandInput placeholder="Search topics…" />
            <CommandList>
              <CommandEmpty>No topics found.</CommandEmpty>
              <CommandGroup>
                {topics.map((topic) => {
                  const isSelected = value.includes(topic.id);
                  const locked = atCap && !isSelected;
                  return (
                    <CommandItem
                      key={topic.id}
                      value={`${topic.name} ${topic.slug}`}
                      disabled={locked}
                      onSelect={() => toggle(topic.id)}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span>{topic.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Up to {MAX_TOPICS_PER_ITEM} from the curated list.
      </p>
    </div>
  );
};
