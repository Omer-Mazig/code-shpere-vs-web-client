import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useAuth } from "@/features/auth/auth.context";
import { MyProfile } from "@/features/users/components/my-profile";
import { UserProfile } from "@/features/users/components/user-profile";
import type { UserProfile as UserProfileType } from "@/features/users/types";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileTab } from "@/features/users/components/profile-shell";

export type ProfilePageOutletContext = {
  profileId: string;
  profile: UserProfileType;
  isOwnProfile: boolean;
};

export const useProfilePageContext = () =>
  useOutletContext<ProfilePageOutletContext>();

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const profileId = id ?? "";
  const isOwnProfile = isAuthenticated && user?.id === profileId;
  const tabs: ProfileTab[] = [
    { key: "posts", label: "Posts", to: "posts" },
    { key: "articles", label: "Articles", to: "articles" },
    { key: "followers", label: "Followers", to: "followers" },
    { key: "following", label: "Following", to: "following" },
    ...(isOwnProfile
      ? [{ key: "settings", label: "Settings", to: "settings" }]
      : []),
  ];

  const { data: profile, isLoading } = useQuery({
    ...(isOwnProfile
      ? usersQueryOptionsFactory.myProfile()
      : usersQueryOptionsFactory.profile(profileId)),
    enabled: Boolean(profileId),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6">
        {isOwnProfile ? (
          <MyProfile profile={profile} tabs={tabs}>
            <Outlet
              context={{
                profileId,
                profile,
                isOwnProfile: true,
              }}
            />
          </MyProfile>
        ) : (
          <UserProfile profile={profile} tabs={tabs}>
            <Outlet
              context={{
                profileId,
                profile,
                isOwnProfile: false,
              }}
            />
          </UserProfile>
        )}
      </div>
    </div>
  );
};
