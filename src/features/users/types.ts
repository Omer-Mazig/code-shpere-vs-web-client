import type { components } from "@/lib/api-types";

export type UserProfile = components["schemas"]["UserProfileResponseDto"];
export type UpdateProfileDto = components["schemas"]["UpdateProfileDto"];
export type FollowUser = components["schemas"]["FollowUserResponseDto"];
export type SuggestedUser = components["schemas"]["SuggestedUserResponseDto"];
export type UserPreview = components["schemas"]["UserPreviewResponseDto"];
export type NotificationPreferences =
  components["schemas"]["NotificationPreferencesResponseDto"];
export type UpdateNotificationPreferencesDto =
  components["schemas"]["UpdateNotificationPreferencesDto"];
