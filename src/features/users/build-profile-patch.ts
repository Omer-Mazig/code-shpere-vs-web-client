import type { ProfileSettingsFormValues } from "@/lib/form-schemas";
import type { UpdateProfileDto } from "./types";

export const CLEARABLE_PROFILE_FIELDS = [
  "bio",
  "location",
  "website",
  "github",
  "avatarUrl",
] as const;

export type ClearableProfileField = (typeof CLEARABLE_PROFILE_FIELDS)[number];

export function profileFormValuesFromUser(profile: {
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  avatarUrl?: string | null;
}): ProfileSettingsFormValues {
  return {
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
    github: profile.github ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

export function buildProfilePatch(
  values: ProfileSettingsFormValues,
  loaded: ProfileSettingsFormValues,
  cleared: ReadonlySet<ClearableProfileField>,
): UpdateProfileDto {
  const dto: UpdateProfileDto = {};

  if (values.displayName !== loaded.displayName) {
    const trimmed = values.displayName.trim();
    if (trimmed.length > 0) {
      dto.displayName = trimmed;
    }
  }

  for (const field of CLEARABLE_PROFILE_FIELDS) {
    if (cleared.has(field)) {
      if (loaded[field].trim().length > 0) {
        dto[field] = null;
      }
      continue;
    }

    if (values[field] !== loaded[field]) {
      const trimmed = values[field].trim();
      if (trimmed.length > 0) {
        dto[field] = trimmed;
      }
    }
  }

  return dto;
}

export function isProfilePatchEmpty(dto: UpdateProfileDto): boolean {
  return Object.keys(dto).length === 0;
}
