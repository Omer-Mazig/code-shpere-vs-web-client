import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RelativeTimeProps = {
  date: string | Date;
  className?: string;
};

export const RelativeTime = ({ date, className }: RelativeTimeProps) => {
  const parsed = new Date(date);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={parsed.toISOString()}
          className={cn("cursor-default", className)}
        >
          {formatDistanceToNow(parsed, { addSuffix: true })}
        </time>
      </TooltipTrigger>
      <TooltipContent>{format(parsed, "PPpp")}</TooltipContent>
    </Tooltip>
  );
};
