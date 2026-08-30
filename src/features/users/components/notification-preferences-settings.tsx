import { useSuspenseQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUpdateNotificationPreferences } from "../hooks/use-update-notification-preferences";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types";
import { usersQueryOptionsFactory } from "../users-query-options-factory";

const PREFERENCE_ROWS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "mentions",
    label: "Mentions",
    description: "When someone @mentions you in a post, article, or comment.",
  },
  {
    key: "comments",
    label: "Comments",
    description: "When someone comments on your content or replies to you.",
  },
  {
    key: "likes",
    label: "Likes",
    description: "When someone likes your posts.",
  },
  {
    key: "newFollowers",
    label: "New followers",
    description: "When someone follows you.",
  },
];

const NotificationPreferencesSkeleton = () => (
  <div className="space-y-4 rounded-lg border p-4">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-4 w-64" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-12 w-full"
        />
      ))}
    </div>
  </div>
);

const NotificationPreferencesSettingsContent = () => {
  const { data: prefs } = useSuspenseQuery(
    usersQueryOptionsFactory.notificationPreferences(),
  );
  const updatePrefs = useUpdateNotificationPreferences();

  const handleToggle = (
    key: keyof NotificationPreferences,
    checked: boolean,
  ) => {
    updatePrefs.mutate({
      [key]: checked,
    } as UpdateNotificationPreferencesDto);
  };

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium">Notifications</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose which activity creates an in-app notification. Changes save
        immediately.
      </p>

      <FieldGroup className="gap-4">
        {PREFERENCE_ROWS.map((row) => {
          const switchId = `notification-pref-${row.key}`;
          return (
            <Field
              key={row.key}
              orientation="horizontal"
            >
              <FieldContent>
                <FieldLabel htmlFor={switchId}>{row.label}</FieldLabel>
                <FieldDescription>{row.description}</FieldDescription>
              </FieldContent>
              <Switch
                id={switchId}
                checked={prefs[row.key]}
                disabled={updatePrefs.isPending}
                onCheckedChange={(checked) => handleToggle(row.key, checked)}
              />
            </Field>
          );
        })}
      </FieldGroup>
    </section>
  );
};

export const NotificationPreferencesSettings = () => (
  <QueryBoundary
    fallback={<NotificationPreferencesSkeleton />}
    ErrorFallback={InlineErrorFallback}
  >
    <NotificationPreferencesSettingsContent />
  </QueryBoundary>
);
