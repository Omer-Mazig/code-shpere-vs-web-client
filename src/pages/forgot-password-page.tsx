import React from "react";
import { useForm } from "@tanstack/react-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authApi } from "@/features/auth/auth.api";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";
import { forgotPasswordSchema } from "@/features/auth/auth.schemas";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";

export const ForgotPasswordPage = () => {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [devResetUrl, setDevResetUrl] = React.useState<string | undefined>();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setSuccessMessage(null);
      setDevResetUrl(undefined);
      try {
        const result = await authApi.forgotPassword(value.email);
        setSuccessMessage(result.message);
        setDevResetUrl(result.resetUrl);
      } catch (submitError) {
        const applied = applyApiFieldErrors(
          form,
          getApiError(submitError).details,
        );
        if (!applied) {
          setFormError(getAuthErrorMessage(submitError));
        }
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Forgot password</h2>
        <p className="text-muted-foreground mt-1">
          Enter your email and we&apos;ll send a reset link if an account
          exists.
        </p>
      </div>

      <form
        id="forgot-password-form"
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

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          {successMessage && (
            <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
              <p>{successMessage}</p>
              {devResetUrl && (
                <FieldDescription>
                  Dev reset link:{" "}
                  <a
                    href={devResetUrl}
                    className="text-primary underline break-all"
                  >
                    {devResetUrl}
                  </a>
                </FieldDescription>
              )}
            </div>
          )}

          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            )}
          />
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
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
