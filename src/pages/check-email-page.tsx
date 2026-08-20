import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";

type CheckEmailState = {
  verificationUrl?: string;
};

export const CheckEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { resendVerification } = useAuth();
  const email = searchParams.get("email") ?? "";
  const initialUrl = (location.state as CheckEmailState | null)?.verificationUrl;

  const [verificationUrl, setVerificationUrl] = React.useState(initialUrl);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  const handleResend = async () => {
    if (!email) {
      setError("Add your email address on the sign-up page first.");
      return;
    }

    setError(null);
    setStatus(null);
    setIsSending(true);

    try {
      const result = await resendVerification(email);
      setVerificationUrl(result.verificationUrl);
      setStatus(result.message);
    } catch (resendError) {
      setError(getAuthErrorMessage(resendError));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-muted-foreground mt-1">
          {email
            ? `We sent a verification link to ${email}.`
            : "We sent a verification link to your email."}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        In local development the link is also printed in the API terminal. The
        link expires after 24 hours.
      </p>

      {verificationUrl && (
        <a
          href={verificationUrl}
          className="text-sm text-primary hover:underline font-medium break-all"
        >
          Open verification link (dev)
        </a>
      )}

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        variant="outline"
        onClick={handleResend}
        disabled={isSending || !email}
      >
        {isSending ? "Sending..." : "Resend verification email"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link
          to={AUTH_PATHS.SIGN_IN}
          className="text-primary hover:underline font-medium"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};
