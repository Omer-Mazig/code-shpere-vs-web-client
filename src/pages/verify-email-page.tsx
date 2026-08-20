import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { AUTH_PATHS, FEED_PATHS } from "@/lib/routes.constants";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const token = searchParams.get("token") ?? "";

  const [error, setError] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(Boolean(token));

  React.useEffect(() => {
    if (!token) {
      setError("This verification link is missing a token.");
      setIsVerifying(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) {
          navigate(FEED_PATHS.FEED, { replace: true });
        }
      } catch (verifyError) {
        if (!cancelled) {
          setError(getAuthErrorMessage(verifyError));
          setIsVerifying(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate, token, verifyEmail]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="text-muted-foreground mt-1">
          {isVerifying
            ? "Confirming your account..."
            : "We could not verify this link."}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isVerifying && (
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link to={AUTH_PATHS.CHECK_EMAIL}>Request a new link</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={AUTH_PATHS.SIGN_IN}>Back to sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
