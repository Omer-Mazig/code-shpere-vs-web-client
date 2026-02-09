import { Button } from "@/components/ui/button";
import type { FallbackProps } from "react-error-boundary";

export const InlineErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </div>
  );
};
