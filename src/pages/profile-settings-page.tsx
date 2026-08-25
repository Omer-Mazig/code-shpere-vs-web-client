import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Bell, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth.context";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useUpdateProfile } from "@/features/users/hooks/use-update-profile";
import { profileSettingsSchema } from "@/lib/form-schemas";
import { isFieldInvalid } from "@/lib/form";

export const ProfileSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const updateProfile = useUpdateProfile();
  const isOwnProfile = Boolean(id && isAuthenticated && user?.id === id);

  const { data: profile, isLoading } = useQuery({
    ...usersQueryOptionsFactory.myProfile(),
    enabled: isOwnProfile,
  });

  const [notifyMentions, setNotifyMentions] = React.useState(true);
  const [notifyFollowers, setNotifyFollowers] = React.useState(true);
  const [notifyComments, setNotifyComments] = React.useState(true);

  const form = useForm({
    defaultValues: {
      displayName: "",
      bio: "",
      location: "",
      website: "",
      github: "",
      avatarUrl: "",
    },
    validators: {
      onSubmit: profileSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      await updateProfile.mutateAsync({
        displayName: value.displayName || undefined,
        bio: value.bio || undefined,
        location: value.location || undefined,
        website: value.website || undefined,
        github: value.github || undefined,
        avatarUrl: value.avatarUrl || undefined,
      });
    },
  });

  React.useEffect(() => {
    if (!profile) return;
    form.reset({
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      website: profile.website ?? "",
      github: profile.github ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    });
  }, [profile, form]);

  if (!id) {
    return <Navigate to="/feed" replace />;
  }

  if (!isOwnProfile) {
    return <Navigate to={`/profile/${id}/posts`} replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Unable to load settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage profile and account preferences.
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
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">Notification management</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Preference toggles are temporarily local-only. Backend persistence
              will be wired in a future step.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Mentions</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when someone mentions you in posts or comments.
                  </p>
                </div>
                <Switch
                  checked={notifyMentions}
                  onCheckedChange={setNotifyMentions}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">New followers</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when a new user follows you.
                  </p>
                </div>
                <Switch
                  checked={notifyFollowers}
                  onCheckedChange={setNotifyFollowers}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Replies and comments</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when someone replies to your content.
                  </p>
                </div>
                <Switch
                  checked={notifyComments}
                  onCheckedChange={setNotifyComments}
                />
              </div>
            </div>
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
