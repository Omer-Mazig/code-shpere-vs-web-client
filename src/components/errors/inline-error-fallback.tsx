import { Button } from "@/components/ui/button";
import { getDisplayErrorMessage } from "@/lib/errors";
import type { FallbackProps } from "react-error-boundary";

export const InlineErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const message = getDisplayErrorMessage(error);

  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </div>
  );
};
