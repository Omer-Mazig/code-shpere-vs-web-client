import { Skeleton } from "@/components/ui/skeleton";

export const CommentsSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-3 py-3"
      >
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ))}
  </div>
);
