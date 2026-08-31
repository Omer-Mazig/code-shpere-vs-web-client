import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useBlocker } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { DeactivateAccountSettings } from "./deactivate-account-settings";
import { SettingsLeaveDialog } from "./settings-leave-dialog";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { useDeactivateAccount } from "../hooks/use-deactivate-account";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import type { UserProfile } from "../types";
import {
  accountSettingsSchema,
  isPasswordChangeRequested,
  type AccountSettingsFormValues,
} from "@/lib/form-schemas";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const emptyPasswordValues: AccountSettingsFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const SettingsSectionSkeleton = () => (
  <Skeleton className="h-96 w-full rounded-xl" />
);

const AccountSettingsContent = () => {
  const { data: profile } = useSuspenseQuery(
    usersQueryOptionsFactory.myProfile(),
  );
  return <AccountSettingsForm profile={profile} />;
};

export const AccountSettings = () => (
  <QueryBoundary
    fallback={<SettingsSectionSkeleton />}
    ErrorFallback={PageErrorFallback}
  >
    <AccountSettingsContent />
  </QueryBoundary>
);

export const AccountSettingsForm = ({ profile }: { profile: UserProfile }) => {
  const changePassword = useChangePassword();
  const deactivateAccount = useDeactivateAccount();
  const deactivatingRef = React.useRef(false);

  const form = useForm({
    defaultValues: emptyPasswordValues,
    validators: {
      onSubmit: accountSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isPasswordChangeRequested(value)) {
        form.reset(emptyPasswordValues);
        return;
      }

      try {
        await changePassword.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        });
        form.reset(emptyPasswordValues);
        toast.success("Password updated");
      } catch (submitError) {
        applyApiFieldErrors(form, getApiError(submitError).details);
        toast.error(
          getApiError(submitError).message ?? "Could not update password.",
        );
      }
    },
  });

  const values = useStore(form.store, (state) => state.values);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isDirty = isPasswordChangeRequested(values);
  const isSaving = isSubmitting || changePassword.isPending;
  const isDeactivating = deactivateAccount.isPending;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !deactivatingRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (!isDirty) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (deactivatingRef.current) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  return (
    <div className="space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Account</h2>
          </div>

          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                value={profile.email ?? ""}
                readOnly
                disabled
              />
              <FieldDescription>
                Your email is private and is not shown on your public profile.
              </FieldDescription>
            </Field>

            <form.Field
              name="currentPassword"
              children={(field) => {
                const invalid = isFieldInvalid(field);
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current password
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="newPassword"
                children={(field) => {
                  const invalid = isFieldInvalid(field);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="confirmNewPassword"
                children={(field) => {
                  const invalid = isFieldInvalid(field);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm new password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>
          </FieldGroup>
          <p className="text-sm text-muted-foreground">
            Leave password fields blank to keep your current password. Changing
            it signs other devices out.
          </p>
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isSaving || isDeactivating}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <DeactivateAccountSettings
        disabled={isSaving || isDeactivating}
        isPending={isDeactivating}
        onConfirm={() => {
          deactivatingRef.current = true;
          void deactivateAccount.mutateAsync().catch((deactivateError) => {
            deactivatingRef.current = false;
            toast.error(
              getApiError(deactivateError).message ??
                "Could not deactivate your account.",
            );
          });
        }}
      />

      <SettingsLeaveDialog blocker={blocker} />
    </div>
  );
};
