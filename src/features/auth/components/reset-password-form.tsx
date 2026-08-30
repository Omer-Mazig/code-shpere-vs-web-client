import React from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authApi } from "@/features/auth/auth.api";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";
import { resetPasswordSchema } from "@/features/auth/auth.schemas";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = React.useState<string | null>(
    token ? null : "This reset link is missing a token.",
  );

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setFormError("This reset link is missing a token.");
        return;
      }

      setFormError(null);
      try {
        await authApi.resetPassword(token, value.password);
        navigate(AUTH_PATHS.SIGN_IN, {
          replace: true,
          state: { passwordReset: true },
        });
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
        <h2 className="text-2xl font-bold">Choose a new password</h2>
        <p className="text-muted-foreground mt-1">
          Use at least 8 characters with a letter and a number.
        </p>
      </div>

      <form
        id="reset-password-form"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-4">
          <form.Field
            name="password"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    autoComplete="new-password"
                    disabled={!token}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    autoComplete="new-password"
                    disabled={!token}
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
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            )}
          />
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          to={AUTH_PATHS.FORGOT_PASSWORD}
          className="text-primary hover:underline font-medium"
        >
          Request a new link
        </Link>
        {" · "}
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
