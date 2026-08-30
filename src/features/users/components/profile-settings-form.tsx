import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useBlocker } from "react-router-dom";
import { KeyRound, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  buildProfilePatch,
  isProfilePatchEmpty,
  profileFormValuesFromUser,
} from "../build-profile-patch";
import {
  buildNotificationPreferencesPatch,
  isNotificationPreferencesPatchEmpty,
} from "../build-notification-preferences-patch";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { NotificationPreferencesSettings } from "./notification-preferences-settings";
import { DeactivateAccountSettings } from "./deactivate-account-settings";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { useUpdateNotificationPreferences } from "../hooks/use-update-notification-preferences";
import { useDeactivateAccount } from "../hooks/use-deactivate-account";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import type { NotificationPreferences, UserProfile } from "../types";
import {
  isPasswordChangeRequested,
  settingsFormSchema,
  type SettingsFormValues,
} from "@/lib/form-schemas";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const ProfileSettingsSkeleton = () => (
  <div className="container mx-auto max-w-3xl px-4 py-6">
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
);

function settingsFormValuesFromLoaded(
  profile: UserProfile,
  prefs: NotificationPreferences,
): SettingsFormValues {
  return {
    ...profileFormValuesFromUser(profile),
    mentions: prefs.mentions,
    comments: prefs.comments,
    likes: prefs.likes,
    newFollowers: prefs.newFollowers,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };
}

function prefsFromSettingsValues(
  values: SettingsFormValues,
): NotificationPreferences {
  return {
    mentions: values.mentions,
    comments: values.comments,
    likes: values.likes,
    newFollowers: values.newFollowers,
  };
}

function isSettingsDirty(
  values: SettingsFormValues,
  loaded: SettingsFormValues,
): boolean {
  return (
    !isProfilePatchEmpty(buildProfilePatch(values, loaded)) ||
    !isNotificationPreferencesPatchEmpty(
      buildNotificationPreferencesPatch(
        prefsFromSettingsValues(values),
        prefsFromSettingsValues(loaded),
      ),
    ) ||
    isPasswordChangeRequested(values)
  );
}

const ProfileSettingsContent = () => {
  const { data: profile } = useSuspenseQuery(
    usersQueryOptionsFactory.myProfile(),
  );
  const { data: prefs } = useSuspenseQuery(
    usersQueryOptionsFactory.notificationPreferences(),
  );
  return (
    <ProfileSettingsForm
      key={profile.id}
      profile={profile}
      prefs={prefs}
    />
  );
};

export const ProfileSettings = () => (
  <QueryBoundary
    fallback={<ProfileSettingsSkeleton />}
    ErrorFallback={PageErrorFallback}
  >
    <ProfileSettingsContent />
  </QueryBoundary>
);

export const ProfileSettingsForm = ({
  profile,
  prefs,
}: {
  profile: UserProfile;
  prefs: NotificationPreferences;
}) => {
  const updateProfile = useUpdateProfile();
  const updatePrefs = useUpdateNotificationPreferences();
  const changePassword = useChangePassword();
  const deactivateAccount = useDeactivateAccount();
  const deactivatingRef = React.useRef(false);

  const loadedValues = React.useMemo(
    () => settingsFormValuesFromLoaded(profile, prefs),
    [profile, prefs],
  );
  const loadedValuesRef = React.useRef(loadedValues);
  loadedValuesRef.current = loadedValues;

  const form = useForm({
    defaultValues: loadedValues,
    validators: {
      onSubmit: settingsFormSchema,
    },
    onSubmit: async ({ value }) => {
      const loaded = loadedValuesRef.current;
      const profileDto = buildProfilePatch(value, loaded);
      const prefsDto = buildNotificationPreferencesPatch(
        prefsFromSettingsValues(value),
        prefsFromSettingsValues(loaded),
      );

      const wantsPassword = isPasswordChangeRequested(value);

      if (
        isProfilePatchEmpty(profileDto) &&
        isNotificationPreferencesPatchEmpty(prefsDto) &&
        !wantsPassword
      ) {
        form.reset(loaded);
        return;
      }

      try {
        if (!isProfilePatchEmpty(profileDto)) {
          await updateProfile.mutateAsync(profileDto);
        }
        if (!isNotificationPreferencesPatchEmpty(prefsDto)) {
          await updatePrefs.mutateAsync(prefsDto);
        }
        if (wantsPassword) {
          await changePassword.mutateAsync({
            currentPassword: value.currentPassword,
            newPassword: value.newPassword,
          });
        }
        form.setFieldValue("currentPassword", "");
        form.setFieldValue("newPassword", "");
        form.setFieldValue("confirmNewPassword", "");
        toast.success("Settings saved");
      } catch (submitError) {
        applyApiFieldErrors(form, getApiError(submitError).details);
        toast.error(
          getApiError(submitError).message ?? "Could not save settings.",
        );
      }
    },
  });

  React.useEffect(() => {
    form.reset(loadedValues);
  }, [loadedValues, form]);

  const values = useStore(form.store, (state) => state.values);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isDirty = isSettingsDirty(values, loadedValues);
  const isSaving =
    isSubmitting ||
    updateProfile.isPending ||
    updatePrefs.isPending ||
    changePassword.isPending;
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
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your public profile, password, and notifications.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">General info</h2>
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
                name="displayName"
                children={(field) => {
                  const invalid = isFieldInvalid(field);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                        placeholder="John Doe"
                      />
                      {invalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="bio"
                children={(field) => {
                  const invalid = isFieldInvalid(field);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                        rows={4}
                        placeholder="Tell the community about yourself..."
                      />
                      {invalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="location"
                  children={(field) => {
                    const invalid = isFieldInvalid(field);
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={invalid}
                          placeholder="San Francisco, CA"
                        />
                        {invalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="github"
                  children={(field) => {
                    const invalid = isFieldInvalid(field);
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>
                          GitHub username
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={invalid}
                          placeholder="johndoe"
                        />
                        {invalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="website"
                  children={(field) => {
                    const invalid = isFieldInvalid(field);
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={invalid}
                          placeholder="https://example.com"
                        />
                        {invalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="avatarUrl"
                  children={(field) => {
                    const invalid = isFieldInvalid(field);
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Avatar URL</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={invalid}
                          placeholder="https://..."
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
          </section>

          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">Password</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave these blank to keep your current password. Changing it signs
              other devices out.
            </p>

            <FieldGroup className="gap-4">
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
                      {invalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
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
                        <FieldLabel htmlFor={field.name}>
                          New password
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
          </section>

          <NotificationPreferencesSettings
            values={prefsFromSettingsValues(values)}
            disabled={isSaving || isDeactivating}
            onToggle={(key, checked) => form.setFieldValue(key, checked)}
          />

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
      </div>

      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") {
            blocker.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved settings. If you leave now, those changes will
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.reset();
                }
              }}
            >
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.proceed();
                }
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
