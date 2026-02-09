import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isNotFoundError } from "@/lib/errors";
import { FEED_PATHS } from "@/lib/routes.constants";
import type { FallbackProps } from "react-error-boundary";

export const PageErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  if (isNotFoundError(error)) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Not Found</h2>
          <p className="max-w-md text-muted-foreground">
            The resource you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
        <Link to={FEED_PATHS.FEED}>
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground">{message}</p>
      </div>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  );
};
