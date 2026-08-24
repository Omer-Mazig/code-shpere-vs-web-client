import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SideCardProps = {
  /** Rendered as a mono-font, code-comment style header: `// kicker` */
  kicker: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

/**
 * Rail card shell with an IDE-flavored `// comment` header.
 * Used by all sidebar cards on the feed page.
 */
export const SideCard = ({
  kicker,
  action,
  className,
  contentClassName,
  children,
}: SideCardProps) => {
  return (
    <Card
      size="sm"
      className={cn("gap-3", className)}
    >
      <CardHeader>
        <CardTitle className="font-mono text-xs font-medium tracking-wide text-muted-foreground">
          <span
            className="text-primary"
            aria-hidden
          >
            {"// "}
          </span>
          {kicker}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
};
