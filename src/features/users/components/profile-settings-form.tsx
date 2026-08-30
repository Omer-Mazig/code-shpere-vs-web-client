import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { UserRound } from "lucide-react";
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
  buildProfilePatch,
  isProfilePatchEmpty,
  profileFormValuesFromUser,
  type ClearableProfileField,
} from "../build-profile-patch";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { useUpdateProfile } from "../hooks/use-update-profile";
import type { UserProfile } from "../types";
import { profileSettingsSchema } from "@/lib/form-schemas";
import { getApiError } from "@/lib/errors";
import { applyApiFieldErrors, isFieldInvalid } from "@/lib/form";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const ProfileSettingsSkeleton = () => (
  <div className="container mx-auto max-w-3xl px-4 py-6">
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
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
    fallback={<ProfileSettingsSkeleton />}
    ErrorFallback={PageErrorFallback}
  >
    <ProfileSettingsContent />
  </QueryBoundary>
);

export const ProfileSettingsForm = ({
  profile,
}: {
  profile: UserProfile;
}) => {
  const updateProfile = useUpdateProfile();
  const [cleared, setCleared] = React.useState<Set<ClearableProfileField>>(
    () => new Set(),
  );

  const loadedValues = React.useMemo(
    () => profileFormValuesFromUser(profile),
    [profile],
  );
  const loadedValuesRef = React.useRef(loadedValues);
  const clearedRef = React.useRef(cleared);
  loadedValuesRef.current = loadedValues;
  clearedRef.current = cleared;

  const form = useForm({
    defaultValues: loadedValues,
    validators: {
      onSubmit: profileSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const dto = buildProfilePatch(
        value,
        loadedValuesRef.current,
        clearedRef.current,
      );
      if (isProfilePatchEmpty(dto)) {
        form.reset(loadedValuesRef.current);
        setCleared(new Set());
        return;
      }
      try {
        await updateProfile.mutateAsync(dto);
        setCleared(new Set());
      } catch (submitError) {
        applyApiFieldErrors(form, getApiError(submitError).details);
      }
    },
  });

  React.useEffect(() => {
    form.reset(loadedValues);
    setCleared(new Set());
  }, [loadedValues, form]);

  const markCleared = (field: ClearableProfileField) => {
    setCleared((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  const unmarkCleared = (field: ClearableProfileField) => {
    setCleared((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your public profile.
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
            <p className="text-sm text-muted-foreground">
              Emptying a field and saving leaves the previous value. Use Clear
              to remove it.
            </p>

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
                      <ClearableFieldHeader
                        htmlFor={field.name}
                        label="Bio"
                        showClear={canClearField(
                          loadedValues.bio,
                          field.state.value,
                        )}
                        onClear={() => {
                          field.handleChange("");
                          markCleared("bio");
                        }}
                      />
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          unmarkCleared("bio");
                          field.handleChange(event.target.value);
                        }}
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
                        <ClearableFieldHeader
                          htmlFor={field.name}
                          label="Location"
                          showClear={canClearField(
                            loadedValues.location,
                            field.state.value,
                          )}
                          onClear={() => {
                            field.handleChange("");
                            markCleared("location");
                          }}
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            unmarkCleared("location");
                            field.handleChange(event.target.value);
                          }}
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
                        <ClearableFieldHeader
                          htmlFor={field.name}
                          label="GitHub username"
                          showClear={canClearField(
                            loadedValues.github,
                            field.state.value,
                          )}
                          onClear={() => {
                            field.handleChange("");
                            markCleared("github");
                          }}
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            unmarkCleared("github");
                            field.handleChange(event.target.value);
                          }}
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
                        <ClearableFieldHeader
                          htmlFor={field.name}
                          label="Website"
                          showClear={canClearField(
                            loadedValues.website,
                            field.state.value,
                          )}
                          onClear={() => {
                            field.handleChange("");
                            markCleared("website");
                          }}
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            unmarkCleared("website");
                            field.handleChange(event.target.value);
                          }}
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
                        <ClearableFieldHeader
                          htmlFor={field.name}
                          label="Avatar URL"
                          showClear={canClearField(
                            loadedValues.avatarUrl,
                            field.state.value,
                          )}
                          onClear={() => {
                            field.handleChange("");
                            markCleared("avatarUrl");
                          }}
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            unmarkCleared("avatarUrl");
                            field.handleChange(event.target.value);
                          }}
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
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || updateProfile.isPending}
                >
                  {isSubmitting || updateProfile.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

function canClearField(loadedValue: string, currentValue: string) {
  return loadedValue.trim().length > 0 || currentValue.trim().length > 0;
}

function ClearableFieldHeader({
  htmlFor,
  label,
  showClear,
  onClear,
}: {
  htmlFor: string;
  label: string;
  showClear: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {showClear ? (
        <Button type="button" variant="ghost" size="xs" onClick={onClear}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
