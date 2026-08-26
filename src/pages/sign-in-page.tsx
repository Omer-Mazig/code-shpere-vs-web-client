import { useForm } from "@tanstack/react-form";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth.context";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";
import { signInSchema } from "@/features/auth/auth.schemas";
import { readReturnUrl } from "@/features/auth/return-url";
import { isFieldInvalid } from "@/lib/form";
import React from "react";

export const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);
  const returnUrl = readReturnUrl(searchParams, location.state);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await login(value.email, value.password);
        navigate(returnUrl, { replace: true });
      } catch (submitError) {
        setFormError(getAuthErrorMessage(submitError));
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground mt-1">
          Sign in to your CodeSphere account
        </p>
      </div>

      <form
        id="sign-in-form"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-4">
          <form.Field
            name="email"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      to={AUTH_PATHS.FORGOT_PASSWORD}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            )}
          />
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to={AUTH_PATHS.SIGN_UP}
          className="text-primary hover:underline font-medium"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};
