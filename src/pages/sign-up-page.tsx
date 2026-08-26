import React from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth.context";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getAuthErrorMessage } from "@/features/auth/auth.errors";
import { signUpSchema } from "@/features/auth/auth.schemas";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const result = await register({
          email: value.email,
          username: value.username,
          displayName: value.displayName,
          password: value.password,
        });
        const params = new URLSearchParams({ email: result.email });
        navigate(`${AUTH_PATHS.CHECK_EMAIL}?${params.toString()}`, {
          state: { verificationUrl: result.verificationUrl },
        });
      } catch (submitError) {
        const applied = applyApiFieldErrors(
          form,
          getApiError(submitError).details,
        );
        if (!applied) {
          setFormError(
            getAuthErrorMessage(
              submitError,
              "Registration failed. Please try again.",
            ),
          );
        }
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-muted-foreground mt-1">
          Join the CodeSphere developer community
        </p>
      </div>

      <form
        id="sign-up-form"
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
            name="username"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="johndoe"
                    autoComplete="username"
                  />
                  <FieldDescription>
                    Letters, numbers, underscores, and hyphens only.
                  </FieldDescription>
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="displayName"
            children={(field) => {
              const invalid = isFieldInvalid(field);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="John Doe"
                    autoComplete="name"
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
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="At least 8 characters, with a letter and a number"
                    autoComplete="new-password"
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
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
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
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            )}
          />
        </FieldGroup>
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
