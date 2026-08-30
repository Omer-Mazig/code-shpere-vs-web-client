import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "./types";

const PREFERENCE_KEYS = [
  "mentions",
  "comments",
  "likes",
  "newFollowers",
] as const;

export function buildNotificationPreferencesPatch(
  values: NotificationPreferences,
  loaded: NotificationPreferences,
): UpdateNotificationPreferencesDto {
  const dto: UpdateNotificationPreferencesDto = {};

  for (const key of PREFERENCE_KEYS) {
    if (values[key] !== loaded[key]) {
      dto[key] = values[key];
    }
  }

  return dto;
}

export function isNotificationPreferencesPatchEmpty(
  dto: UpdateNotificationPreferencesDto,
): boolean {
  return Object.keys(dto).length === 0;
}
