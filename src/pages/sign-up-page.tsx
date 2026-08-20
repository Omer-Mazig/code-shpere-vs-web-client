import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth.context";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";
import { signUpSchema } from "@/features/auth/auth.schemas";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse({
      email,
      username,
      displayName,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        email: parsed.data.email,
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        password: parsed.data.password,
      });
      const params = new URLSearchParams({ email: result.email });
      navigate(`${AUTH_PATHS.CHECK_EMAIL}?${params.toString()}`, {
        state: { verificationUrl: result.verificationUrl },
      });
    } catch (submitError) {
      setError(
        getAuthErrorMessage(submitError, "Registration failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-muted-foreground mt-1">
          Join the CodeSphere developer community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters, with a letter and a number"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
