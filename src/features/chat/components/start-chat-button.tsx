import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getApiError } from "@/lib/errors";
import { CHAT_PATHS, chatThreadPath } from "@/lib/routes.constants";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { useChatDockOptional } from "../chat-dock.context";
import { useCreateConversation } from "../hooks/use-create-conversation";

type StartChatButtonProps = {
  userId: string;
};

export const StartChatButton = ({ userId }: StartChatButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const navigate = useNavigate();
  const location = useLocation();
  const dock = useChatDockOptional();
  const createConversation = useCreateConversation();

  if (user?.id === userId) {
    return null;
  }

  const handleClick = async () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({ userId });
      const preferFullPage =
        window.matchMedia("(max-width: 767px)").matches ||
        location.pathname.startsWith(CHAT_PATHS.MESSAGES);
      if (!preferFullPage && dock) {
        dock.openThread(conversation.id);
        return;
      }
      navigate(chatThreadPath(conversation.id));
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not start a conversation");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={createConversation.isPending}
      onClick={() => void handleClick()}
    >
      <Mail className="h-4 w-4" />
      Message
    </Button>
  );
};
