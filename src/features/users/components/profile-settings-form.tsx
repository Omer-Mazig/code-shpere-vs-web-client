import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { useBlocker } from "react-router-dom";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  buildProfilePatch,
  isProfilePatchEmpty,
  profileFormValuesFromUser,
} from "../build-profile-patch";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { useUpdateProfile } from "../hooks/use-update-profile";
import type { UserProfile } from "../types";
import { profileSettingsSchema } from "@/lib/form-schemas";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";
import { SettingsLeaveDialog } from "./settings-leave-dialog";

const SettingsSectionSkeleton = () => (
  <Skeleton className="h-96 w-full rounded-xl" />
);

const ProfileSettingsContent = () => {
  const { data: profile } = useSuspenseQuery(
    usersQueryOptionsFactory.myProfile(),
  );
  return (
    <ProfileSettingsForm
      key={profile.id}
      profile={profile}
    />
  );
};

export const ProfileSettings = () => (
  <QueryBoundary
    fallback={<SettingsSectionSkeleton />}
    ErrorFallback={PageErrorFallback}
  >
    <ProfileSettingsContent />
  </QueryBoundary>
);

export const ProfileSettingsForm = ({ profile }: { profile: UserProfile }) => {
  const updateProfile = useUpdateProfile();

  const loadedValues = React.useMemo(
    () => profileFormValuesFromUser(profile),
    [profile],
  );
  const loadedValuesRef = React.useRef(loadedValues);
  loadedValuesRef.current = loadedValues;

  const form = useForm({
    defaultValues: loadedValues,
    validators: {
      onSubmit: profileSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const loaded = loadedValuesRef.current;
      const profileDto = buildProfilePatch(value, loaded);

      if (isProfilePatchEmpty(profileDto)) {
        form.reset(loaded);
        return;
      }

      try {
        await updateProfile.mutateAsync(profileDto);
        toast.success("Profile saved");
      } catch (submitError) {
        applyApiFieldErrors(form, getApiError(submitError).details);
        toast.error(
          getApiError(submitError).message ?? "Could not save profile.",
        );
      }
    },
  });

  React.useEffect(() => {
    form.reset(loadedValues);
  }, [loadedValues, form]);

  const values = useStore(form.store, (state) => state.values);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isDirty = !isProfilePatchEmpty(buildProfilePatch(values, loadedValues));
  const isSaving = isSubmitting || updateProfile.isPending;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (!isDirty) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
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
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Public profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This is what other people see on your profile.
          </p>

          <FieldGroup className="gap-4">
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
                    {invalid && <FieldError errors={field.state.meta.errors} />}
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
                    {invalid && <FieldError errors={field.state.meta.errors} />}
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <SettingsLeaveDialog blocker={blocker} />
    </div>
  );
};
