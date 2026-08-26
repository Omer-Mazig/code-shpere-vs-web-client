import React from "react";
import { useForm } from "@tanstack/react-form";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useSignInModal } from "../sign-in-modal.context";
import { useAuth } from "../auth.context";
import { getAuthErrorMessage } from "../auth.errors";
import { signInSchema } from "../auth.schemas";
import { AUTH_PATHS } from "@/lib/routes.constants";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";

export const SignInModal = () => {
  const { isOpen, close } = useSignInModal();
  const { login } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

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
        close();
        form.reset();
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
          setFormError(null);
          form.reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to interact with content on CodeSphere.
          </DialogDescription>
        </DialogHeader>

        <form
          id="sign-in-modal-form"
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
                    <FieldLabel htmlFor={`modal-${field.name}`}>Email</FieldLabel>
                    <Input
                      id={`modal-${field.name}`}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                      <FieldLabel htmlFor={`modal-${field.name}`}>
                        Password
                      </FieldLabel>
                      <Link
                        to={AUTH_PATHS.FORGOT_PASSWORD}
                        onClick={close}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id={`modal-${field.name}`}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                <Button type="submit" disabled={isSubmitting}>
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
            onClick={close}
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
};
