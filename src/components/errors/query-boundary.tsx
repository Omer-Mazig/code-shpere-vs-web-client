import { Suspense, type ReactNode, type ComponentType } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

type QueryBoundaryProps = {
  fallback: ReactNode;
  ErrorFallback: ComponentType<FallbackProps>;
  resetKeys?: unknown[];
  children: ReactNode;
};

export const QueryBoundary = ({
  fallback,
  ErrorFallback,
  resetKeys,
  children,
}: QueryBoundaryProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        FallbackComponent={ErrorFallback}
        resetKeys={resetKeys}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
