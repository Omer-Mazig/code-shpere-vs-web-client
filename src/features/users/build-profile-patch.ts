import type { ProfileSettingsFormValues } from "@/lib/form-schemas";
import type { UpdateProfileDto } from "./types";

const PROFILE_PATCH_FIELDS = [
  "displayName",
  "bio",
  "location",
  "website",
  "github",
  "avatarUrl",
] as const;

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
): UpdateProfileDto {
  const dto: UpdateProfileDto = {};

  for (const field of PROFILE_PATCH_FIELDS) {
    if (values[field] === loaded[field]) {
      continue;
    }
    const trimmed = values[field].trim();
    dto[field] = trimmed.length > 0 ? trimmed : null;
  }

  return dto;
}

export function isProfilePatchEmpty(dto: UpdateProfileDto): boolean {
  return Object.keys(dto).length === 0;
}
