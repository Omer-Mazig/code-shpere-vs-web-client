import { Bell } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
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

type NotificationPreferencesSettingsProps = {
  values: NotificationPreferences;
  disabled?: boolean;
  onToggle: (key: keyof NotificationPreferences, checked: boolean) => void;
};

export const NotificationPreferencesSettings = ({
  values,
  disabled = false,
  onToggle,
}: NotificationPreferencesSettingsProps) => (
  <section className="space-y-4 rounded-lg border p-4">
    <div className="flex items-center gap-2">
      <Bell className="h-4 w-4 text-muted-foreground" />
      <h2 className="font-medium">Notifications</h2>
    </div>
    <p className="text-sm text-muted-foreground">
      Choose which activity creates an in-app notification.
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
              disabled={disabled}
              onCheckedChange={(checked) => onToggle(row.key, checked)}
            />
          </Field>
        );
      })}
    </FieldGroup>
  </section>
);
