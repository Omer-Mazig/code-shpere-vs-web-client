import { useSuspenseQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { useUpdateNotificationPreferences } from "../hooks/use-update-notification-preferences";
import type { NotificationPreferences } from "../types";

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

const SettingsSectionSkeleton = () => (
  <Skeleton className="h-64 w-full rounded-xl" />
);

const NotificationPreferencesContent = () => {
  const { data: prefs } = useSuspenseQuery(
    usersQueryOptionsFactory.notificationPreferences(),
  );
  const updatePrefs = useUpdateNotificationPreferences();

  return (
    <NotificationPreferencesSettings
      values={prefs}
      onToggle={(key, checked) => updatePrefs.mutate({ [key]: checked })}
    />
  );
};

export const NotificationSettings = () => (
  <QueryBoundary
    fallback={<SettingsSectionSkeleton />}
    ErrorFallback={PageErrorFallback}
  >
    <NotificationPreferencesContent />
  </QueryBoundary>
);

type NotificationPreferencesSettingsProps = {
  values: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, checked: boolean) => void;
};

const NotificationPreferencesSettings = ({
  values,
  onToggle,
}: NotificationPreferencesSettingsProps) => (
  <section className="space-y-4 rounded-lg border p-4">
    <div className="flex items-center gap-2">
      <Bell className="h-4 w-4 text-muted-foreground" />
      <h2 className="font-medium">Notifications</h2>
    </div>
    <p className="text-sm text-muted-foreground">
      Changes save immediately. Choose which activity creates an in-app
      notification.
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
              checked={values[row.key]}
              onCheckedChange={(checked) => onToggle(row.key, checked)}
            />
          </Field>
        );
      })}
    </FieldGroup>
  </section>
);
