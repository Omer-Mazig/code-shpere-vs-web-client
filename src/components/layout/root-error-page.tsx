import { Button } from "@/components/ui/button";

interface RootErrorPageProps {
  error?: unknown;
}

export const RootErrorPage = ({ error }: RootErrorPageProps) => {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground">{errorMessage}</p>
      </div>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
};
