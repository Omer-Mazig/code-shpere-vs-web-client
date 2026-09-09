import React from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { isFieldInvalid } from "@/lib/form";
import { getApiError } from "@/lib/errors";
import { chatMessageSchema } from "../chat.schemas";
import { useSendMessage } from "../hooks/use-send-message";
import { useChatSocket } from "../chat-socket.context";

type ChatComposerProps = {
  conversationId: string;
};

export const ChatComposer = ({ conversationId }: ChatComposerProps) => {
  const sendMessage = useSendMessage(conversationId);
  const { socket } = useChatSocket();
  const lastTypedAtRef = React.useRef(0);

  const form = useForm({
    defaultValues: { body: "" },
    validators: { onSubmit: chatMessageSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendMessage.mutateAsync({ body: value.body.trim() });
        form.reset();
      } catch (error) {
        toast.error(getApiError(error).message ?? "Could not send message");
      }
    },
  });

  const body = useStore(form.store, (state) => state.values.body);
  const submitting = useStore(form.store, (state) => state.isSubmitting);
  const canSend = body.trim().length > 0 && !submitting && !sendMessage.isPending;

  const emitTyping = () => {
    const now = Date.now();
    if (now - lastTypedAtRef.current < 400) {
      return;
    }
    lastTypedAtRef.current = now;
    socket?.emit("typing", { conversationId });
  };

  return (
    <form
      className="flex items-end gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="body"
        children={(field) => {
          const invalid = isFieldInvalid(field);
          return (
            <Field data-invalid={invalid} className="min-w-0 flex-1">
              <Textarea
                id={field.name}
                name={field.name}
                rows={1}
                placeholder="Write a message…"
                value={field.state.value}
                aria-invalid={invalid}
                className="min-h-11 max-h-32 field-sizing-content resize-none"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  emitTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void form.handleSubmit();
                  }
                }}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!canSend}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
