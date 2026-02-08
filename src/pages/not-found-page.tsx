import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FEED_PATHS } from "@/lib/routes.constants";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link to={FEED_PATHS.FEED}>
        <Button>Back to Feed</Button>
      </Link>
    </div>
  );
};
