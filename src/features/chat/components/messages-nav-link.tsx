import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/auth.context";
import { CHAT_PATHS } from "@/lib/routes.constants";
import { cn } from "@/lib/utils";
import { useUnreadChatCount } from "../hooks/use-unread-chat-count";

type MessagesNavLinkProps = {
  className?: string;
  onNavigate?: () => void;
};

export const MessagesNavLink = ({
  className,
  onNavigate,
}: MessagesNavLinkProps) => {
  const { isAuthenticated } = useAuth();
  const unreadQuery = useUnreadChatCount(isAuthenticated);
  const count = unreadQuery.data?.count ?? 0;

  return (
    <Link
      to={CHAT_PATHS.MESSAGES}
      onClick={onNavigate}
      className={cn("relative", className)}
    >
      <span className="inline-flex items-center gap-2">
        <MessageCircle className="h-4 w-4 md:hidden" />
        Messages
      </span>
      {count > 0 ? (
        <Badge
          aria-label={`${count} unread conversations`}
          className="absolute -right-3 -top-2 h-5 min-w-5 rounded-full px-1.5 text-[10px] md:-right-4"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      ) : null}
    </Link>
  );
};
