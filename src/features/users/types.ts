import type { components } from "@/lib/api-types";

export type UserProfile = Omit<
  components["schemas"]["UserProfileResponseDto"],
  "email"
> & {
  email?: string;
};

export type UpdateProfileDto = components["schemas"]["UpdateProfileDto"];
export type FollowUser = components["schemas"]["FollowUserResponseDto"];
