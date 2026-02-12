import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useAuth } from "@/features/auth/auth.context";
import { MyProfile } from "@/features/users/components/my-profile";
import { UserProfile } from "@/features/users/components/user-profile";
import type { UserProfile as UserProfileType } from "@/features/users/types";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileActiveTab } from "@/features/users/components/profile-shell";

type ProfilePageProps = {
  activeTab: ProfileActiveTab;
  children: (params: {
    profileId: string;
    profile: UserProfileType;
    isOwnProfile: boolean;
  }) => ReactNode;
};

export const ProfilePage = ({ activeTab, children }: ProfilePageProps) => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const profileId = id ?? "";
  const isOwnProfile = isAuthenticated && user?.id === profileId;

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
          <MyProfile profile={profile} activeTab={activeTab}>
            {children({
              profileId,
              profile,
              isOwnProfile,
            })}
          </MyProfile>
        ) : (
          <UserProfile profile={profile} activeTab={activeTab}>
            {children({
              profileId,
              profile,
              isOwnProfile,
            })}
          </UserProfile>
        )}
      </div>
    </div>
  );
};
