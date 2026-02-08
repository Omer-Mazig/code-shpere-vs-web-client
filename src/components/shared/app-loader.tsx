import { Skeleton } from "../ui/skeleton";

export const AppLoader = ({
  message = "Loading...",
}: {
  message?: string;
}) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 px-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
