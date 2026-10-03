import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedList } from "@/features/saved/components/saved-list";

export const SavedPage = () => (
  <div className="container mx-auto max-w-2xl px-4 py-6">
    <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
    <p className="mt-1 text-sm text-muted-foreground">
      Posts and articles you saved. Only you can see them.
    </p>
    <div className="mt-6">
      <QueryBoundary
        fallback={
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        }
        ErrorFallback={InlineErrorFallback}
      >
        <SavedList />
      </QueryBoundary>
    </div>
  </div>
);
